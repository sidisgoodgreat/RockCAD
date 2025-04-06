import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRocketStore } from '../store/rocketStore';
import * as THREE from 'three';

export function RocketModel() {
  const rocketParams = useRocketStore((state) => state.rocketParams);
  const rocketRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y += 0.005;
    }
  });

  const createConicalNoseConeGeometry = () => {
    const points = [];
    const radius = rocketParams.diameter / 2;
    const length = rocketParams.noseLength;
    
    // Use y = (x/L) * R equation for conical shape, but flip the orientation
    for (let i = 0; i <= 32; i++) {
      const x = (length * i) / 32;
      const y = ((length - x) / length) * radius; // Modified to flip orientation
      points.push(new THREE.Vector2(y, x));
    }
    return new THREE.LatheGeometry(points, 32);
  };

  const createParabolicNoseConeGeometry = () => {
    const points = [];
    const radius = rocketParams.diameter / 2;
    const length = rocketParams.noseLength;
    const a = length / (radius * radius);
    
    for (let i = 0; i <= 32; i++) {
      const x = (radius * i) / 32;
      const y = a * x * x;
      points.push(new THREE.Vector2(x, length - y));
    }
    return new THREE.LatheGeometry(points, 32);
  };

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
          const t = (i / 32) * Math.PI / 2;
          const x = (rocketParams.diameter / 2) * Math.sin(t);
          const y = rocketParams.noseLength * Math.cos(t);
          points.push(new THREE.Vector2(x, y));
        }
        return new THREE.LatheGeometry(points, 32);
      }
      case 'parabolic':
        return createParabolicNoseConeGeometry();
      case 'conical':
        return createConicalNoseConeGeometry();
      default:
        return createConicalNoseConeGeometry();
    }
  };

  const createFinGeometry = () => {
    let shape: THREE.Shape;

    switch (rocketParams.finType) {
      case 'elliptical': {
        const curve = new THREE.EllipseCurve(
          0, 0,
          rocketParams.finRootChord / 2, rocketParams.finSpan,
          0, 2 * Math.PI,
          false,
          0
        );
        const points = curve.getPoints(50);
        shape = new THREE.Shape(points);
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
        shape.lineTo(0, rocketParams.finSpan);
        shape.lineTo(0, 0);
        break;
      }
      
      default: { // trapezoidal
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(rocketParams.finRootChord, 0);
        shape.lineTo(
          rocketParams.finRootChord - (rocketParams.finRootChord - rocketParams.finTipChord) / 2,
          rocketParams.finSpan
        );
        shape.lineTo(0, rocketParams.finSpan);
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

  return (
    <group ref={rocketRef}>
      {/* Body */}
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

      {/* Nose Cone */}
      <mesh position={[0, rocketParams.length, 0]}>
        <primitive object={createNoseConeGeometry()} />
        <meshStandardMaterial {...getMaterialProperties(rocketParams.materials.noseCone)} />
      </mesh>

      {/* Fins */}
      {Array.from({ length: rocketParams.numFins }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, 0]}
          rotation={[0, (i * 2 * Math.PI) / rocketParams.numFins, 0]}
        >
          <primitive object={createFinGeometry()} />
          <meshStandardMaterial
            {...getMaterialProperties(rocketParams.materials.fins)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Recovery System Visualization */}
      {rocketParams.recoverySystem.type === 'parachute' && (
        <mesh position={[0, rocketParams.length * 0.75, 0]}>
          <sphereGeometry args={[rocketParams.recoverySystem.parachuteSize! / 4, 8, 8]} />
          <meshStandardMaterial color="#FF4444" opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}