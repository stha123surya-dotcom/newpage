import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar, TabType } from './components/Sidebar';
import { WebpageTab } from './components/tabs/WebpageTab';
import { AppToolsTab } from './components/tabs/AppToolsTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { BlogsTab } from './components/tabs/BlogsTab';
import { OffersTab } from './components/tabs/OffersTab';
import { ContactTab } from './components/tabs/ContactTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('webpage');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'webpage': return <WebpageTab setActiveTab={setActiveTab} />;
      case 'tools': return <AppToolsTab selectedTool={selectedTool} setSelectedTool={setSelectedTool} />;
      case 'projects': return <ProjectsTab />;
      case 'blogs': return <BlogsTab />;
      case 'offers': return <OffersTab setActiveTab={setActiveTab} />;
      case 'contact': return <ContactTab />;
      default: return <WebpageTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <img 
              src="https://drive.google.com/uc?export=view&id=1HjURU1VvNpc2zSYNwzumvz9vg8nTaU0P" 
              alt="Logo" 
              className="h-8 w-auto object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-8 h-8 bg-accent rounded-md flex items-center justify-center font-bold text-sm shadow-sm">
              S&S
            </div>
            <span className="font-bold tracking-wide">Shape & Structure</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Helper footer for Firebase Domain Authorization */}
      <div className="fixed bottom-0 right-0 p-2 text-[10px] text-muted-foreground bg-surface/80 backdrop-blur-sm border-t border-l border-border rounded-tl-lg z-50">
        Current Domain: <span className="font-mono select-all">{window.location.hostname}</span>
      </div>
    </div>
  );
}
