import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useRocketStore } from '../store/rocketStore';

export function FlightPath() {
  const simulationResults = useRocketStore((state) => state.simulationResults);
  const { camera } = useThree();
  const pathRef = useRef();

  useEffect(() => {
    if (simulationResults?.flightPath.length && camera) {
      const maxAltitude = Math.max(...simulationResults.flightPath.map(p => p[1]));
      // Set camera closer to the rocket and flight path
      camera.position.set(maxAltitude / 4, maxAltitude / 4, maxAltitude / 4);
      camera.lookAt(0, maxAltitude / 8, 0);
    }
  }, [simulationResults, camera]);

  if (!simulationResults?.flightPath.length) {
    return null;
  }

  return (
    <Line
      points={simulationResults.flightPath}
      color="red"
      lineWidth={2}
      dashed={false}
    />
  );
}