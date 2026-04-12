import React, { useState, useEffect } from 'react';
import { Calculator, Plus, RotateCcw } from 'lucide-react';

interface Triangle {
  id: number;
  a: string;
  b: string;
  c: string;
  area: number;
}

export function AreaCalculatorTool() {
  const [unit, setUnit] = useState<'m' | 'ft'>('m');
  const [triangles, setTriangles] = useState<Triangle[]>([{ id: Date.now(), a: '', b: '', c: '', area: 0 }]);
  const [totalSqM, setTotalSqM] = useState(0);
  const [totalSqFt, setTotalSqFt] = useState(0);
  const [hillText, setHillText] = useState('');
  const [teraiText, setTeraiText] = useState('');

  const addTriangle = () => {
    setTriangles([...triangles, { id: Date.now(), a: '', b: '', c: '', area: 0 }]);
  };

  const updateTriangle = (id: number, field: 'a' | 'b' | 'c', value: string) => {
    setTriangles(triangles.map(t => {
      if (t.id === id) {
        const newT = { ...t, [field]: value };
        const a = parseFloat(newT.a) || 0;
        const b = parseFloat(newT.b) || 0;
        const c = parseFloat(newT.c) || 0;
        let area = 0;
        if (a && b && c) {
          const s = (a + b + c) / 2;
          const val = s * (s - a) * (s - b) * (s - c);
          if (val > 0) area = Math.sqrt(val);
        }
        newT.area = area;
        return newT;
      }
      return t;
    }));
  };

  useEffect(() => {
    let totalArea = triangles.reduce((sum, t) => sum + t.area, 0);
    let sqFt = unit === 'm' ? totalArea * 10.7639 : totalArea;
    let sqM = unit === 'ft' ? totalArea * 0.092903 : totalArea;

    setTotalSqM(sqM);
    setTotalSqFt(sqFt);

    // Hill
    let ropani = Math.floor(sqFt / 5476);
    let remHill = sqFt % 5476;
    let aana = Math.floor(remHill / 342.25);
    remHill %= 342.25;
    let paisa = Math.floor(remHill / 85.56);
    remHill %= 85.56;
    let dam = Math.floor(remHill / 21.39);
    setHillText(`🏔 ${ropani}R ${aana}A ${paisa}P ${dam}D`);

    // Terai
    let bigha = Math.floor(sqFt / 72900);
    let remTerai = sqFt % 72900;
    let kattha = Math.floor(remTerai / 3645);
    remTerai %= 3645;
    let dhur = Math.floor(remTerai / 182.25);
    setTeraiText(`🌾 ${bigha}B ${kattha}K ${dhur}D`);
  }, [triangles, unit]);

  const resetAll = () => {
    setTriangles([{ id: Date.now(), a: '', b: '', c: '', area: 0 }]);
  };

  return (
    <div className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
            <Calculator size={24} />
          </div>
          <h2 className="text-2xl font-bold">📐 Area Calculator</h2>
        </div>
        <div className="flex bg-muted rounded-lg p-1 w-full md:w-auto">
          <button
            onClick={() => setUnit('m')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-colors ${unit === 'm' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Meter
          </button>
          <button
            onClick={() => setUnit('ft')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-colors ${unit === 'ft' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Feet
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {triangles.map((t, index) => (
          <div key={t.id} className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-primary mb-4">Triangle {index + 1}</h4>
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
              <input 
                type="number" placeholder="Side A" step="any"
                value={t.a} onChange={(e) => updateTriangle(t.id, 'a', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none text-center"
              />
              <input 
                type="number" placeholder="Side B" step="any"
                value={t.b} onChange={(e) => updateTriangle(t.id, 'b', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none text-center"
              />
              <input 
                type="number" placeholder="Side C" step="any"
                value={t.c} onChange={(e) => updateTriangle(t.id, 'c', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none text-center"
              />
            </div>
            <p className="text-sm font-semibold text-slate-600 bg-white inline-block px-4 py-2 rounded-lg border border-slate-200">
              Area: <span className="text-accent">{t.area.toFixed(2)}</span> sq {unit}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={addTriangle}
          className="flex-1 bg-accent/10 text-accent hover:bg-accent/20 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Triangle
        </button>
        <button 
          onClick={resetAll}
          className="px-6 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>

      <div className="bg-primary text-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
        <h2 className="text-primary-foreground/70 text-sm uppercase tracking-wider font-bold mb-4">Total Area</h2>
        <h3 className="text-3xl md:text-4xl font-bold text-accent mb-6">
          {totalSqM.toFixed(2)} Sq.m <span className="text-white/40 mx-2">|</span> {totalSqFt.toFixed(2)} Sq.ft
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Hill Region</p>
            <p className="font-semibold">{hillText}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Terai Region</p>
            <p className="font-semibold">{teraiText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
