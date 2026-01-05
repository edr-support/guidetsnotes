import { HashRouter, Routes, Route, Link } from 'react-router-dom';

// Simple placeholders to prove navigation works without a server
const Home = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold">Static Support Hub</h1>
    <Link to="/form/cpu-high" className="text-blue-500 underline">
      Open CPU Investigation
    </Link>
  </div>
);

const FormRunner = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold">Form Runner</h1>
    <p>Logic loads here. (Refresh me, I still work!)</p>
  </div>
);

function App() {
  return (
    // HashRouter is the key. It uses the # symbol in the URL.
    // The server ignores everything after #, so it always serves index.html.
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form/:id" element={<FormRunner />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
