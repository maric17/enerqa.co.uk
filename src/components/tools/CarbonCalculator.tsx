'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

export default function CarbonCalculator() {
  const [electricity, setElectricity] = useState<number | ''>('');
  const [fuel, setFuel] = useState<number | ''>('');
  const [flights, setFlights] = useState<number | ''>('');
  const [result, setResult] = useState<number | null>(null);

  const calculateFootprint = () => {
    // Basic mock conversion factors for kgCO2e
    const electricityFactor = 0.5; // kg per kWh
    const fuelFactor = 2.3; // kg per liter of gasoline
    const flightFactor = 250; // kg per short-haul flight

    const e = Number(electricity) || 0;
    const f = Number(fuel) || 0;
    const fl = Number(flights) || 0;

    const total = (e * electricityFactor) + (f * fuelFactor) + (fl * flightFactor);
    setResult(total);
  };

  const handleReset = () => {
    setElectricity('');
    setFuel('');
    setFlights('');
    setResult(null);
  };

  return (
    <div className="w-full bg-[#FAFBFB] p-8 rounded-[16px] border border-ink/10 shadow-sm flex flex-col md:flex-row gap-12 mt-8">
      
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-6">
        <Typography variant="h3" className="text-ink m-0">
          <span className="en block">Calculate Your Footprint</span>
          <span className="ar block mt-1">احسب بصمتك الكربونية</span>
        </Typography>
        <p className="text-[14px] text-ink-soft">
          <span className="en">Enter your monthly consumption to estimate your carbon footprint.</span>
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
              <span className="en">Electricity (kWh/month)</span>
            </label>
            <input 
              type="number" 
              value={electricity}
              onChange={(e) => setElectricity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 500"
              className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] outline-none focus:border-ink/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
              <span className="en">Fuel Consumption (Liters/month)</span>
            </label>
            <input 
              type="number" 
              value={fuel}
              onChange={(e) => setFuel(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 120"
              className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] outline-none focus:border-ink/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
              <span className="en">Flights (per year)</span>
            </label>
            <input 
              type="number" 
              value={flights}
              onChange={(e) => setFlights(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 2"
              className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] outline-none focus:border-ink/30"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <Button onClick={calculateFootprint} variant="default" className="flex-1 justify-center">
            <span className="en">Calculate</span>
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1 justify-center">
            <span className="en">Reset</span>
          </Button>
        </div>
      </div>

      {/* Result Section */}
      <div className="flex-1 flex items-center justify-center border-t md:border-t-0 md:border-l border-ink/10 pt-8 md:pt-0 md:pl-8">
        {result === null ? (
          <div className="text-center text-ink-soft opacity-50 flex flex-col items-center gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span className="en">Your result will appear here.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <Typography variant="eyebrow" className="text-ink-muted">
              <span className="en">Estimated Carbon Footprint</span>
            </Typography>
            <div className="text-6xl font-bold text-[#A8192E] tracking-tight">
              {result.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
            <Typography variant="body" className="text-ink font-medium uppercase tracking-widest text-sm mt-2">
              kg CO₂e
            </Typography>
            
            <div className="mt-6 p-4 bg-white rounded-lg border border-[#A8192E]/20 text-[14px] text-ink-soft max-w-xs">
              <span className="en">
                {result < 500 
                  ? "Great job! Your footprint is well below the global monthly average." 
                  : result < 1500 
                  ? "Your footprint is around the global average. Consider small steps to reduce it!"
                  : "Your footprint is above average. Check out our mitigation toolkits for ways to improve."}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
