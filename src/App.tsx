// src/App.tsx
import { useInvestigationStore } from './store/useInvestigationStore';

function App() {
  const { answers, setAnswer, isStepComplete } = useInvestigationStore();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Commit 2 Verification</h1>
      
      <div className="space-y-4 border p-4 rounded bg-gray-50">
        <div>
          <label className="block font-bold">Test Field (Required):</label>
          <input 
            className="border p-2 w-full"
            onChange={(e) => setAnswer('test_field', e.target.value)} 
            placeholder="Type something..."
          />
        </div>

        <div className="mt-4 p-4 rounded bg-white border">
          <p><strong>Store Answers:</strong> {JSON.stringify(answers)}</p>
          <p className="mt-2">
            <strong>Logic Check:</strong> Is Step Complete? 
            <span className={answers['test_field'] ? "text-green-600 font-bold" : "text-red-600"}>
               {answers['test_field'] ? " YES" : " NO (Required field empty)"}
            </span>
          </p>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 italic">
        If the "YES" toggles when you type, your Zustand store and logic are working perfectly.
      </p>
    </div>
  );
}

export default App;
