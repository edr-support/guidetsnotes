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
    const report = generateMarkdown(activeSchema, answers);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Investigation Complete</h1>
              <p className="text-slate-400 text-sm">Copy the report below for your ticket.</p>
            </div>
            <button 
              onClick={() => setIsFinished(false)}
              className="text-slate-400 hover:text-white"
            >
              Back to Editor
            </button>
          </div>
          <div className="p-8">
            <pre className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-sm font-mono overflow-auto max-h-[500px] whitespace-pre-wrap">
              {report}
            </pre>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => handleCopy(report)}
                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
              >
                {copied ? "✓ Copied to Clipboard" : "Copy Markdown"}
              </button>
              <button 
                onClick={() => window.print()}
                className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Print to PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex no-print">
         <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-600">SupportGuide</h1>
        </div>
        <nav className="p-4 space-y-2">
          {activeSchema.steps.map((step, idx) => (
            <button
              key={step.id}
              disabled={!canAccessStep(idx)}
              onClick={() => goToStep(idx)}
              className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                currentStepIndex === idx ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              } disabled:opacity-30`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                currentStepIndex === idx ? 'bg-blue-500 border-blue-400' : 'border-slate-200'
              }`}>
                {idx + 1}
              </span>
              {step.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Form Content - Now Properly Centered */}
      <main className="flex-1 flex flex-col items-center bg-slate-50 overflow-y-auto py-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-10">
            <FormRenderer />
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t flex justify-between items-center rounded-b-2xl">
            <button 
              onClick={prevStep} 
              disabled={currentStepIndex === 0} 
              className="px-4 text-slate-500 font-medium disabled:opacity-0 transition-all"
            >
              Back
            </button>
            <div className="flex gap-4">
              {currentStepIndex < activeSchema.steps.length - 1 ? (
                <button 
                  onClick={nextStep} 
                  disabled={!isStepComplete(currentStepIndex)} 
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  onClick={() => setIsFinished(true)}
                  disabled={!isStepComplete(currentStepIndex)} 
                  className="px-8 py-2 bg-green-600 text-white font-bold rounded-xl shadow-md disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;