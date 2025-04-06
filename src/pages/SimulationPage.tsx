import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { RocketModel } from '../components/RocketModel';
import { FlightPath } from '../components/FlightPath';
import { SimulationControls } from '../components/SimulationControls';
import { SimulationResults } from '../components/SimulationResults';

export function SimulationPage() {
  return (
    <div className="flex gap-6">
      <div className="w-[420px] space-y-6">
        <SimulationControls />
        <SimulationResults />
      </div>
      <div className="flex-1 h-[800px] bg-white rounded-lg overflow-hidden">
        <Canvas shadows camera={{ position: [1, 1, 1], fov: 50 }}>
          <color attach="background" args={['#ffffff']} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            makeDefault
            minDistance={0.5}
            maxDistance={5}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            panSpeed={0.5}
          />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Grid
            infiniteGrid
            cellSize={0.1}
            sectionSize={1}
            fadeStrength={1}
            fadeDistance={10}
            cellColor="#e5e5e5"
            sectionColor="#d4d4d4"
          />
          
          <RocketModel />
          <FlightPath />
        </Canvas>
      </div>
    </div>
  );
}