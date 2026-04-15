import { useState, useEffect } from 'react';
import { 
  Home, 
  Wrench, 
  BookOpen, 
  Tag, 
  Phone, 
  ChevronDown,
  Menu,
  X,
  Calculator,
  Ruler,
  Compass,
  Hammer,
  Briefcase,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, setDoc, getDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export type TabType = 'webpage' | 'tools' | 'projects' | 'blogs' | 'offers' | 'contact';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
}

export function Sidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, selectedTool, setSelectedTool }: SidebarProps) {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const visitDocRef = doc(db, 'stats', 'visits');

    const recordVisit = async () => {
      if (!sessionStorage.getItem('hasVisited')) {
        try {
          const docSnap = await getDoc(visitDocRef);
          if (!docSnap.exists()) {
            await setDoc(visitDocRef, { count: 1 });
          } else {
            await updateDoc(visitDocRef, { count: increment(1) });
          }
          sessionStorage.setItem('hasVisited', 'true');
        } catch (error) {
          console.error("Error recording visit:", error);
        }
      }
    };

    recordVisit();

    const unsubscribe = onSnapshot(visitDocRef, (doc) => {
      if (doc.exists()) {
        setVisitCount(doc.data().count);
      }
    });

    return () => unsubscribe();
  }, []);

  const navItems: Array<{
    id: string;
    label: string;
    icon: any;
    hasDropdown?: boolean;
    subItems?: Array<{ id: string; label: string; icon: any }>;
  }> = [
    { id: 'webpage', label: 'Webpage', icon: Home },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { 
      id: 'tools', 
      label: 'App Tools', 
      icon: Wrench,
      hasDropdown: true,
      subItems: [
        { id: 'compass', label: 'Vastu Digital Compass', icon: Compass },
        { id: 'area', label: 'Area Calculator', icon: Ruler },
        { id: 'estimate', label: 'Quick Estimate', icon: Calculator },
      ]
    },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'contact', label: 'Contact Us', icon: Phone },
  ];

  const handleTabClick = (id: string, hasDropdown?: boolean) => {
    if (hasDropdown) {
      setIsToolsOpen(!isToolsOpen);
      setActiveTab(id as TabType);
      if (id === 'tools' && !isToolsOpen) {
        setSelectedTool(null); // Reset tool when opening the dropdown
      }
    } else {
      setActiveTab(id as TabType);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-72 bg-primary text-primary-foreground flex flex-col transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="https://drive.google.com/uc?export=view&id=1HjURU1VvNpc2zSYNwzumvz9vg8nTaU0P" 
              alt="Shape & Structure Builders Logo" 
              className="h-12 w-auto object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                // Fallback if image is not yet uploaded
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
              S&S
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-wide">Shape & Structure</h2>
              <p className="text-xs text-primary-foreground/60 uppercase tracking-widest font-medium mt-0.5">Builders</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-primary-foreground/60 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleTabClick(item.id, item.hasDropdown)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-accent text-white font-semibold shadow-lg shadow-accent/20" 
                    : "text-primary-foreground/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-primary-foreground/50"} />
                  <span>{item.label}</span>
                </div>
                {item.hasDropdown && (
                  <ChevronDown 
                    size={16} 
                    className={cn("transition-transform duration-200", isToolsOpen && "rotate-180")} 
                  />
                )}
              </button>

              {/* Dropdown for Tools */}
              {item.hasDropdown && (
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isToolsOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}>
                  <div className="pl-11 pr-4 py-2 space-y-1 border-l-2 border-white/10 ml-6">
                    {item.subItems?.map((subItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab('tools');
                          setSelectedTool(subItem.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                          activeTab === 'tools' && selectedTool === subItem.id
                            ? "text-accent bg-white/10 font-medium"
                            : "text-primary-foreground/60 hover:text-accent hover:bg-white/5"
                        )}
                      >
                        <subItem.icon size={14} />
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="p-6 border-t border-white/10 flex flex-col gap-4">
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-sm text-primary-foreground/80 mb-3">Need immediate help?</p>
            <a 
              href="tel:+9779841737795" 
              className="inline-flex items-center justify-center gap-2 w-full bg-white text-primary font-semibold py-2 rounded-lg hover:bg-accent hover:text-white transition-colors"
            >
              <Phone size={16} /> Call Us
            </a>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
            <div className="p-2 bg-accent/20 text-accent rounded-lg">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[10px] text-primary-foreground/60 font-medium uppercase tracking-wider">Total Visits</p>
              <p className="text-lg font-bold text-white leading-none mt-1">
                {visitCount !== null ? visitCount.toLocaleString() : '...'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
