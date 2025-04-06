import { Brain } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';

export function AIAnalysis() {
  const { aiAnalysis } = useRocketStore();

  if (!aiAnalysis) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-black">AI Analysis</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-black">Stability Analysis</h3>
          <p className="mt-2 text-sm text-gray-700">{aiAnalysis.stabilityAnalysis}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">Performance Analysis</h3>
          <p className="mt-2 text-sm text-gray-700">{aiAnalysis.performanceAnalysis}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">Safety Recommendations</h3>
          <p className="mt-2 text-sm text-gray-700">{aiAnalysis.safetyRecommendations}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">Optimization Suggestions</h3>
          <p className="mt-2 text-sm text-gray-700">{aiAnalysis.optimizationSuggestions}</p>
        </div>
      </div>
    </div>
  );
}