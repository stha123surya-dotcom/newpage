import { useState, useEffect } from 'react';
import { SEO } from '../SEO';
import { Calculator, Ruler, Compass, Hammer, LogIn, LogOut, ArrowLeft } from 'lucide-react';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { CompassTool } from '../tools/CompassTool';
import { AreaCalculatorTool } from '../tools/AreaCalculatorTool';
import { QuickEstimateTool } from '../tools/QuickEstimateTool';

interface AppToolsTabProps {
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
}

export function AppToolsTab({ selectedTool, setSelectedTool }: AppToolsTabProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        const domain = window.location.hostname;
        alert(`ACTION REQUIRED: Unauthorized Domain\n\nFirebase is blocking the login because this exact URL is not authorized yet.\n\nPlease copy this exact text:\n${domain}\n\nAnd add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else {
        alert(`Login failed: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedTool(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const tools = [
    { id: "compass", name: "Vastu Digital Compass", icon: Compass, desc: "Check directions and Vastu alignment." },
    { id: "area", name: "Area Calculator", icon: Ruler, desc: "Calculate total area from length and width." },
    { id: "estimate", name: "Quick Estimate", icon: Calculator, desc: "Get a rough cost estimate based on rooms and floors." },
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  }

  if (!user) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SEO title="App Tools Login" description="Login to access our construction tools." />
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
          <Hammer size={40} className="text-accent" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Access App Tools</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          Please log in to access our suite of professional construction and estimation tools.
        </p>
        <button 
          onClick={handleLogin}
          className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <LogIn size={20} /> Sign in with Google
        </button>
      </div>
    );
  }

  const renderTool = () => {
    switch (selectedTool) {
      case 'compass': return <CompassTool />;
      case 'area': return <AreaCalculatorTool />;
      case 'estimate': return <QuickEstimateTool />;
      default: return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title={selectedTool ? `${tools.find(t => t.id === selectedTool)?.name} | App Tools` : "App Tools"} 
        description="Experience our construction and building tools to help you plan and estimate your projects." 
      />
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {selectedTool ? (
            <button 
              onClick={() => setSelectedTool(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 font-medium"
            >
              <ArrowLeft size={20} /> Back to Tools
            </button>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4">Experience our Tools</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Welcome back, {user.displayName}! We provide a suite of digital tools to help you estimate materials, plan spaces, and track your construction projects efficiently.
              </p>
            </>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium shrink-0"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {selectedTool ? (
        <div className="max-w-3xl mx-auto">
          {renderTool()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              onClick={() => setSelectedTool(tool.id)}
              className="group bg-surface p-6 rounded-2xl border border-border hover:border-accent hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 shrink-0 bg-muted group-hover:bg-accent/10 rounded-2xl flex items-center justify-center text-primary group-hover:text-accent transition-colors">
                <tool.icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{tool.name}</h3>
                <p className="text-muted-foreground text-sm">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
