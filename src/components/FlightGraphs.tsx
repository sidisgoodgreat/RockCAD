import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { useRocketStore } from '../store/rocketStore';

export function FlightGraphs() {
  const { simulationResults, unitSystem, convertValue } = useRocketStore();

  if (!simulationResults?.timePoints || !simulationResults?.flightPath) return null;

  // Calculate velocity profile
  const data = simulationResults.timePoints.map((time, index) => {
    const altitude = convertValue(simulationResults.flightPath?.[index]?.[1] ?? 0, 'm', unitSystem);
    
    // Calculate velocity using a more realistic flight profile
    let velocity = 0;
    const burnTime = 1.8; // D12-7 motor burn time in seconds
    const maxVelocity = simulationResults.maxVelocity ?? 0;
    const g = 9.81; // Gravitational acceleration (m/s²)
    
    if (time <= burnTime) {
      // Powered ascent phase - linear acceleration to max velocity
      velocity = (maxVelocity * time) / burnTime;
    } else {
      // Coast and descent phases
      const timeAfterBurn = time - burnTime;
      const apogeeTime = 3.0; // Time at apogee in seconds
      
      if (time < apogeeTime) {
        // Coast phase - decreasing velocity due to gravity
        velocity = maxVelocity - g * timeAfterBurn;
      } else {
        // Descent phase
        const descentTime = time - apogeeTime;
        
        // Terminal velocity calculation (negative for descent)
        const terminalVelocity = -30; // m/s
        velocity = terminalVelocity * (1 - Math.exp(-descentTime));
      }
    }

    // At the very last time point, set velocity to 0
    if (index === simulationResults.timePoints.length - 1) {
      velocity = 0;
    }

    return {
      time: time,
      altitude: Number(altitude.toFixed(2)),
      velocity: Number(velocity.toFixed(2)),
    };
  });

  const formatTooltipValue = (value: number) => {
    return Number(value.toFixed(2));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-black">Flight Data Graphs</h2>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Altitude vs Time</h3>
          <div className="h-[300px] bg-white rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 40
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  label={{ 
                    value: 'Time (seconds)', 
                    position: 'insideBottom', 
                    offset: -10,
                    style: { fill: 'black' }
                  }}
                  tickFormatter={formatTooltipValue}
                  domain={[0, 'auto']}
                />
                <YAxis 
                  label={{ 
                    value: `Altitude (${unitSystem})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 10,
                    style: { fill: 'black' }
                  }}
                  tickFormatter={formatTooltipValue}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="altitude" 
                  stroke="#8884d8" 
                  name={`Altitude (${unitSystem})`}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Velocity vs Time</h3>
          <div className="h-[300px] bg-white rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 40
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  label={{ 
                    value: 'Time (seconds)', 
                    position: 'insideBottom', 
                    offset: -10,
                    style: { fill: 'black' }
                  }}
                  tickFormatter={formatTooltipValue}
                  domain={[0, 'auto']}
                />
                <YAxis 
                  label={{ 
                    value: 'Velocity (m/s)', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 10,
                    style: { fill: 'black' }
                  }}
                  domain={['auto', 'auto']}
                  tickFormatter={formatTooltipValue}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="velocity" 
                  stroke="#82ca9d" 
                  name="Velocity (m/s)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}