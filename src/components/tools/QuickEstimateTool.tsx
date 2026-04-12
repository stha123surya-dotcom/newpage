import { useState, useEffect } from 'react';

const roomData = {
  bedroom: { size: 120, label: "Bedroom" },
  toilet: { size: 36, label: "Toilet" },
  attachedToilet: { size: 33, label: "Attached Toilet" },
  staircase: { size: 97.5, label: "Staircase" },
  kitchenDining: { size: 195, label: "Kitchen Dining" },
  porch: { size: 168, label: "Porch" },
  balcony: { size: 18, label: "Balcony" },
  laundry: { size: 30, label: "Laundry" }
};

export function QuickEstimateTool() {
  const [floorCount, setFloorCount] = useState<number>(1);
  const [costType, setCostType] = useState<number>(2800);
  
  // State to hold room counts: { floorIndex: { roomKey: count } }
  const [roomCounts, setRoomCounts] = useState<Record<number, Record<string, number>>>({
    1: Object.keys(roomData).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  });

  const [totalArea, setTotalArea] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [floorAreas, setFloorAreas] = useState<Record<number, number>>({});

  // When floor count changes, initialize new floors with 0 rooms
  useEffect(() => {
    setRoomCounts(prev => {
      const newCounts = { ...prev };
      for (let i = 1; i <= floorCount; i++) {
        if (!newCounts[i]) {
          newCounts[i] = Object.keys(roomData).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        }
      }
      return newCounts;
    });
  }, [floorCount]);

  // Calculate totals whenever inputs change
  useEffect(() => {
    let newTotalArea = 0;
    let newTotalCost = 0;
    const newFloorAreas: Record<number, number> = {};

    for (let i = 1; i <= floorCount; i++) {
      let floorArea = 0;
      const currentFloorRooms = roomCounts[i] || {};

      // Calculate area for this floor
      for (const [key, data] of Object.entries(roomData)) {
        const count = currentFloorRooms[key] || 0;
        floorArea += count * data.size;
      }

      // Add 20% for lobby/circulation
      floorArea += floorArea * 0.20;
      newFloorAreas[i] = Math.round(floorArea);
      newTotalArea += floorArea;

      // Cost logic: 1st floor is 1.5x
      const rateMultiplier = (i === 1) ? 1.5 : 1;
      const floorCost = floorArea * costType * rateMultiplier;
      newTotalCost += floorCost;
    }

    setFloorAreas(newFloorAreas);
    setTotalArea(Math.round(newTotalArea));
    setTotalCost(Math.round(newTotalCost));
  }, [floorCount, costType, roomCounts]);

  const handleRoomChange = (floorIndex: number, roomKey: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setRoomCounts(prev => ({
      ...prev,
      [floorIndex]: {
        ...prev[floorIndex],
        [roomKey]: Math.max(0, numValue) // Prevent negative numbers
      }
    }));
  };

  return (
    <div className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-sm relative pb-32">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Quick Estimate Tool</h2>
          <p className="text-sm text-muted-foreground">Assumption based calculation</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-border">
          <h3 className="text-lg font-semibold mb-4 text-primary">Floors (Select Nos. of Floors)</h3>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={floorCount}
            onChange={(e) => setFloorCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-border">
          <h3 className="text-lg font-semibold mb-4 text-primary">Construction Type</h3>
          <select 
            value={costType}
            onChange={(e) => setCostType(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all appearance-none"
          >
            <option value="2800">Normal</option>
            <option value="4000">Premium</option>
            <option value="5500">Luxury</option>
          </select>
        </div>

        <p className="text-primary font-medium">Please enter nos of room on the selection field below</p>

        <div className="space-y-6">
          {Array.from({ length: floorCount }, (_, i) => i + 1).map(floorNum => (
            <div key={floorNum} className="bg-white p-6 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.08)] border border-border">
              <h3 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">Floor {floorNum}</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(roomData).map(([key, data]) => (
                  <div key={key} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200 flex flex-col justify-between">
                    <div>
                      <label className="text-sm font-semibold text-primary block mb-1">{data.label}</label>
                      <span className="text-xs text-slate-500 block mb-2">{data.size} sq.ft</span>
                    </div>
                    <input 
                      type="number" 
                      min="0" 
                      value={roomCounts[floorNum]?.[key] || 0}
                      onChange={(e) => handleRoomChange(floorNum, key, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-center focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                ))}
              </div>
              
              <p className="font-bold text-primary text-lg bg-slate-100 inline-block px-4 py-2 rounded-lg">
                Area: <span className="text-accent">{floorAreas[floorNum] || 0}</span> sq.ft
              </p>
            </div>
          ))}
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-8">
          <p className="text-red-600 font-semibold mb-2">"For Detailed estimation Please contact with us."</p>
          <p className="text-sm text-slate-600">
            These are assumption based calculation. There are some standard room size calculated for the area calculation. The Rates are calculated standard Rates as per market trends.
          </p>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-slate-900 text-white rounded-b-3xl p-4 md:p-6 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="text-center">
          <small className="block text-slate-400 text-xs md:text-sm uppercase tracking-wider font-semibold mb-1">Total Area</small>
          <strong className="text-xl md:text-2xl font-bold">{totalArea.toLocaleString()} sq.ft</strong>
        </div>
        <div className="w-px h-12 bg-slate-700"></div>
        <div className="text-center">
          <small className="block text-slate-400 text-xs md:text-sm uppercase tracking-wider font-semibold mb-1">Estimated Cost</small>
          <strong className="text-xl md:text-2xl font-bold text-accent">Rs. {totalCost.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
