import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { RocketModel } from '../components/RocketModel';
import { ControlPanel } from '../components/ControlPanel';
import { RocketDiagram } from '../components/RocketDiagram';

export function DesignPage() {
  return (
    <div className="flex gap-6">
      <div className="w-[420px]">
        <ControlPanel />
      </div>
      <div className="flex-1 space-y-6">
        <div className="h-[500px] bg-white rounded-lg overflow-hidden">
          <Canvas shadows camera={{ position: [1.5, 1, 1.5], fov: 45 }}>
            <color attach="background" args={['#ffffff']} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              makeDefault
              minDistance={1}
              maxDistance={5}
              rotateSpeed={0.5}
              zoomSpeed={0.5}
              panSpeed={0.5}
              target={[0, 0.5, 0]}
            />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <Grid
              infiniteGrid
              cellSize={0.2}
              sectionSize={1}
              fadeStrength={1}
              fadeDistance={10}
              cellColor="#e5e5e5"
              sectionColor="#d4d4d4"
            />
            
            <RocketModel />
          </Canvas>
        </div>
        <RocketDiagram />
      </div>
    </div>
  );
}