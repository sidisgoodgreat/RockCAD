import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useState } from 'react';
import { Printer, Scissors, Download } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';
import { RocketComponent } from '../components/RocketComponent';
import { saveAs } from 'file-saver';

type ComponentType = 'noseCone' | 'bodyTube' | 'fins';

export function ManufacturingPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('noseCone');
  const rocketParams = useRocketStore((state) => state.rocketParams);

  const getMaterialGuidelines = (material: string) => {
    switch (material) {
      case 'cardboard':
        return {
          printing: {
            material: 'Cardboard-like PLA',
            layerHeight: '0.3mm',
            infill: '15%',
            temperature: '190-210°C',
          },
          cutting: {
            material: 'Cardboard',
            thickness: '2-3mm',
            power: '20-40%',
            speed: '30-40mm/s',
            kerf: '0.2mm',
            passes: '2-3',
            notes: 'Use low power to prevent scorching'
          }
        };
      case 'aluminum':
        return {
          printing: {
            material: 'Metal-filled PLA',
            layerHeight: '0.1mm',
            infill: '40%',
            temperature: '210-230°C',
          },
          cutting: {
            material: 'Aluminum Sheet',
            thickness: '1-2mm',
            power: '100%',
            speed: '2-5mm/s',
            kerf: '0.1mm',
            passes: '3-4',
            notes: 'Requires high power CO2 laser'
          }
        };
      case 'fiberglass':
        return {
          printing: {
            material: 'Glass-filled Nylon',
            layerHeight: '0.2mm',
            infill: '30%',
            temperature: '240-260°C',
          },
          cutting: {
            material: 'Fiberglass Sheet',
            thickness: '1.5-2.5mm',
            power: '90-100%',
            speed: '3-8mm/s',
            kerf: '0.15mm',
            passes: '2-3',
            notes: 'Proper ventilation required'
          }
        };
      case 'carbon_fiber':
        return {
          printing: {
            material: 'Carbon Fiber PLA',
            layerHeight: '0.15mm',
            infill: '50%',
            temperature: '230-250°C',
          },
          cutting: {
            material: 'Carbon Fiber Sheet',
            thickness: '1-2mm',
            power: '80-100%',
            speed: '5-10mm/s',
            kerf: '0.12mm',
            passes: '2',
            notes: 'Wear protective gear'
          }
        };
      case 'plastic':
        return {
          printing: {
            material: 'PLA or PETG',
            layerHeight: '0.2mm',
            infill: '20%',
            temperature: '200-220°C',
          },
          cutting: {
            material: 'Acrylic Sheet',
            thickness: '2-3mm',
            power: '40-60%',
            speed: '15-25mm/s',
            kerf: '0.18mm',
            passes: '1',
            notes: 'Good for transparent parts'
          }
        };
      default:
        return {
          printing: {
            material: 'PLA',
            layerHeight: '0.2mm',
            infill: '20%',
            temperature: '200-220°C',
          },
          cutting: {
            material: 'Generic Material',
            thickness: '2-3mm',
            power: '50%',
            speed: '20mm/s',
            kerf: '0.15mm',
            passes: '1-2',
            notes: 'Adjust settings as needed'
          }
        };
    }
  };

  const getSelectedMaterial = () => {
    switch (selectedComponent) {
      case 'noseCone':
        return rocketParams.materials.noseCone;
      case 'bodyTube':
        return rocketParams.materials.bodyTube;
      case 'fins':
        return rocketParams.materials.fins;
      default:
        return rocketParams.materials.noseCone;
    }
  };

  const guidelines = getMaterialGuidelines(getSelectedMaterial());

  const downloadSTL = (component: ComponentType) => {
    const fileName = `rocket-${component}.stl`;
    const blob = new Blob(['STL file content'], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  const downloadSVG = (component: ComponentType) => {
    const fileName = `rocket-${component}.svg`;
    const blob = new Blob(['SVG file content'], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  return (
    <div className="flex gap-6">
      <div className="w-[420px] space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-black mb-6">Manufacturing Options</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Select Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value as ComponentType)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              >
                <option value="noseCone">Nose Cone</option>
                <option value="bodyTube">Body Tube</option>
                <option value="fins">Fins</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">3D Printing Guidelines</h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => downloadSTL(selectedComponent)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Download STL
                </button>
                <div className="text-sm text-gray-600">
                  <h4 className="font-medium">Material-Specific Settings:</h4>
                  <ul className="list-disc list-inside mt-2">
                    <li>Recommended Material: {guidelines.printing.material}</li>
                    <li>Layer Height: {guidelines.printing.layerHeight}</li>
                    <li>Infill Density: {guidelines.printing.infill}</li>
                    <li>Nozzle Temperature: {guidelines.printing.temperature}</li>
                    <li>Support: Required for overhangs &gt; 45°</li>
                    <li>Bed Temperature: {
                      getSelectedMaterial() === 'carbon_fiber' ? '70-80°C' :
                      getSelectedMaterial() === 'fiberglass' ? '80-90°C' :
                      '60-70°C'
                    }</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Laser Cutting Guidelines</h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => downloadSVG(selectedComponent)}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Scissors className="w-5 h-5" />
                  Download SVG
                </button>
                <div className="text-sm text-gray-600">
                  <h4 className="font-medium">Material-Specific Settings:</h4>
                  <ul className="list-disc list-inside mt-2">
                    <li>Material Type: {guidelines.cutting.material}</li>
                    <li>Material Thickness: {guidelines.cutting.thickness}</li>
                    <li>Laser Power: {guidelines.cutting.power}</li>
                    <li>Cutting Speed: {guidelines.cutting.speed}</li>
                    <li>Kerf Width: {guidelines.cutting.kerf}</li>
                    <li>Number of Passes: {guidelines.cutting.passes}</li>
                    <li>Notes: {guidelines.cutting.notes}</li>
                    <li>Current Component Thickness: {
                      selectedComponent === 'noseCone' 
                        ? `${(rocketParams.thickness.noseCone * 1000).toFixed(1)}mm`
                        : selectedComponent === 'bodyTube'
                        ? `${(rocketParams.thickness.bodyTube * 1000).toFixed(1)}mm`
                        : `${(rocketParams.thickness.fins * 1000).toFixed(1)}mm`
                    }</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900">Selected Component Details</h4>
              {selectedComponent === 'noseCone' && (
                <div className="mt-2 text-sm text-blue-800">
                  <p>Type: {rocketParams.noseConeType}</p>
                  <p>Length: {(rocketParams.noseLength * 1000).toFixed(1)}mm</p>
                  <p>Material: {rocketParams.materials.noseCone.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                </div>
              )}
              {selectedComponent === 'bodyTube' && (
                <div className="mt-2 text-sm text-blue-800">
                  <p>Length: {(rocketParams.length * 1000).toFixed(1)}mm</p>
                  <p>Diameter: {(rocketParams.diameter * 1000).toFixed(1)}mm</p>
                  <p>Material: {rocketParams.materials.bodyTube.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                </div>
              )}
              {selectedComponent === 'fins' && (
                <div className="mt-2 text-sm text-blue-800">
                  <p>Type: {rocketParams.finType}</p>
                  <p>Count: {rocketParams.numFins}</p>
                  <p>Material: {rocketParams.materials.fins.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                  <p>Root Chord: {(rocketParams.finRootChord * 1000).toFixed(1)}mm</p>
                  <p>Span: {(rocketParams.finSpan * 1000).toFixed(1)}mm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 h-[800px] bg-white rounded-lg overflow-hidden">
        <Canvas shadows>
          <color attach="background" args={['#ffffff']} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            makeDefault
            position={[2, 2, 2]}
            target={[0, 0.5, 0]}
          />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Grid
            infiniteGrid
            cellSize={0.5}
            sectionSize={3}
            fadeStrength={1}
            fadeDistance={50}
            cellColor="#e5e5e5"
            sectionColor="#d4d4d4"
          />
          
          <RocketComponent component={selectedComponent} />
        </Canvas>
      </div>
    </div>
  );
}