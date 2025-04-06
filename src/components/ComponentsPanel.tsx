import { Layers, Ruler } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';
import { NoseConeType, FinType, MaterialType, RecoveryType } from '../types/rocket';

export function ComponentsPanel() {
  const { rocketParams, setRocketParams, unitSystem, convertValue } = useRocketStore();

  const noseConeTypes: NoseConeType[] = ['ogive', 'conical', 'parabolic', 'elliptical'];
  const finTypes: FinType[] = ['trapezoidal', 'elliptical', 'rectangular', 'triangular'];
  const materials: MaterialType[] = ['cardboard', 'aluminum', 'fiberglass', 'carbon_fiber', 'plastic'];
  const recoveryTypes: RecoveryType[] = ['parachute', 'streamer', 'dual_deploy'];

  // Function to format number to 3 significant figures
  const formatValue = (value: number) => {
    return Number(value.toPrecision(3));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5" />
        <h2 className="text-2xl font-bold text-black">Components</h2>
      </div>

      {/* Nose Cone Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Nose Cone</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-black">Type</label>
            <select
              value={rocketParams.noseConeType}
              onChange={(e) => setRocketParams({ noseConeType: e.target.value as NoseConeType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              {noseConeTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-black">Material</label>
            <select
              value={rocketParams.materials.noseCone}
              onChange={(e) => setRocketParams({
                materials: { ...rocketParams.materials, noseCone: e.target.value as MaterialType }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-black">Length</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.noseLength, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                noseLength: convertValue(Number(e.target.value), unitSystem, 'm')
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Thickness</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.thickness.noseCone, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                thickness: {
                  ...rocketParams.thickness,
                  noseCone: convertValue(Number(e.target.value), unitSystem, 'm')
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
      </section>

      {/* Fins Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Fins</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-black">Type</label>
            <select
              value={rocketParams.finType}
              onChange={(e) => setRocketParams({ finType: e.target.value as FinType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              {finTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-black">Material</label>
            <select
              value={rocketParams.materials.fins}
              onChange={(e) => setRocketParams({
                materials: { ...rocketParams.materials, fins: e.target.value as MaterialType }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-black">Number of Fins</label>
            <input
              type="number"
              value={rocketParams.numFins}
              onChange={(e) => setRocketParams({ numFins: Number(e.target.value) })}
              min={2}
              max={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Thickness</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.thickness.fins, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                thickness: {
                  ...rocketParams.thickness,
                  fins: convertValue(Number(e.target.value), unitSystem, 'm')
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Length (Root Chord)</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.finRootChord, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                finRootChord: convertValue(Number(e.target.value), unitSystem, 'm')
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Width (Span)</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.finSpan, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                finSpan: convertValue(Number(e.target.value), unitSystem, 'm')
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
      </section>

      {/* Body Tube Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Body Tube</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-black">Material</label>
            <select
              value={rocketParams.materials.bodyTube}
              onChange={(e) => setRocketParams({
                materials: { ...rocketParams.materials, bodyTube: e.target.value as MaterialType }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-black">Thickness</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.thickness.bodyTube, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                thickness: {
                  ...rocketParams.thickness,
                  bodyTube: convertValue(Number(e.target.value), unitSystem, 'm')
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Length</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.length, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                length: convertValue(Number(e.target.value), unitSystem, 'm')
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Diameter</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.diameter, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                diameter: convertValue(Number(e.target.value), unitSystem, 'm')
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
      </section>

      {/* Recovery System Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-black">Recovery System</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-black">Type</label>
            <select
              value={rocketParams.recoverySystem.type}
              onChange={(e) => setRocketParams({
                recoverySystem: { ...rocketParams.recoverySystem, type: e.target.value as RecoveryType }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              {recoveryTypes.map((type) => (
                <option key={type} value={type}>
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          {rocketParams.recoverySystem.type === 'parachute' && (
            <div>
              <label className="block text-sm text-black">Parachute Size</label>
              <input
                type="number"
                value={formatValue(convertValue(rocketParams.recoverySystem.parachuteSize || 0, 'm', unitSystem))}
                onChange={(e) => setRocketParams({
                  recoverySystem: {
                    ...rocketParams.recoverySystem,
                    parachuteSize: convertValue(Number(e.target.value), unitSystem, 'm')
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-black">Shock Cord Length</label>
            <input
              type="number"
              value={formatValue(convertValue(rocketParams.recoverySystem.shockCordLength || 0, 'm', unitSystem))}
              onChange={(e) => setRocketParams({
                recoverySystem: {
                  ...rocketParams.recoverySystem,
                  shockCordLength: convertValue(Number(e.target.value), unitSystem, 'm')
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-black">Ejection Charge</label>
            <input
              type="number"
              value={formatValue(rocketParams.recoverySystem.ejectionCharge || 0)}
              onChange={(e) => setRocketParams({
                recoverySystem: {
                  ...rocketParams.recoverySystem,
                  ejectionCharge: Number(e.target.value)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
      </section>
    </div>
  );
}