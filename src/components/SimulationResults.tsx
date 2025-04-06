import { Activity } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';

export function SimulationResults() {
  const { simulationResults, unitSystem, convertValue } = useRocketStore();

  if (!simulationResults) return null;

  const formatValue = (value: number | undefined, unit: string) => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-black">Simulation Results</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black">Max Altitude (Apogee)</label>
          <div className="mt-1 text-lg font-medium text-black">
            {formatValue(simulationResults.maxAltitude && convertValue(simulationResults.maxAltitude, 'm', unitSystem), unitSystem)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Max Velocity</label>
          <div className="mt-1 text-lg font-medium text-black">
            {formatValue(simulationResults.maxVelocity, 'm/s')}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Flight Time</label>
          <div className="mt-1 text-lg font-medium text-black">
            {formatValue(simulationResults.flightTime, 's')}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Stability Margin</label>
          <div className="mt-1 text-lg font-medium text-black">
            {formatValue(simulationResults.stabilityMargin, 'calibers')}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-black">Center of Mass</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black">X</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfMass?.x && convertValue(simulationResults.centerOfMass.x, 'm', unitSystem), unitSystem)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Y</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfMass?.y && convertValue(simulationResults.centerOfMass.y, 'm', unitSystem), unitSystem)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Z</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfMass?.z && convertValue(simulationResults.centerOfMass.z, 'm', unitSystem), unitSystem)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-black">Center of Gravity</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black">X</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfGravity?.x && convertValue(simulationResults.centerOfGravity.x, 'm', unitSystem), unitSystem)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Y</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfGravity?.y && convertValue(simulationResults.centerOfGravity.y, 'm', unitSystem), unitSystem)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Z</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfGravity?.z && convertValue(simulationResults.centerOfGravity.z, 'm', unitSystem), unitSystem)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-black">Center of Pressure</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black">X</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfPressure?.x && convertValue(simulationResults.centerOfPressure.x, 'm', unitSystem), unitSystem)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Y</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfPressure?.y && convertValue(simulationResults.centerOfPressure.y, 'm', unitSystem), unitSystem)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Z</label>
            <div className="mt-1 text-lg font-medium text-black">
              {formatValue(simulationResults.centerOfPressure?.z && convertValue(simulationResults.centerOfPressure.z, 'm', unitSystem), unitSystem)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}