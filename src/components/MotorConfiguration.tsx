import { Zap } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';
import { MotorType } from '../types/rocket';

export function MotorConfiguration() {
  const { rocketParams, setRocketParams } = useRocketStore();

  const motorTypes: MotorType[] = ['A8-3', 'B6-4', 'C6-5', 'D12-7', 'E9-6'];
  
  const getMotorImpulse = (type: MotorType): number => {
    const impulseMap: Record<MotorType, number> = {
      'A8-3': 2.5,
      'B6-4': 5.0,
      'C6-5': 10.0,
      'D12-7': 20.0,
      'E9-6': 40.0
    };
    return impulseMap[type];
  };

  const handleMotorChange = (type: MotorType) => {
    setRocketParams({
      motorType: type,
      motorImpulse: getMotorImpulse(type)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5" />
        <h2 className="text-2xl font-bold text-black">Motor Configuration</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-black">Motor Type</label>
          <select
            value={rocketParams.motorType}
            onChange={(e) => handleMotorChange(e.target.value as MotorType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
          >
            {motorTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-black">Total Impulse (N⋅s)</label>
          <input
            type="number"
            value={rocketParams.motorImpulse}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-black"
          />
        </div>
      </div>
    </div>
  );
}