import { useState } from 'react';
import { Building } from 'lucide-react';

export function QuickEstimateTool() {
  const [floors, setFloors] = useState<number>(1);
  const [constructionType, setConstructionType] = useState<string>('residential');
  const [rooms, setRooms] = useState<string>('');

  // Assumptions based on the URL's description
  const STANDARD_ROOM_SIZE_SQFT = 150;
  const STANDARD_RATE_PER_SQFT = 3500;

  const calculateEstimate = () => {
    const r = parseInt(rooms);
    if (isNaN(r) || r <= 0) return { area: 0, cost: 0 };
    
    const totalArea = r * STANDARD_ROOM_SIZE_SQFT * floors;
    const totalCost = totalArea * STANDARD_RATE_PER_SQFT;
    
    return { area: totalArea, cost: totalCost };
  };

  const { area, cost } = calculateEstimate();

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
          <Building size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Quick Estimate</h2>
          <p className="text-sm text-muted-foreground">Assumption based calculation</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary">Number of Floors</label>
          <select 
            value={floors}
            onChange={(e) => setFloors(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all appearance-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Floor' : 'Floors'}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary">Construction Type</label>
          <select 
            value={constructionType}
            onChange={(e) => setConstructionType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all appearance-none"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary">Number of Rooms (per floor)</label>
          <input 
            type="number" 
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            placeholder="e.g. 4"
          />
        </div>
      </div>

      <div className="bg-muted p-6 rounded-2xl mb-6 text-sm text-muted-foreground">
        <p className="mb-2"><strong>Note:</strong> For Detailed estimation Please contact with us.</p>
        <p>These are assumption based calculation. There are some standard room size calculated for the area calculation. The Rates are calculated standard Rates as per market trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-primary/10">
          <span className="text-primary/70 text-sm uppercase tracking-wider font-semibold mb-2">Estimated Area</span>
          <div className="text-3xl font-bold text-primary">
            {area > 0 ? area.toLocaleString() : '0'} <span className="text-lg font-normal text-primary/60">sq ft</span>
          </div>
        </div>
        <div className="bg-accent/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-accent/20">
          <span className="text-accent/80 text-sm uppercase tracking-wider font-semibold mb-2">Estimated Cost</span>
          <div className="text-3xl font-bold text-accent">
            <span className="text-lg font-normal text-accent/60 mr-1">Rs.</span>
            {cost > 0 ? cost.toLocaleString() : '0'}
          </div>
        </div>
      </div>
    </div>
  );
}
