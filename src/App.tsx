import { useState, useEffect } from 'react';
import { useInvestigationStore } from './store/useInvestigationStore';
import { FormRenderer } from './components/FormRenderer';
import { generateMarkdown } from './lib/exportUtils';
// @ts-ignore
import resourceUsageSchema from './templates/resource-usage.json';

function App() {
  const { 
    setSchema, currentStepIndex, nextStep, prevStep, 
    isStepComplete, canAccessStep, activeSchema, answers, goToStep 
  } = useInvestigationStore();

  const [isFinished, setIsFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (resourceUsageSchema) {
      setSchema(resourceUsageSchema);
    }
  }, [setSchema]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeSchema) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-slate-400 animate-pulse">Loading Investigation Template...</p>
    </div>
  );

  if (isFinished) {
    const markdownText = generateMarkdown(activeSchema, answers);
    return (
      <div className="flex flex-col items-center min-h-screen bg-slate-100 p-8 font-sans">
        <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
          <button onClick={() => setIsFinished(false)} className="text-blue-600 font-bold hover:underline">← Back to Editor</button>
          <div className="flex gap-4">
            <button onClick={() => handleCopy(markdownText)} className="bg-white border px-6 py-2 rounded-xl shadow-sm font-bold text-sm hover:bg-slate-50">
              {copied ? "✓ Copied Markdown" : "Copy Markdown"}
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md font-bold text-sm hover:bg-blue-700">
              Print to PDF
            </button>
          </div>
        </div>

        <div className="bg-white w-full max-w-4xl p-12 shadow-2xl rounded-3xl border border-slate-200">
          <header className="border-b-8 border-blue-600 pb-6 mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">{activeSchema.title}</h1>
            <p className="text-slate-500 font-medium">Internal Support Investigation Report</p>
          </header>
          
          <div className="space-y-12">
            {activeSchema.steps.map(step => {
              const hasAnswers = step.fields?.some(f => answers[f.id]);
              if (!hasAnswers) return null;
              return (
                <div key={step.id} className="break-inside-avoid">
                  <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 bg-blue-50 inline-block px-3 py-1 rounded-full">{step.title}</h2>
                  <div className="space-y-8 border-l-4 border-slate-100 pl-8 ml-2">
                    {step.fields.map(field => {
                      const val = answers[field.id];
                      if (!val) return null;
                      return (
                        <div key={field.id}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{field.label}</p>
                          {field.type === 'image' ? (
                            <img src={val} className="mt-2 rounded-2xl border-2 border-slate-100 shadow-xl max-h-[500px]" alt="evidence" />
                          ) : field.type === 'code' ? (
                            <pre className="mt-2 bg-slate-900 text-slate-200 p-6 rounded-2xl text-xs font-mono overflow-auto">{val}</pre>
                          ) : (
                            <p className="text-slate-800 font-bold text-xl leading-snug">{val}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .shadow-2xl { box-shadow: none !important; border: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className="w-80 bg-white border-r hidden lg:flex flex-col no-print">
        <div className="p-8 border-b"><h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">SupportGuide</h1></div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {activeSchema.steps.map((step, idx) => (
            <button key={step.id} onClick={() => goToStep(idx)} disabled={!canAccessStep(idx)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${
                currentStepIndex === idx ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'
              } disabled:opacity-20`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStepIndex === idx ? 'bg-white/20' : 'bg-slate-100'}`}>{idx+1}</span>
              <span className="font-bold">{step.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 grid place-items-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden">
          <div className="p-14">
            <FormRenderer />
          </div>
          <div className="px-12 py-8 bg-slate-50/50 border-t flex justify-between items-center">
            <button onClick={prevStep} disabled={currentStepIndex === 0} className="text-slate-400 font-bold disabled:opacity-0 transition-opacity">Back</button>
            <div className="flex items-center gap-6">
              {currentStepIndex < activeSchema.steps.length - 1 ? (
                <button onClick={nextStep} disabled={!isStepComplete(currentStepIndex)} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 disabled:bg-slate-200 transition-all">Next Step</button>
              ) : (
                <button onClick={() => setIsFinished(true)} disabled={!isStepComplete(currentStepIndex)} className="bg-green-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg hover:bg-green-700 disabled:bg-slate-200 transition-all">Generate Report</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;