import React from 'react';
import { Sliders, Play, RotateCcw } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';

export function SimulationControls() {
  const { simParams, setSimParams, startSimulation, isSimulating } = useRocketStore();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-black">Simulation Controls</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-lg font-medium text-black">
            Launch Angle (0° horizontal, 90° vertical)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={simParams.launchAngle}
              onChange={(e) => setSimParams({ launchAngle: Number(e.target.value) })}
              min="0"
              max="90"
              step="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xl font-medium text-black min-w-[4rem]">
              {simParams.launchAngle}°
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {simParams.launchAngle === 90 
              ? "Vertical launch" 
              : simParams.launchAngle === 0 
                ? "Horizontal launch (not recommended)" 
                : `${simParams.launchAngle}° from horizontal`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => startSimulation()}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-lg font-medium"
          >
            <Play className="w-5 h-5" />
            Run Simulation
          </button>
          <button
            onClick={() => setSimParams({ launchAngle: 85 })}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}