import { RocketParameters, SimulationParameters, SimulationResults, MaterialType } from '../types/rocket';
import Matter from 'matter-js';

const G = 9.81; // Gravitational acceleration (m/s²)
const AIR_DENSITY = 1.225; // Air density at sea level (kg/m³)
const GAMMA = 1.4; // Heat capacity ratio of air
const R = 287.05; // Gas constant for air (J/kg·K)

// Material densities in kg/m³
const MATERIAL_DENSITIES: Record<MaterialType, number> = {
  cardboard: 680,
  aluminum: 2700,
  fiberglass: 1800,
  carbon_fiber: 1600,
  plastic: 1050
};

// Motor specifications including propellant mass and exhaust velocity
const MOTOR_SPECS: Record<string, {
  burnTime: number;
  averageThrust: number;
  delay: number;
  propellantMass: number; // kg
  exhaustVelocity: number; // m/s
}> = {
  'A8-3': { burnTime: 0.5, averageThrust: 10.0, delay: 3, propellantMass: 0.0027, exhaustVelocity: 1850 },
  'B6-4': { burnTime: 0.8, averageThrust: 12.0, delay: 4, propellantMass: 0.005, exhaustVelocity: 1920 },
  'C6-5': { burnTime: 1.6, averageThrust: 15.0, delay: 5, propellantMass: 0.0101, exhaustVelocity: 2000 },
  'D12-7': { burnTime: 1.8, averageThrust: 30.0, delay: 7, propellantMass: 0.0196, exhaustVelocity: 2050 },
  'E9-6': { burnTime: 2.5, averageThrust: 45.0, delay: 6, propellantMass: 0.0286, exhaustVelocity: 2100 }
};

export async function simulateFlight(
  rocketParams: RocketParameters,
  simParams: SimulationParameters
): Promise<SimulationResults> {
  // Get motor specifications
  const motorSpec = MOTOR_SPECS[rocketParams.motorType];
  if (!motorSpec) {
    throw new Error('Invalid motor type');
  }

  // Calculate initial and final masses
  const initialMass = rocketParams.mass + motorSpec.propellantMass;
  const finalMass = rocketParams.mass;

  // Calculate maximum velocity using Tsiolkovsky rocket equation
  // Δv = ve * ln(mi/mf)
  const theoreticalMaxVelocity = motorSpec.exhaustVelocity * Math.log(initialMass / finalMass);

  // Create physics engine
  const engine = Matter.Engine.create();
  
  // Calculate cross-sectional area
  const area = Math.PI * Math.pow(rocketParams.diameter / 2, 2);
  
  // Calculate base drag coefficient
  const baseDragCoefficient = calculateDragCoefficient(rocketParams);
  
  // Convert launch angle to radians (90° is vertical, 0° is horizontal)
  const launchAngleRad = (simParams.launchAngle * Math.PI) / 180;
  let position = { x: 0, y: 0, z: 0 };
  let velocity = { x: 0, y: 0, z: 0 };
  
  const flightPath: Array<[number, number, number]> = [[0, 0, 0]];
  const timePoints: number[] = [0];
  
  let maxAltitude = 0;
  let currentMass = initialMass;
  let time = 0;
  const dt = 0.01; // Time step (s)
  
  // Calculate centers
  const centerOfMass = calculateCenterOfMass(rocketParams);
  const centerOfPressure = calculateCenterOfPressure(rocketParams);
  const centerOfGravity = calculateCenterOfGravity(rocketParams);
  
  // Simulate flight path
  while (position.y >= 0 && time < 300) { // Max 5 minutes simulation
    // Update mass during burn phase
    if (time <= motorSpec.burnTime) {
      currentMass = initialMass - (motorSpec.propellantMass * (time / motorSpec.burnTime));
    } else {
      currentMass = finalMass;
    }

    // Calculate local air density based on altitude
    const temperature = simParams.temperature * Math.exp(-0.0065 * position.y / simParams.temperature);
    const pressure = simParams.pressure * Math.pow(temperature / simParams.temperature, 5.2561);
    const localAirDensity = pressure / (R * temperature);
    
    // Calculate current speed
    const speed = Math.sqrt(
      Math.pow(velocity.x, 2) +
      Math.pow(velocity.y, 2) +
      Math.pow(velocity.z, 2)
    );
    
    // Calculate Mach number and angle of attack
    const soundSpeed = Math.sqrt(GAMMA * R * temperature);
    const machNumber = speed / soundSpeed;
    const velocityAngle = Math.atan2(velocity.y, Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z));
    const angleOfAttack = Math.abs(launchAngleRad - velocityAngle);
    
    // Calculate drag coefficient with compressibility and angle of attack effects
    const dragCoefficient = baseDragCoefficient * (
      1 + 
      0.38 * Math.pow(machNumber, 2) +
      0.5 * Math.pow(Math.sin(angleOfAttack), 2)
    );
    
    // Calculate drag force
    const dragForce = 0.5 * localAirDensity * dragCoefficient * area * speed * speed;
    
    // Calculate drag components
    const drag = {
      x: speed > 0 ? -dragForce * (velocity.x / speed) : 0,
      y: speed > 0 ? -dragForce * (velocity.y / speed) : 0,
      z: speed > 0 ? -dragForce * (velocity.z / speed) : 0
    };
    
    // Calculate thrust (now using launch angle directly)
    const thrust = calculateThrust(time, motorSpec);
    const thrustX = thrust * Math.cos(launchAngleRad); // Changed to use cos for horizontal component
    const thrustY = thrust * Math.sin(launchAngleRad); // Changed to use sin for vertical component
    
    // Calculate net forces
    const netForceX = thrustX + drag.x;
    const netForceY = thrustY + drag.y - currentMass * G;
    const netForceZ = drag.z;
    
    // Update velocity using current mass
    velocity.x += (netForceX / currentMass) * dt;
    velocity.y += (netForceY / currentMass) * dt;
    velocity.z += (netForceZ / currentMass) * dt;
    
    // Update position
    position.x += velocity.x * dt;
    position.y += velocity.y * dt;
    position.z += velocity.z * dt;
    
    // Record data
    flightPath.push([position.x, position.y, position.z]);
    timePoints.push(time);
    
    // Update maximum altitude
    maxAltitude = Math.max(maxAltitude, position.y);
    
    time += dt;
  }
  
  // Calculate final parameters
  const trajectoryAngle = Math.atan2(velocity.y, Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)) * (180 / Math.PI);
  const stabilityMargin = calculateStabilityMargin(centerOfPressure.y, centerOfMass.y, rocketParams.diameter);
  const landingVelocity = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
  const maxDistance = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2));
  
  return {
    maxAltitude,
    maxVelocity: theoreticalMaxVelocity,
    flightTime: time,
    maxDistance,
    landingVelocity,
    stabilityMargin,
    dragCoefficient: baseDragCoefficient,
    flightPath,
    timePoints,
    centerOfMass,
    centerOfPressure,
    centerOfGravity,
    trajectoryAngle
  };
}

function calculateDragCoefficient(rocketParams: RocketParameters): number {
  const noseCoefficients = {
    ogive: 0.2,
    conical: 0.3,
    parabolic: 0.15,
    elliptical: 0.18
  };
  
  const noseDrag = noseCoefficients[rocketParams.noseConeType] || 0.3;
  const finInterference = 0.01 * rocketParams.numFins * (rocketParams.finSpan / rocketParams.diameter);
  const lengthToDiameter = rocketParams.length / rocketParams.diameter;
  const bodyDrag = 0.1 * Math.log(lengthToDiameter);
  
  const roughnessFactor = {
    carbon_fiber: 0.02,
    fiberglass: 0.03,
    aluminum: 0.04,
    plastic: 0.05,
    cardboard: 0.06
  }[rocketParams.materials.bodyTube] || 0.06;
  
  return noseDrag + bodyDrag + finInterference + roughnessFactor;
}

function calculateThrust(time: number, motorSpec: { burnTime: number; averageThrust: number }): number {
  if (!motorSpec || time > motorSpec.burnTime) {
    return 0;
  }
  
  const normalizedTime = time / motorSpec.burnTime;
  if (normalizedTime < 0.1) {
    return motorSpec.averageThrust * 1.5; // Initial thrust spike
  } else if (normalizedTime < 0.9) {
    return motorSpec.averageThrust; // Sustained thrust
  } else {
    return motorSpec.averageThrust * (1 - ((normalizedTime - 0.9) / 0.1)); // Thrust tail-off
  }
}

function calculateCenterOfMass(rocketParams: RocketParameters): { x: number; y: number; z: number } {
  const noseMass = calculateComponentMass('noseCone', rocketParams);
  const bodyMass = calculateComponentMass('bodyTube', rocketParams);
  const finsMass = calculateComponentMass('fins', rocketParams);
  const motorMass = rocketParams.mass * 0.3;
  
  const noseCenter = rocketParams.length + rocketParams.noseLength * 0.6;
  const bodyCenter = rocketParams.length * 0.5;
  const finsCenter = rocketParams.finRootChord * 0.4;
  const motorCenter = rocketParams.finRootChord;
  
  const totalMass = noseMass + bodyMass + finsMass + motorMass;
  const centerY = (
    noseMass * noseCenter +
    bodyMass * bodyCenter +
    finsMass * finsCenter +
    motorMass * motorCenter
  ) / totalMass;
  
  return { x: 0, y: centerY, z: 0 };
}

function calculateComponentMass(
  component: 'noseCone' | 'bodyTube' | 'fins',
  rocketParams: RocketParameters
): number {
  const material = rocketParams.materials[component];
  const density = MATERIAL_DENSITIES[material];
  
  switch (component) {
    case 'noseCone':
      return Math.PI * Math.pow(rocketParams.diameter / 2, 2) * 
             rocketParams.noseLength * rocketParams.thickness.noseCone * density;
    
    case 'bodyTube':
      return Math.PI * rocketParams.diameter * rocketParams.length * 
             rocketParams.thickness.bodyTube * density;
    
    case 'fins':
      const finArea = (rocketParams.finRootChord + rocketParams.finTipChord) * 
                     rocketParams.finSpan / 2;
      return finArea * rocketParams.thickness.fins * density * rocketParams.numFins;
  }
}

function calculateCenterOfPressure(rocketParams: RocketParameters): { x: number; y: number; z: number } {
  const noseCP = rocketParams.length + rocketParams.noseLength * 0.466;
  const bodyCP = rocketParams.length * 0.5;
  const finsCP = rocketParams.finRootChord * 0.25;
  
  const noseArea = Math.PI * Math.pow(rocketParams.diameter / 2, 2);
  const bodyArea = Math.PI * rocketParams.diameter * rocketParams.length;
  const finArea = rocketParams.numFins * (rocketParams.finRootChord + rocketParams.finTipChord) * 
                 rocketParams.finSpan / 2;
  
  const totalArea = noseArea + bodyArea + finArea;
  const centerY = (
    noseCP * noseArea +
    bodyCP * bodyArea +
    finsCP * finArea
  ) / totalArea;
  
  return { x: 0, y: centerY, z: 0 };
}

function calculateCenterOfGravity(rocketParams: RocketParameters): { x: number; y: number; z: number } {
  const cm = calculateCenterOfMass(rocketParams);
  const motorOffset = rocketParams.length * 0.1;
  return {
    x: cm.x,
    y: cm.y - motorOffset,
    z: cm.z
  };
}

function calculateStabilityMargin(cp: number, cg: number, diameter: number): number {
  return (cp - cg) / diameter;
}