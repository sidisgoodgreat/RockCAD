import { SimulationResults } from '../components/SimulationResults';
import { FlightGraphs } from '../components/FlightGraphs';
import { AIAnalysis } from '../components/AIAnalysis';

export function ResultsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <SimulationResults />
        <AIAnalysis />
      </div>
      <FlightGraphs />
    </div>
  );
}