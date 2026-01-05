import { useInvestigationStore } from '../store/useInvestigationStore';

export const FormRenderer = () => {
  const { activeSchema, currentStepIndex, answers, setAnswer } = useInvestigationStore();

  if (!activeSchema || !activeSchema.steps) {
    return <div className="p-4 text-gray-500">Loading form structure...</div>;
  }

  const step = activeSchema.steps[currentStepIndex];

  // SAFETY CHECK: If the step doesn't exist, show an error instead of crashing
  if (!step) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-red-200 rounded-2xl">
        <p className="text-red-500 font-bold">Error: Step {currentStepIndex + 1} not found in schema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{step.title}</h2>
        <p className="text-slate-500 text-sm mt-1">{step.description}</p>
      </div>

      {/* SAFETY CHECK: Ensure fields is an array before calling .map() */}
      {(step.fields || []).map((field) => (
        <div key={field.id} className="flex flex-col space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            {field.label} 
            {field.required && <span className="text-red-500" title="Required">*</span>}
          </label>

          {/* TEXT INPUT */}
          {field.type === 'text' && (
            <input
              type="text"
              className="border border-slate-200 p-3 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          )}

          {/* SELECT INPUT */}
          {field.type === 'select' && (
            <select
              className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
            >
              <option value="">Select an option...</option>
              {(field.options || []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {/* TEXTAREA & CODE */}
          {(field.type === 'textarea' || field.type === 'code') && (
            <textarea
              className={`border border-slate-200 p-4 rounded-xl h-40 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-slate-50/50 ${
                field.type === 'code' ? 'font-mono text-sm' : ''
              }`}
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          )}

          {/* IMAGE UPLOADER */}
          {field.type === 'image' && (
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setAnswer(field.id, reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {answers[field.id] && (
                <div className="relative inline-block">
                  <img src={answers[field.id]} alt="Preview" className="h-40 rounded-xl border-2 border-blue-50 shadow-md" />
                  <button 
                    onClick={() => setAnswer(field.id, null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-lg"
                  >✕</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};