import { useRocketStore } from '../store/rocketStore';
import * as THREE from 'three';

interface RocketComponentProps {
  component: 'noseCone' | 'bodyTube' | 'fins' | 'all';
}

export function RocketComponent({ component }: RocketComponentProps) {
  const rocketParams = useRocketStore((state) => state.rocketParams);

  const createNoseConeGeometry = () => {
    switch (rocketParams.noseConeType) {
      case 'ogive': {
        const points = [];
        const radius = rocketParams.diameter / 2;
        const length = rocketParams.noseLength;
        
        for (let i = 0; i <= 32; i++) {
          const t = i / 32;
          const x = radius * (1 - t * t);
          const y = length * t;
          points.push(new THREE.Vector2(x, y));
        }
        return new THREE.LatheGeometry(points, 32);
      }
      case 'elliptical': {
        const points = [];
        for (let i = 0; i <= 32; i++) {
          const t = (i / 32) * Math.PI;
          const x = (rocketParams.diameter / 2) * Math.sin(t);
          const y = rocketParams.noseLength * Math.cos(t);
          points.push(new THREE.Vector2(x, y));
        }
        return new THREE.LatheGeometry(points, 32);
      }
      case 'parabolic': {
        const points = [];
        const radius = rocketParams.diameter / 2;
        const length = rocketParams.noseLength;
        
        for (let i = 0; i <= 32; i++) {
          const t = i / 32;
          const y = length * t;
          const x = radius * Math.sqrt(1 - Math.pow(t, 2));
          points.push(new THREE.Vector2(x, y));
        }
        return new THREE.LatheGeometry(points, 32);
      }
      default: // conical
        return new THREE.ConeGeometry(
          rocketParams.diameter / 2,
          rocketParams.noseLength,
          32
        );
    }
  };

  const createFinGeometry = () => {
    let shape: THREE.Shape;

    switch (rocketParams.finType) {
      case 'elliptical': {
        shape = new THREE.Shape();
        const a = rocketParams.finRootChord / 2;
        const b = rocketParams.finSpan;
        for (let t = 0; t <= Math.PI; t += Math.PI / 32) {
          const x = a * Math.cos(t);
          const y = b * Math.sin(t);
          if (t === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        break;
      }
      case 'rectangular': {
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(rocketParams.finRootChord, 0);
        shape.lineTo(rocketParams.finRootChord, rocketParams.finSpan);
        shape.lineTo(0, rocketParams.finSpan);
        break;
      }
      case 'triangular': {
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(rocketParams.finRootChord, 0);
        shape.lineTo(rocketParams.finRootChord / 2, rocketParams.finSpan);
        break;
      }
      default: { // trapezoidal
        shape = new THREE.Shape();
        const tipChord = rocketParams.finRootChord * 0.6;
        shape.moveTo(0, 0);
        shape.lineTo(rocketParams.finRootChord, 0);
        shape.lineTo(rocketParams.finRootChord - (rocketParams.finRootChord - tipChord) / 2, rocketParams.finSpan);
        shape.lineTo((rocketParams.finRootChord - tipChord) / 2, rocketParams.finSpan);
        break;
      }
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: rocketParams.thickness.fins,
      bevelEnabled: false
    });
  };

  const getMaterialProperties = (type: string) => {
    switch (type) {
      case 'aluminum':
        return { color: '#A5A5A5', metalness: 0.8, roughness: 0.2 };
      case 'carbon_fiber':
        return { color: '#1A1A1A', metalness: 0.3, roughness: 0.7 };
      case 'fiberglass':
        return { color: '#E5E5E5', metalness: 0.2, roughness: 0.3 };
      case 'plastic':
        return { color: '#CCCCCC', metalness: 0.1, roughness: 0.8 };
      default: // cardboard
        return { color: '#8B4513', metalness: 0.1, roughness: 0.9 };
    }
  };

  if (component === 'noseCone' || component === 'all') {
    return (
      <mesh position={[0, rocketParams.length, 0]}>
        <primitive object={createNoseConeGeometry()} />
        <meshStandardMaterial {...getMaterialProperties(rocketParams.materials.noseCone)} />
      </mesh>
    );
  }

  if (component === 'bodyTube' || component === 'all') {
    return (
      <mesh position={[0, rocketParams.length / 2, 0]}>
        <cylinderGeometry
          args={[
            rocketParams.diameter / 2,
            rocketParams.diameter / 2,
            rocketParams.length,
            32
          ]}
        />
        <meshStandardMaterial {...getMaterialProperties(rocketParams.materials.bodyTube)} />
      </mesh>
    );
  }

  if (component === 'fins' || component === 'all') {
    return (
      <group>
        {Array.from({ length: rocketParams.numFins }).map((_, i) => (
          <mesh
            key={i}
            position={[0, 0.1, 0]}
            rotation={[0, (i * 2 * Math.PI) / rocketParams.numFins, 0]}
          >
            <primitive object={createFinGeometry()} />
            <meshStandardMaterial
              {...getMaterialProperties(rocketParams.materials.fins)}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return null;
}