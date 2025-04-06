import { useRef, useEffect } from 'react';
import { useRocketStore } from '../store/rocketStore';

export function RocketDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketParams = useRocketStore((state) => state.rocketParams);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Further increase scale factor for even larger diagram
    const scale = 1000; // Significantly increased scale
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height - 400; // Increased bottom margin
    const radius = (rocketParams.diameter * scale) / 2;

    // Calculate total height
    const totalHeight = (rocketParams.length + rocketParams.noseLength) * scale;
    const startY = offsetY - totalHeight;

    // Enhanced line styles for better visibility
    ctx.lineWidth = 3; // Thicker lines
    ctx.strokeStyle = '#2563eb'; // Blue color for better contrast

    // Draw body tube first (from bottom)
    ctx.beginPath();
    ctx.rect(
      offsetX - radius,
      offsetY - rocketParams.length * scale,
      rocketParams.diameter * scale,
      rocketParams.length * scale
    );
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Draw nose cone on top of body tube
    const noseStartY = offsetY - totalHeight;
    const length = rocketParams.noseLength * scale;

    const drawConicalNoseCone = () => {
      ctx.beginPath();
      ctx.moveTo(offsetX - radius, noseStartY + length);
      ctx.lineTo(offsetX, noseStartY);
      ctx.lineTo(offsetX + radius, noseStartY + length);
      ctx.lineTo(offsetX - radius, noseStartY + length);
    };

    const drawParabolicNoseCone = () => {
      ctx.beginPath();
      ctx.moveTo(offsetX - radius, noseStartY);
      
      const a = length / (radius * radius);
      
      // Draw right side of parabolic nose cone
      for (let i = 0; i <= 32; i++) {
        const x = (radius * i) / 32;
        const y = a * x * x;
        ctx.lineTo(offsetX + x, noseStartY + y);
      }
      
      // Draw left side of parabolic nose cone
      for (let i = 32; i >= 0; i--) {
        const x = (radius * i) / 32;
        const y = a * x * x;
        ctx.lineTo(offsetX - x, noseStartY + y);
      }
    };

    ctx.beginPath();
    switch (rocketParams.noseConeType) {
      case 'ogive': {
        // Calculate ogive radius (rho)
        const rho = (Math.pow(length, 2) + Math.pow(radius, 2)) / (2 * radius);
        
        ctx.moveTo(offsetX - radius, noseStartY + length);
        // Draw right side of ogive
        for (let i = 0; i <= 32; i++) {
          const y = (i / 32) * length;
          const x = radius - (rho - Math.sqrt(Math.pow(rho, 2) - Math.pow(length - y, 2)));
          ctx.lineTo(offsetX + x, noseStartY + y);
        }
        // Draw left side of ogive
        for (let i = 32; i >= 0; i--) {
          const y = (i / 32) * length;
          const x = radius - (rho - Math.sqrt(Math.pow(rho, 2) - Math.pow(length - y, 2)));
          ctx.lineTo(offsetX - x, noseStartY + y);
        }
        break;
      }
      case 'elliptical': {
        ctx.moveTo(offsetX - radius, noseStartY + length);
        // Draw right side of elliptical nose cone
        for (let i = 0; i <= 32; i++) {
          const t = (i / 32) * Math.PI / 2;
          const x = radius * Math.sin(t);
          const y = length * Math.cos(t);
          ctx.lineTo(offsetX + x, noseStartY + length - y);
        }
        // Draw left side of elliptical nose cone
        for (let i = 32; i >= 0; i--) {
          const t = (i / 32) * Math.PI / 2;
          const x = radius * Math.sin(t);
          const y = length * Math.cos(t);
          ctx.lineTo(offsetX - x, noseStartY + length - y);
        }
        break;
      }
      case 'parabolic':
        drawParabolicNoseCone();
        break;
      case 'conical':
        drawConicalNoseCone();
        break;
      default:
        drawConicalNoseCone();
        break;
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Draw fins at the bottom with enhanced visibility
    const finStartY = offsetY;
    const finRootY = finStartY - rocketParams.finRootChord * scale;
    const finSpan = rocketParams.finSpan * scale;

    // Calculate fin positions based on number of fins
    for (let i = 0; i < rocketParams.numFins; i++) {
      const angle = (i * 2 * Math.PI) / rocketParams.numFins;
      
      // Project the fin onto the 2D plane
      const projectionFactor = Math.abs(Math.cos(angle));
      const apparentSpan = finSpan * projectionFactor;
      
      // Calculate fin position
      const finX = offsetX + radius * Math.sin(angle);
      
      ctx.beginPath();
      switch (rocketParams.finType) {
        case 'elliptical': {
          ctx.moveTo(finX, finStartY);
          // Draw elliptical curve
          for (let t = 0; t <= Math.PI; t += Math.PI / 16) {
            const x = finX + apparentSpan * Math.sin(t);
            const y = finStartY - rocketParams.finRootChord * scale * (1 - Math.cos(t));
            ctx.lineTo(x, y);
          }
          break;
        }
        case 'rectangular': {
          const finWidth = apparentSpan;
          ctx.moveTo(finX - finWidth/2, finStartY);
          ctx.lineTo(finX - finWidth/2, finRootY);
          ctx.lineTo(finX + finWidth/2, finRootY);
          ctx.lineTo(finX + finWidth/2, finStartY);
          break;
        }
        case 'triangular': {
          const finWidth = apparentSpan;
          ctx.moveTo(finX - finWidth/2, finStartY);
          ctx.lineTo(finX, finRootY);
          ctx.lineTo(finX + finWidth/2, finStartY);
          break;
        }
        default: { // trapezoidal
          const finWidth = apparentSpan;
          const tipWidth = finWidth * 0.6;
          ctx.moveTo(finX - finWidth/2, finStartY);
          ctx.lineTo(finX - tipWidth/2, finRootY);
          ctx.lineTo(finX + tipWidth/2, finRootY);
          ctx.lineTo(finX + finWidth/2, finStartY);
          break;
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      // Add shading based on fin angle
      const shadingAlpha = 0.1 + (0.2 * projectionFactor);
      ctx.fillStyle = `rgba(200, 200, 200, ${shadingAlpha})`;
      ctx.fill();
    }

    // Draw recovery system in the middle of body tube
    if (rocketParams.recoverySystem.type === 'parachute' && rocketParams.recoverySystem.parachuteSize) {
      const parachuteY = offsetY - (rocketParams.length * scale * 0.7);
      const parachuteSize = rocketParams.recoverySystem.parachuteSize * scale;
      
      // Draw parachute dome
      ctx.beginPath();
      ctx.arc(
        offsetX,
        parachuteY,
        parachuteSize / 2,
        Math.PI,
        0,
        true
      );
      ctx.stroke();
      
      // Draw strings
      const stringCount = 8;
      const stringLength = parachuteSize * 0.8;
      for (let i = 0; i < stringCount; i++) {
        const angle = (i * Math.PI) / (stringCount - 1);
        const x = Math.cos(angle) * (parachuteSize / 2);
        ctx.beginPath();
        ctx.moveTo(offsetX + x, parachuteY);
        ctx.lineTo(offsetX, parachuteY + stringLength);
        ctx.stroke();
      }
    }

  }, [rocketParams]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-black">2D Rocket Diagram</h2>
      <canvas
        ref={canvasRef}
        width={2000}
        height={1600}
        className="w-full border border-gray-200 rounded"
      />
    </div>
  );
}