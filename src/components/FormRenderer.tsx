import { useInvestigationStore } from '../store/useInvestigationStore';

export const FormRenderer = () => {
  const { activeSchema, currentStepIndex, answers, setAnswer } = useInvestigationStore();

  if (!activeSchema) return <div className="p-4 text-gray-500">No active form found.</div>;

  const step = activeSchema.steps[currentStepIndex];

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">{step.title}</h2>
        <p className="text-gray-500 text-sm">{step.description}</p>
      </div>

      {step.fields.map((field) => (
        <div key={field.id} className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {/* TEXT INPUT */}
          {field.type === 'text' && (
            <input
              type="text"
              className="border border-gray-300 p-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          )}

          {/* SELECT INPUT */}
          {field.type === 'select' && (
            <select
              className="border border-gray-300 p-2 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
            >
              <option value="">Select an option...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {/* TEXTAREA & CODE INPUT */}
          {(field.type === 'textarea' || field.type === 'code') && (
            <textarea
              className={`border border-gray-300 p-2 rounded h-32 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                field.type === 'code' ? 'font-mono text-sm bg-gray-50' : ''
              }`}
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          )}

          {/* IMAGE UPLOADER */}
          {field.type === 'image' && (
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAnswer(field.id, reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {answers[field.id] && (
                <div className="mt-2 relative inline-block group">
                  <img 
                    src={answers[field.id]} 
                    alt="Preview" 
                    className="h-48 w-auto rounded border-2 border-blue-100 shadow-md transition-transform group-hover:scale-[1.02]" 
                  />
                  <button 
                    onClick={() => setAnswer(field.id, null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors"
                    title="Remove Image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
