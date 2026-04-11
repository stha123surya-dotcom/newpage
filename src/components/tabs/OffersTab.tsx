import { SEO } from '../SEO';
import { Tag, CheckCircle2 } from 'lucide-react';

export function OffersTab() {
  const offers = [
    {
      title: "Free Initial Consultation",
      description: "Get a complimentary 1-hour consultation with our lead architects to discuss your dream project.",
      features: ["Site evaluation", "Budget estimation", "Design brainstorming"],
      validUntil: "Dec 31, 2026",
      featured: true
    },
    {
      title: "10% Off Residential Renovations",
      description: "Planning to remodel your home? Book now and get a 10% discount on all labor costs.",
      features: ["Kitchen remodeling", "Bathroom upgrades", "Living space expansion"],
      validUntil: "Nov 15, 2026",
      featured: false
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Special Offers" 
        description="Check out the latest offers and discounts from Shape & Structure Builders." 
      />
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Current Offers</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Take advantage of our limited-time promotions and special packages designed to give you the best value for your investment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {offers.map((offer, i) => (
          <div 
            key={i} 
            className={`relative rounded-3xl p-8 md:p-10 border ${
              offer.featured 
                ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20' 
                : 'bg-surface border-border hover:border-accent/50 transition-colors'
            }`}
          >
            {offer.featured && (
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                <Tag size={14} /> Featured
              </div>
            )}
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{offer.title}</h3>
            <p className={`mb-8 ${offer.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {offer.description}
            </p>
            
            <ul className="space-y-3 mb-8">
              {offer.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3">
                  <CheckCircle2 className={offer.featured ? 'text-accent' : 'text-primary'} size={20} />
                  <span className={offer.featured ? 'text-primary-foreground/90' : 'text-primary'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            <div className={`pt-6 border-t ${offer.featured ? 'border-primary-foreground/20' : 'border-border'} flex items-center justify-between`}>
              <span className="text-sm font-medium opacity-80">Valid until {offer.validUntil}</span>
              <button className={`px-6 py-2 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 ${
                offer.featured 
                  ? 'bg-accent text-white' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                Claim Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
