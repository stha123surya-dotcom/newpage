import { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const vastuData: Record<string, { best: string[], bad: string[] }> = {
  "North": { best: ["living", "entrance", "pooja"], bad: ["bedroom", "septic", "overhead"] },
  "North-East": { best: ["pooja", "entrance", "underground"], bad: ["toilet", "kitchen", "septic", "staircase"] },
  "East": { best: ["living", "entrance", "dining"], bad: ["toilet", "septic"] },
  "South-East": { best: ["kitchen", "parking"], bad: ["underground", "pooja", "bedroom"] },
  "South": { best: ["bedroom", "staircase"], bad: ["underground", "pooja", "entrance"] },
  "South-West": { best: ["bedroom", "overhead", "store"], bad: ["entrance", "pooja", "underground", "septic"] },
  "West": { best: ["dining", "overhead", "toilet", "lift"], bad: ["pooja", "entrance"] },
  "North-West": { best: ["servant", "parking", "septic", "toilet"], bad: ["pooja", "bedroom"] }
};

const roomOptions = [
  { value: "entrance", label: "Main Entrance" },
  { value: "pooja", label: "Pooja Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Master Bedroom" },
  { value: "living", label: "Living Room" },
  { value: "dining", label: "Dining Room" },
  { value: "store", label: "Store Room" },
  { value: "parking", label: "Parking / Porch" },
  { value: "staircase", label: "Staircase" },
  { value: "servant", label: "Servant Quarter" },
  { value: "overhead", label: "Overhead Tank" },
  { value: "underground", label: "Underground Tank" },
  { value: "septic", label: "Septic Tank" },
  { value: "lift", label: "Lift" },
  { value: "toilet", label: "Toilet/Bathroom" }
];

export function CompassTool() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("entrance");

  const startCompass = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
          setIsStarted(true);
        } else {
          setError('Permission to access device orientation was denied.');
        }
      } catch (err) {
        setError('Error requesting device orientation permission.');
      }
    } else if (typeof window !== 'undefined' && 'ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      setIsStarted(true);
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      (window as any).addEventListener('deviceorientation', handleOrientation as any, true);
      setIsStarted(true);
    } else {
      setError('Device orientation is not supported on this device.');
    }
  };

  const handleOrientation = (event: DeviceOrientationEventiOS) => {
    let compassHeading = null;
    if (event.webkitCompassHeading) {
      // Apple devices
      compassHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android devices
      compassHeading = 360 - event.alpha;
    }
    
    if (compassHeading !== null) {
      setHeading(Math.round(compassHeading));
    }
  };

  useEffect(() => {
    startCompass();
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
    };
  }, []);

  const getDirection = (degree: number) => {
    if (degree >= 337.5 || degree < 22.5) return 'North';
    if (degree >= 22.5 && degree < 67.5) return 'North-East';
    if (degree >= 67.5 && degree < 112.5) return 'East';
    if (degree >= 112.5 && degree < 157.5) return 'South-East';
    if (degree >= 157.5 && degree < 202.5) return 'South';
    if (degree >= 202.5 && degree < 247.5) return 'South-West';
    if (degree >= 247.5 && degree < 292.5) return 'West';
    if (degree >= 292.5 && degree < 337.5) return 'North-West';
    return 'North';
  };

  const getVastuStatus = (dir: string, room: string) => {
    const data = vastuData[dir];
    if (!data) return { status: 'neutral', message: 'Tap Start to begin Vastu analysis.' };
    
    const isGood = data.best.includes(room);
    const isBad = data.bad.includes(room);
    const roomLabel = roomOptions.find(r => r.value === room)?.label || room;

    if (isGood) {
      return { status: 'good', message: `EXCELLENT: The ${dir} zone is highly recommended for ${roomLabel}.` };
    } else if (isBad) {
      return { status: 'bad', message: `AVOID: ${roomLabel} in ${dir} is considered a major Vastu defect.` };
    } else {
      return { status: 'neutral', message: `NEUTRAL: ${roomLabel} in ${dir} is acceptable with minor adjustments.` };
    }
  };

  const currentDirection = heading !== null ? getDirection(heading) : 'North';
  const vastuInfo = getVastuStatus(currentDirection, selectedRoom);

  const getRingColor = () => {
    if (!isStarted || heading === null) return 'border-muted';
    if (vastuInfo.status === 'good') return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]';
    if (vastuInfo.status === 'bad') return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
    return 'border-slate-400';
  };

  const getBoxColor = () => {
    if (!isStarted || heading === null) return 'border-l-muted';
    if (vastuInfo.status === 'good') return 'border-l-green-500 bg-green-50 text-green-800';
    if (vastuInfo.status === 'bad') return 'border-l-red-500 bg-red-50 text-red-800';
    return 'border-l-slate-400 bg-slate-50 text-slate-800';
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-primary">Vastu Digital Compass</h2>
      <div className="h-1 w-12 bg-accent rounded-full mb-6"></div>
      
      <div className="w-full mb-8 text-left">
        <label htmlFor="roomSelect" className="block text-sm font-semibold text-primary mb-2">Select Room/Element:</label>
        <select 
          id="roomSelect"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
        >
          {roomOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl mb-6 w-full">{error}</div>
      ) : !isStarted ? (
        <div className="flex flex-col items-center w-full">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-primary">
            <Compass size={48} />
          </div>
          <p className="text-muted-foreground mb-6">
            Click the button below to enable the compass. You may need to grant permission and calibrate your device by moving it in a figure-8 motion.
          </p>
          <button 
            onClick={startCompass}
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors w-full"
          >
            Enable Compass
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
            {/* Status Ring */}
            <div className={`absolute inset-0 rounded-full border-8 transition-all duration-300 ${getRingColor()}`}></div>
            
            {/* Compass Dial */}
            <div 
              className="absolute w-[85%] h-[85%] rounded-full border-4 border-primary bg-white transition-transform duration-100 ease-linear"
              style={{ transform: `rotate(${- (heading || 0)}deg)` }}
            >
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-1.5 h-5 bg-red-500 rounded-sm z-10"></div>
              
              <div className="absolute inset-0 flex items-center justify-center font-bold text-primary text-sm">
                <div className="absolute top-2">N</div>
                <div className="absolute top-6 right-6">NE</div>
                <div className="absolute right-2">E</div>
                <div className="absolute bottom-6 right-6">SE</div>
                <div className="absolute bottom-2">S</div>
                <div className="absolute bottom-6 left-6">SW</div>
                <div className="absolute left-2">W</div>
                <div className="absolute top-6 left-6">NW</div>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <h3 className="text-2xl font-bold text-primary mb-1">
              {heading !== null ? currentDirection : 'Calibrating...'}
            </h3>
            <p className="text-xl font-semibold text-muted-foreground mb-4">
              {heading !== null ? `${heading}°` : '--°'}
            </p>
            
            <div className={`p-4 rounded-xl text-left border-l-4 transition-all duration-300 ${getBoxColor()}`}>
              {heading !== null ? vastuInfo.message : 'Tap Start to begin Vastu analysis.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
