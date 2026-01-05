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
    const markdownReport = generateMarkdown(activeSchema, answers);
    return (
      <div className="flex flex-col items-center min-h-screen bg-slate-100 p-6 sm:p-12">
        {/* Actions Header - Hidden during print */}
        <div className="w-full max-w-4xl mb-6 flex justify-between items-center no-print">
          <button 
            onClick={() => setIsFinished(false)}
            className="text-slate-600 font-semibold hover:text-blue-600 transition-colors"
          >
            ← Back to Editor
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => handleCopy(markdownReport)}
              className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-all"
            >
              {copied ? "✓ Copied" : "Copy Markdown"}
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              Print to PDF
            </button>
          </div>
        </div>

        {/* The Visual Report - This renders images for the PDF */}
        <div className="print-report w-full max-w-4xl bg-white shadow-2xl rounded-2xl border border-slate-200 p-12">
          <header className="border-b-4 border-blue-600 pb-6 mb-10">
            <h1 className="text-3xl font-bold text-slate-900">{activeSchema.title}</h1>
            <p className="text-slate-500 mt-2 font-medium">Investigation Summary Report</p>
          </header>

          <div className="space-y-12">
            {activeSchema.steps.map((step) => {
              const hasAnswers = step.fields.some(f => answers[f.id]);
              if (!hasAnswers) return null;

              return (
                <section key={step.id} className="break-inside-avoid">
                  <h2 className="text-xl font-bold text-blue-800 mb-6 bg-blue-50/50 p-2 rounded uppercase text-sm tracking-tight">
                    {step.title}
                  </h2>
                  <div className="grid gap-6 pl-4 border-l-2 border-slate-100">
                    {step.fields.map((field) => {
                      const value = answers[field.id];
                      if (!value) return null;

                      return (
                        <div key={field.id} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {field.label}
                          </label>
                          {field.type === 'image' ? (
                            <div className="mt-2 max-w-xl">
                              <img src={value} alt="Evidence" className="rounded-lg border shadow-sm w-full h-auto" />
                            </div>
                          ) : field.type === 'code' ? (
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                              {value}
                            </pre>
                          ) : (
                            <p className="text-slate-800 font-medium whitespace-pre-wrap">{value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden lg:flex no-print shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">SupportGuide</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Diagnostic Tool</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {activeSchema.steps.map((step, idx) => (
            <button
              key={step.id}
              disabled={!canAccessStep(idx)}
              onClick={() => goToStep(idx)}
              className={`w-full text-left p-4 rounded-xl text-sm transition-all flex items-center gap-4 ${
                currentStepIndex === idx 
                  ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' 
                  : 'text-slate-500 hover:bg-slate-50'
              } disabled:opacity-20`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                currentStepIndex === idx ? 'bg-blue-500 border-blue-400' : 'bg-slate-100'
              }`}>
                {idx + 1}
              </span>
              <span className="font-bold truncate">{step.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area - Form is Centered Here */}
      <main className="flex-1 overflow-y-auto grid place-items-center bg-slate-50">
        <div className="w-full max-w-2xl px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-12">
              <FormRenderer />
            </div>
            
            <div className="px-10 py-8 bg-slate-50 border-t flex justify-between items-center">
              <button onClick={prevStep} disabled={currentStepIndex === 0} className="px-6 py-2 text-slate-400 font-bold disabled:opacity-0">
                Back
              </button>
              <div className="flex items-center gap-6">
                {currentStepIndex < activeSchema.steps.length - 1 ? (
                  <button 
                    onClick={nextStep} 
                    disabled={!isStepComplete(currentStepIndex)} 
                    className="px-10 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsFinished(true)}
                    disabled={!isStepComplete(currentStepIndex)} 
                    className="px-12 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg disabled:bg-slate-200"
                  >
                    Generate Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;