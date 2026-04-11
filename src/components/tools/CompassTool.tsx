import { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

export function CompassTool() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const startCompass = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
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
    } else if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      setIsStarted(true);
    } else if ('ondeviceorientation' in window) {
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
    return '';
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-6">Vastu Digital Compass</h2>
      
      {error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl mb-6">{error}</div>
      ) : !isStarted ? (
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-primary">
            <Compass size={48} />
          </div>
          <p className="text-muted-foreground mb-6 max-w-md">
            Click the button below to enable the compass. You may need to grant permission and calibrate your device by moving it in a figure-8 motion.
          </p>
          <button 
            onClick={startCompass}
            className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors"
          >
            Enable Compass
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-muted flex items-center justify-center">
              <div className="absolute top-2 text-red-500 font-bold">N</div>
              <div className="absolute bottom-2 text-primary font-bold">S</div>
              <div className="absolute right-2 text-primary font-bold">E</div>
              <div className="absolute left-2 text-primary font-bold">W</div>
            </div>
            <div 
              className="absolute inset-0 transition-transform duration-100 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${- (heading || 0)}deg)` }}
            >
              <div className="w-1 h-32 bg-gradient-to-t from-transparent via-primary to-red-500 rounded-full origin-bottom -translate-y-16"></div>
            </div>
          </div>
          
          <div className="text-4xl font-bold text-primary mb-2">
            {heading !== null ? `${heading}°` : '--°'}
          </div>
          <div className="text-xl font-semibold text-accent uppercase tracking-widest">
            {heading !== null ? getDirection(heading) : 'Calibrating...'}
          </div>
        </div>
      )}
    </div>
  );
}
