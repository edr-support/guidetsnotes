import { useState, useEffect } from 'react';
import { useInvestigationStore } from './store/useInvestigationStore';
import { FormRenderer } from './components/FormRenderer';
import { InvestigationSchema } from './types/schema';
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
    setSchema(resourceUsageSchema as InvestigationSchema);
  }, [setSchema]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeSchema) return null;

  if (isFinished) {
    const reportMd = generateMarkdown(activeSchema, answers);
    return (
      <div className="flex flex-col items-center min-h-screen bg-slate-100 p-4 sm:p-10">
        <div className="w-full max-w-4xl flex justify-between mb-4 no-print">
          <button onClick={() => setIsFinished(false)} className="text-blue-600 font-bold">← Edit Answers</button>
          <div className="flex gap-2">
            <button onClick={() => handleCopy(reportMd)} className="bg-white border px-4 py-2 rounded shadow-sm text-sm">
              {copied ? "✓ Copied" : "Copy Markdown"}
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm text-sm font-bold">
              Print to PDF
            </button>
          </div>
        </div>

        {/* This is the visual report that includes images */}
        <div className="bg-white w-full max-w-4xl p-12 shadow-xl rounded-xl border border-slate-200">
          <h1 className="text-3xl font-bold border-b-4 border-blue-600 pb-4 mb-8">{activeSchema.title}</h1>
          <div className="space-y-10">
            {activeSchema.steps.map(step => (
              <div key={step.id} className="page-break-inside-avoid">
                <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">{step.title}</h2>
                <div className="space-y-6 border-l-2 border-slate-100 pl-6">
                  {step.fields.map(field => {
                    const val = answers[field.id];
                    if (!val) return null;
                    return (
                      <div key={field.id}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{field.label}</p>
                        {field.type === 'image' ? (
                          <img src={val} className="mt-2 rounded-lg border max-h-96" alt="evidence" />
                        ) : field.type === 'code' ? (
                          <pre className="mt-2 bg-slate-900 text-white p-4 rounded text-xs">{val}</pre>
                        ) : (
                          <p className="text-slate-800 font-medium">{val}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .shadow-xl { box-shadow: none !important; border: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-72 bg-white border-r hidden md:flex flex-col no-print">
        <div className="p-6 border-b"><h1 className="text-xl font-black text-blue-600">SupportGuide</h1></div>
        <nav className="p-4 space-y-1">
          {activeSchema.steps.map((step, idx) => (
            <button key={step.id} onClick={() => goToStep(idx)} disabled={!canAccessStep(idx)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                currentStepIndex === idx ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              } disabled:opacity-30`}>
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">{idx+1}</span>
              {step.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 grid place-items-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-10">
            <FormRenderer />
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t flex justify-between items-center">
            <button onClick={prevStep} disabled={currentStepIndex === 0} className="text-slate-400 font-bold disabled:opacity-0">Back</button>
            {currentStepIndex < activeSchema.steps.length - 1 ? (
              <button onClick={nextStep} disabled={!isStepComplete(currentStepIndex)} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg disabled:bg-slate-200">Next</button>
            ) : (
              <button onClick={() => setIsFinished(true)} disabled={!isStepComplete(currentStepIndex)} className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg disabled:bg-slate-200">Finish</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;