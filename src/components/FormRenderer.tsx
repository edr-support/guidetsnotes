import { useInvestigationStore } from '../store/useInvestigationStore';

export const FormRenderer = () => {
  const { activeSchema, currentStepIndex, answers, setAnswer } = useInvestigationStore();

  // 1. Check if schema exists
  if (!activeSchema || !activeSchema.steps) return null;
  
  // 2. Get the current step
  const step = activeSchema.steps[currentStepIndex];
  
  // 3. If step doesn't exist, show error
  if (!step) {
    return <div className="text-red-500 font-bold">Step data missing for index: {currentStepIndex}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{step.title}</h2>
        {step.description && <p className="text-slate-500 text-sm mt-1">{step.description}</p>}
      </div>

      {/* 4. Render fields only if they exist */}
      {(step.fields && step.fields.length > 0) ? (
        step.fields.map((field) => (
          <div key={field.id} className="flex flex-col space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                className="border border-slate-200 p-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50/50"
                value={answers[field.id] || ''}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'select' && (
              <select
                className="border border-slate-200 p-4 rounded-2xl bg-slate-50/50 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 appearance-none"
                value={answers[field.id] || ''}
                onChange={(e) => setAnswer(field.id, e.target.value)}
              >
                <option value="">Select an option...</option>
                {(field.options || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {(field.type === 'textarea' || field.type === 'code') && (
              <textarea
                className={`border border-slate-200 p-4 rounded-2xl h-40 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50/50 ${field.type === 'code' ? 'font-mono text-sm' : ''}`}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswer(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

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
                    <img src={answers[field.id]} alt="Preview" className="h-48 rounded-2xl border-2 border-blue-50 shadow-lg" />
                    <button 
                      onClick={() => setAnswer(field.id, null)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
                    >✕</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-slate-400 italic">
          No questions defined for this step.
        </div>
      )}
    </div>
  );
};