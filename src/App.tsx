import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Rocket, Activity, LineChart, Printer } from 'lucide-react';
import { DesignPage } from './pages/DesignPage';
import { SimulationPage } from './pages/SimulationPage';
import { ResultsPage } from './pages/ResultsPage';
import { ManufacturingPage } from './pages/ManufacturingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 p-4 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">RockCAD</h1>
            <div className="flex gap-6">
              <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Rocket className="w-5 h-5" />
                Design
              </Link>
              <Link to="/simulation" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Activity className="w-5 h-5" />
                Simulation
              </Link>
              <Link to="/results" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <LineChart className="w-5 h-5" />
                Results
              </Link>
              <Link to="/manufacturing" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Printer className="w-5 h-5" />
                Manufacturing
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-6 pt-8">
          <Routes>
            <Route path="/" element={<DesignPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/manufacturing" element={<ManufacturingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;