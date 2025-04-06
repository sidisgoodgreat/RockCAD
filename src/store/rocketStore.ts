import { create } from 'zustand';
import { saveAs } from 'file-saver';
import {
  RocketParameters,
  SimulationParameters,
  SimulationResults,
  AIAnalysis,
  UnitSystem,
  RocketDesign,
} from '../types/rocket';
import { simulateFlight } from '../utils/physics';
import { analyzeDesign } from '../utils/aiAnalysis';

interface RocketStore {
  rocketParams: RocketParameters;
  simParams: SimulationParameters;
  unitSystem: UnitSystem;
  simulationResults: SimulationResults | null;
  aiAnalysis: AIAnalysis | null;
  isSimulating: boolean;
  setRocketParams: (params: Partial<RocketParameters>) => void;
  setSimParams: (params: Partial<SimulationParameters>) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  convertValue: (value: number, from: UnitSystem, to: UnitSystem) => number;
  startSimulation: () => Promise<void>;
  exportDesign: () => void;
  importDesign: (file: File) => Promise<void>;
}

const conversionFactors: Record<UnitSystem, number> = {
  mm: 1000,
  cm: 100,
  m: 1,
  inch: 39.3701,
  ft: 3.28084,
};

const defaultRocketParams: RocketParameters = {
  length: 0.5, // 50cm
  diameter: 0.04, // 4cm
  noseConeType: 'ogive',
  noseLength: 0.15, // 15cm
  finType: 'trapezoidal',
  finSpan: 0.08, // 8cm
  finRootChord: 0.08, // 8cm
  finTipChord: 0.04, // 4cm
  finSweepAngle: 45,
  numFins: 4,
  materials: {
    noseCone: 'plastic',
    bodyTube: 'cardboard',
    fins: 'plastic'
  },
  thickness: {
    bodyTube: 0.002, // 2mm
    noseCone: 0.003, // 3mm
    fins: 0.003 // 3mm
  },
  mass: 0.25, // 250g
  motorType: 'D12-7',
  motorImpulse: 20.0, // N⋅s
  recoverySystem: {
    type: 'parachute',
    parachuteSize: 0.3, // 30cm
    shockCordLength: 1.0, // 1m
    ejectionCharge: 0.002 // 2g
  }
};

export const useRocketStore = create<RocketStore>((set, get) => ({
  rocketParams: defaultRocketParams,
  simParams: {
    launchAngle: 85,
    initialVelocity: 0,
    windSpeed: 0,
    temperature: 288.15, // 15°C
    pressure: 101325, // 1 atm
    humidity: 60,
    altitude: 0,
  },
  unitSystem: 'm',
  simulationResults: null,
  aiAnalysis: null,
  isSimulating: false,

  setRocketParams: (params) =>
    set((state) => ({
      rocketParams: { ...state.rocketParams, ...params },
    })),

  setSimParams: (params) =>
    set((state) => ({
      simParams: { ...state.simParams, ...params },
    })),

  setUnitSystem: (unit) => set({ unitSystem: unit }),

  convertValue: (value: number, from: UnitSystem, to: UnitSystem) => {
    const toMeters = value / conversionFactors[from];
    return toMeters * conversionFactors[to];
  },

  startSimulation: async () => {
    set({ isSimulating: true });
    const { rocketParams, simParams } = get();
    
    try {
      const results = await simulateFlight(rocketParams, simParams);
      const analysis = await analyzeDesign(rocketParams, simParams, results);
      
      set({
        simulationResults: results,
        aiAnalysis: analysis,
        isSimulating: false,
      });
    } catch (error) {
      console.error('Simulation failed:', error);
      set({ isSimulating: false });
    }
  },

  exportDesign: () => {
    const { rocketParams, simParams } = get();
    const design: RocketDesign = {
      name: 'Rocket Design',
      description: 'Exported rocket design',
      rocketParams,
      simParams,
      lastModified: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(design, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'rocket-design.json');
  },

  importDesign: async (file: File) => {
    try {
      const text = await file.text();
      const design: RocketDesign = JSON.parse(text);
      set({
        rocketParams: design.rocketParams,
        simParams: design.simParams,
      });
    } catch (error) {
      console.error('Failed to import design:', error);
      throw new Error('Invalid design file');
    }
  },
}));