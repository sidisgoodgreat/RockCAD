import {
  RocketParameters,
  SimulationParameters,
  SimulationResults,
  AIAnalysis,
} from '../types/rocket';

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export async function analyzeDesign(
  rocketParams: RocketParameters,
  simParams: SimulationParameters,
  results: SimulationResults
): Promise<AIAnalysis> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      const prompt = generateAnalysisPrompt(rocketParams, simParams, results);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Rocket Design Simulator',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-pro',
          messages: [
            {
              role: 'system',
              content: `You are a rocket design expert analyzing model rocket specifications and simulation results. 
              Provide detailed analysis with SPECIFIC, NUMERICAL recommendations in the following format:

              STABILITY_ANALYSIS:
              [Your stability analysis here]

              PERFORMANCE_ANALYSIS:
              [Your performance analysis here]

              SAFETY_RECOMMENDATIONS:
              [Your safety recommendations here]

              OPTIMIZATION_SUGGESTIONS:
              [Your optimization suggestions here]`
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.choices?.[0]?.message?.content;
      
      if (!analysisText) {
        throw new Error('Empty response received from AI service');
      }

      const parsedAnalysis = parseAIResponse(analysisText);
      
      // If any section is empty, use simulation-based analysis
      if (!parsedAnalysis.stabilityAnalysis || 
          !parsedAnalysis.performanceAnalysis || 
          !parsedAnalysis.safetyRecommendations || 
          !parsedAnalysis.optimizationSuggestions) {
        return generateSimulationBasedAnalysis(rocketParams, simParams, results);
      }

      return parsedAnalysis;
    } catch (error) {
      lastError = error as Error;
      retries++;
      
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retries - 1)));
        continue;
      }
      
      console.error('AI analysis failed:', error);
      return generateSimulationBasedAnalysis(rocketParams, simParams, results);
    }
  }

  throw new Error(`AI analysis failed after ${MAX_RETRIES} retries: ${lastError?.message}`);
}

function generateSimulationBasedAnalysis(
  rocketParams: RocketParameters,
  simParams: SimulationParameters,
  results: SimulationResults
): AIAnalysis {
  const lengthToDiameterRatio = rocketParams.length / rocketParams.diameter;
  const finAreaRatio = (rocketParams.finSpan * rocketParams.finRootChord * rocketParams.numFins) / 
                      (Math.PI * Math.pow(rocketParams.diameter / 2, 2));

  const stabilityAnalysis = `
    Stability Analysis:
    - Stability margin: ${results.stabilityMargin.toFixed(2)} calibers
    - Center of Pressure location: ${results.centerOfPressure.y.toFixed(2)}m from nose
    - Center of Gravity location: ${results.centerOfGravity.y.toFixed(2)}m from nose
    - Length to diameter ratio: ${lengthToDiameterRatio.toFixed(2)}
    - Fin area ratio: ${finAreaRatio.toFixed(2)}

    ${results.stabilityMargin < 1 
      ? '⚠️ WARNING: Rocket is unstable (margin < 1). Recommendations:\n' +
        '- Increase fin size by 20%\n' +
        '- Move weight forward by adding nose weight\n' +
        '- Consider reducing body length'
      : results.stabilityMargin > 2
      ? '⚠️ WARNING: Rocket may be overstable (margin > 2). Recommendations:\n' +
        '- Reduce fin size by 15%\n' +
        '- Consider moving weight rearward\n' +
        '- Evaluate if large margins are needed for your application'
      : '✅ Stability is within optimal range (1-2 calibers).\n' +
        '- Current design provides good stability while avoiding over-stabilization\n' +
        '- Configuration is suitable for typical flight conditions'
    }`;

  const performanceAnalysis = `
    Performance Analysis:
    - Maximum altitude: ${results.maxAltitude.toFixed(2)}m
    - Maximum velocity: ${results.maxVelocity.toFixed(2)}m/s
    - Flight time: ${results.flightTime.toFixed(2)}s
    - Drag coefficient: ${results.dragCoefficient.toFixed(3)}
    - Thrust-to-weight ratio: ${(rocketParams.motorImpulse / (rocketParams.mass * 9.81)).toFixed(2)}

    ${results.maxAltitude < 100 
      ? '⚠️ Low altitude performance. Recommendations:\n' +
        '- Consider upgrading to next motor class\n' +
        '- Reduce overall weight by 15%\n' +
        '- Optimize aerodynamic profile to reduce drag'
      : results.maxAltitude > 500
      ? '⚠️ High altitude flight detected. Considerations:\n' +
        '- Ensure recovery system is rated for high altitude deployment\n' +
        '- Verify structural integrity for high-speed flight\n' +
        '- Consider wind drift at maximum altitude'
      : '✅ Altitude is within typical model rocket range.\n' +
        '- Good balance of performance and safety\n' +
        '- Suitable for most launch sites'
    }`;

  const safetyRecommendations = `
    Safety Analysis:
    - Landing velocity: ${results.landingVelocity.toFixed(2)}m/s
    - Maximum distance: ${results.maxDistance.toFixed(2)}m
    - Recovery system: ${rocketParams.recoverySystem.type}
    ${rocketParams.recoverySystem.type === 'parachute' 
      ? `- Parachute size: ${rocketParams.recoverySystem.parachuteSize}m diameter`
      : ''}

    Safety Recommendations:
    ${results.landingVelocity > 20 
      ? '⚠️ High landing velocity detected!\n' +
        `- Increase ${rocketParams.recoverySystem.type} size by 25%\n` +
        '- Consider dual-deployment recovery\n' +
        '- Add shock cord protection'
      : '✅ Landing velocity is within safe range\n'
    }
    ${results.maxDistance > 300
      ? '⚠️ Long range flight predicted:\n' +
        '- Require larger launch field (minimum 500m clear area)\n' +
        '- Consider reducing motor impulse\n' +
        '- Monitor wind conditions carefully'
      : '✅ Flight range is manageable\n'
    }
    - Always use fresh recovery system elastic
    - Inspect fin attachments before each flight
    - Use proper launch guide length: ${(rocketParams.length * 1.5).toFixed(2)}m recommended`;

  const optimizationSuggestions = `
    Design Optimization Recommendations:
    ${results.stabilityMargin < 1
      ? '1. Stability Improvements:\n' +
        `   - Increase fin span to ${(rocketParams.finSpan * 1.2).toFixed(3)}m\n` +
        `   - Add ${(rocketParams.mass * 0.1).toFixed(3)}kg nose weight\n`
      : results.stabilityMargin > 2
      ? '1. Reduce Over-stability:\n' +
        `   - Decrease fin span to ${(rocketParams.finSpan * 0.85).toFixed(3)}m\n` +
        '   - Consider lighter nose cone material\n'
      : '1. Maintain Current Stability:\n' +
        '   - Current fin configuration is optimal\n' +
        '   - Weight distribution is well-balanced\n'
    }

    2. Aerodynamic Improvements:
    ${results.dragCoefficient > 0.5
      ? `   - Switch to ${rocketParams.noseConeType === 'conical' ? 'ogive' : 'elliptical'} nose cone\n` +
        '   - Smooth surface finish recommended\n' +
        '   - Consider fillets at fin roots\n'
      : '   - Current aerodynamic design is efficient\n' +
        '   - Consider maintaining current surface finish\n'
    }

    3. Performance Optimization:
    ${results.maxAltitude < 100
      ? `   - Upgrade to ${rocketParams.motorType.charAt(0) === 'A' ? 'B' : 
           rocketParams.motorType.charAt(0) === 'B' ? 'C' : 
           rocketParams.motorType.charAt(0) === 'C' ? 'D' : 'E'} class motor\n` +
        `   - Reduce body tube thickness to ${(rocketParams.thickness.bodyTube * 0.8).toFixed(4)}m\n`
      : '   - Current motor selection is appropriate\n' +
        '   - Weight distribution is optimized\n'
    }`;

  return {
    stabilityAnalysis,
    performanceAnalysis,
    safetyRecommendations,
    optimizationSuggestions,
    materialAnalysis: `
    Material Analysis:
    - Nose cone (${rocketParams.materials.noseCone}): ${
      rocketParams.materials.noseCone === 'carbon_fiber' ? 'Excellent strength-to-weight ratio' :
      rocketParams.materials.noseCone === 'fiberglass' ? 'Good durability and heat resistance' :
      rocketParams.materials.noseCone === 'aluminum' ? 'High strength but consider weight' :
      'Adequate for most flights'
    }
    - Body tube (${rocketParams.materials.bodyTube}): ${
      rocketParams.materials.bodyTube === 'carbon_fiber' ? 'Premium choice for performance' :
      rocketParams.materials.bodyTube === 'fiberglass' ? 'Excellent structural integrity' :
      rocketParams.materials.bodyTube === 'aluminum' ? 'Good for high-power flights' :
      'Suitable for design requirements'
    }
    - Fins (${rocketParams.materials.fins}): ${
      rocketParams.materials.fins === 'carbon_fiber' ? 'Maximum rigidity and minimum weight' :
      rocketParams.materials.fins === 'fiberglass' ? 'Strong and impact-resistant' :
      rocketParams.materials.fins === 'aluminum' ? 'Good for high-speed stability' :
      'Adequate for design velocity'
    }`,
    recoverySystemAnalysis: `
    Recovery System Analysis:
    - Type: ${rocketParams.recoverySystem.type}
    - Deployment velocity: ${results.maxVelocity.toFixed(2)}m/s
    - Landing velocity: ${results.landingVelocity.toFixed(2)}m/s
    
    Recommendations:
    ${rocketParams.recoverySystem.type === 'parachute'
      ? `- Current parachute size: ${rocketParams.recoverySystem.parachuteSize}m\n` +
        `- Optimal size: ${(rocketParams.mass * 2.5).toFixed(2)}m for safe descent\n` +
        '- Consider adding swivel to prevent tangling'
      : rocketParams.recoverySystem.type === 'streamer'
      ? '- Add reinforcement at attachment points\n' +
        '- Consider upgrading to parachute for better control'
      : '- Verify ejection charge sizing\n' +
        '- Test deployment mechanism before flight'
    }
    - Shock cord length: ${rocketParams.recoverySystem.shockCordLength}m (${
      rocketParams.recoverySystem.shockCordLength < rocketParams.length * 2
      ? 'Consider increasing length'
      : 'Length is adequate'
    })
    - Ejection charge: ${rocketParams.recoverySystem.ejectionCharge}kg (${
      rocketParams.recoverySystem.ejectionCharge < 0.002
      ? 'May need increase'
      : 'Properly sized'
    })`
  };
}

function generateAnalysisPrompt(
  rocketParams: RocketParameters,
  simParams: SimulationParameters,
  results: SimulationResults
): string {
  const lengthToDiameterRatio = rocketParams.length / rocketParams.diameter;
  const thrustToWeightRatio = (rocketParams.motorImpulse / 3) / (rocketParams.mass * 9.81); // Assuming 3s burn time
  const finThicknessRatio = rocketParams.thickness.fins / rocketParams.finSpan;
  
  return `
Analyze this model rocket design and simulation results:

ROCKET SPECIFICATIONS:
1. Key Ratios
   - Length-to-diameter ratio: ${lengthToDiameterRatio.toFixed(2)}
   - Thrust-to-weight ratio: ${thrustToWeightRatio.toFixed(2)}
   - Fin thickness-to-span ratio: ${finThicknessRatio.toFixed(4)}

2. Dimensions
   - Length: ${rocketParams.length}m
   - Diameter: ${rocketParams.diameter}m
   - Mass: ${rocketParams.mass}kg

3. Nose Cone
   - Type: ${rocketParams.noseConeType}
   - Length: ${rocketParams.noseLength}m
   - Material: ${rocketParams.materials.noseCone}
   - Thickness: ${rocketParams.thickness.noseCone}m

4. Body Tube
   - Material: ${rocketParams.materials.bodyTube}
   - Thickness: ${rocketParams.thickness.bodyTube}m

5. Fins
   - Type: ${rocketParams.finType}
   - Count: ${rocketParams.numFins}
   - Root chord: ${rocketParams.finRootChord}m
   - Tip chord: ${rocketParams.finTipChord}m
   - Span: ${rocketParams.finSpan}m
   - Material: ${rocketParams.materials.fins}
   - Thickness: ${rocketParams.thickness.fins}m

6. Propulsion
   - Motor: ${rocketParams.motorType}
   - Total impulse: ${rocketParams.motorImpulse}N⋅s

7. Recovery
   - Type: ${rocketParams.recoverySystem.type}
   - Parachute size: ${rocketParams.recoverySystem.parachuteSize || 'N/A'}m
   - Shock cord: ${rocketParams.recoverySystem.shockCordLength || 'N/A'}m
   - Ejection charge: ${rocketParams.recoverySystem.ejectionCharge || 'N/A'}kg

SIMULATION RESULTS:
1. Performance
   - Maximum altitude: ${results.maxAltitude}m
   - Maximum velocity: ${results.maxVelocity}m/s
   - Flight time: ${results.flightTime}s
   - Landing velocity: ${results.landingVelocity}m/s
   - Maximum distance: ${results.maxDistance}m
   - Drag coefficient: ${results.dragCoefficient}

2. Stability
   - Margin: ${results.stabilityMargin} calibers
   - CP location: ${results.centerOfPressure.y}m from nose
   - CG location: ${results.centerOfGravity.y}m from nose
   - CM location: ${results.centerOfMass.y}m from nose

3. Launch Conditions
   - Angle: ${simParams.launchAngle}°
   - Wind speed: ${simParams.windSpeed}m/s
   - Temperature: ${simParams.temperature}K
   - Pressure: ${simParams.pressure}Pa
   - Altitude: ${simParams.altitude}m

Provide a comprehensive analysis with SPECIFIC, NUMERICAL recommendations for improving stability and maximum altitude.
Focus on practical dimensional changes and their expected performance impacts.
Include precise before/after values for all suggestions.`;
}

function parseAIResponse(response: string): AIAnalysis {
  const sections = {
    stabilityAnalysis: '',
    performanceAnalysis: '',
    safetyRecommendations: '',
    optimizationSuggestions: '',
    materialAnalysis: '',
    recoverySystemAnalysis: ''
  };

  const matches = {
    stabilityAnalysis: response.match(/STABILITY_ANALYSIS:?\s*([\s\S]*?)(?=PERFORMANCE_ANALYSIS:|$)/i),
    performanceAnalysis: response.match(/PERFORMANCE_ANALYSIS:?\s*([\s\S]*?)(?=SAFETY_RECOMMENDATIONS:|$)/i),
    safetyRecommendations: response.match(/SAFETY_RECOMMENDATIONS:?\s*([\s\S]*?)(?=OPTIMIZATION_SUGGESTIONS:|$)/i),
    optimizationSuggestions: response.match(/OPTIMIZATION_SUGGESTIONS:?\s*([\s\S]*?)(?=$)/i)
  };

  for (const [key, match] of Object.entries(matches)) {
    if (match && match[1]) {
      sections[key as keyof typeof sections] = match[1].trim();
    }
  }

  return sections;
}