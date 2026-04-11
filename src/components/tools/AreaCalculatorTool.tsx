import { useState } from 'react';
import { Calculator } from 'lucide-react';

export function AreaCalculatorTool() {
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');

  const calculateArea = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (isNaN(l) || isNaN(w)) return 0;
    return l * w;
  };

  const area = calculateArea();

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
          <Calculator size={24} />
        </div>
        <h2 className="text-2xl font-bold">Area Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary">Length</label>
          <div className="relative">
            <input 
              type="number" 
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {unit === 'feet' ? 'ft' : 'm'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-primary">Width</label>
          <div className="relative">
            <input 
              type="number" 
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {unit === 'feet' ? 'ft' : 'm'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-sm font-semibold text-primary">Unit:</span>
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setUnit('feet')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${unit === 'feet' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Feet
          </button>
          <button
            onClick={() => setUnit('meters')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${unit === 'meters' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Meters
          </button>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex flex-col items-center justify-center text-center">
        <span className="text-primary-foreground/70 text-sm uppercase tracking-wider font-semibold mb-2">Total Area</span>
        <div className="text-4xl md:text-5xl font-bold text-accent">
          {area > 0 ? area.toFixed(2) : '0.00'}
        </div>
        <span className="text-primary-foreground/70 mt-2">
          square {unit}
        </span>
      </div>
    </div>
  );
}
