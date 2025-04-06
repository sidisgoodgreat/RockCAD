import { Rocket, Wind, Ruler, Save, Upload } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';
import { ComponentsPanel } from './ComponentsPanel';
import { MotorConfiguration } from './MotorConfiguration';

export function ControlPanel() {
  const {
    unitSystem,
    setUnitSystem,
    exportDesign,
    importDesign,
  } = useRocketStore();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDesign(file).catch(console.error);
    }
  };

  const unitOptions = ['mm', 'cm', 'm', 'inch', 'ft'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-[420px] max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-black">
          <Rocket className="w-6 h-6" /> Rocket Design
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportDesign}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
            title="Export Design"
          >
            <Save className="w-5 h-5" />
          </button>
          <label className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <input type="file" className="hidden" onChange={handleImport} accept=".json" />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black">Unit System</label>
        <select
          value={unitSystem}
          onChange={(e) => setUnitSystem(e.target.value as any)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
        >
          {unitOptions.map((unit) => (
            <option key={unit} value={unit}>
              {unit.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-8">
        <ComponentsPanel />
        <MotorConfiguration />
      </div>
    </div>
  );
}