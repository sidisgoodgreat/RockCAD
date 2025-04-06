export type UnitSystem = 'mm' | 'cm' | 'm' | 'inch' | 'ft';

export type NoseConeType = 'ogive' | 'conical' | 'parabolic' | 'elliptical';
export type FinType = 'trapezoidal' | 'elliptical' | 'rectangular' | 'triangular';
export type MotorType = 'A8-3' | 'B6-4' | 'C6-5' | 'D12-7' | 'E9-6';
export type MaterialType = 'cardboard' | 'aluminum' | 'fiberglass' | 'carbon_fiber' | 'plastic';
export type RecoveryType = 'parachute' | 'streamer' | 'dual_deploy';

export interface MaterialThickness {
  bodyTube: number;
  noseCone: number;
  fins: number;
}

export interface RecoverySystem {
  type: RecoveryType;
  parachuteSize?: number;
  shockCordLength?: number;
  ejectionCharge?: number;
}

export interface RocketParameters {
  // Basic dimensions
  length: number;
  diameter: number;
  
  // Nose cone
  noseConeType: NoseConeType;
  noseLength: number;
  
  // Fins
  finType: FinType;
  numFins: number;
  finSpan: number;
  finRootChord: number;
  finTipChord: number;
  finSweepAngle: number;
  
  // Materials
  materials: {
    noseCone: MaterialType;
    bodyTube: MaterialType;
    fins: MaterialType;
  };
  
  // Thickness
  thickness: MaterialThickness;
  
  // Mass and motor
  mass: number;
  motorType: MotorType;
  motorImpulse: number;
  
  // Recovery
  recoverySystem: RecoverySystem;
}

export interface SimulationParameters {
  launchAngle: number;
  initialVelocity: number;
  windSpeed: number;
  temperature: number;
  pressure: number;
  humidity: number;
  altitude: number;
}

export interface CenterOfMass {
  x: number;
  y: number;
  z: number;
}

export interface SimulationResults {
  maxAltitude: number;
  maxVelocity: number;
  flightTime: number;
  landingVelocity: number;
  stabilityMargin: number;
  dragCoefficient: number;
  flightPath: Array<[number, number, number]>;
  timePoints: number[];
  centerOfPressure: CenterOfMass;
  centerOfGravity: CenterOfMass;
  centerOfMass: CenterOfMass;
  trajectoryAngle: number;
  maxDistance: number;
}

export interface AIAnalysis {
  stabilityAnalysis: string;
  performanceAnalysis: string;
  safetyRecommendations: string;
  optimizationSuggestions: string;
  materialAnalysis: string;
  recoverySystemAnalysis: string;
}

export interface RocketDesign {
  name: string;
  description: string;
  rocketParams: RocketParameters;
  simParams: SimulationParameters;
  lastModified: string;
}