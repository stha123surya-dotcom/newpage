import { SEO } from '../SEO';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

export function ProjectsTab() {
  const projects = [
    {
      id: 1,
      title: "Skyline Commercial Complex",
      category: "Commercial",
      location: "Kathmandu",
      date: "Completed 2025",
      image: "https://picsum.photos/seed/project1/800/600",
      description: "A state-of-the-art 15-story commercial building featuring sustainable design and modern amenities."
    },
    {
      id: 2,
      title: "Green Valley Residences",
      category: "Residential",
      location: "Lalitpur",
      date: "Completed 2024",
      image: "https://picsum.photos/seed/project2/800/600",
      description: "A luxury residential complex with 120 units, focusing on eco-friendly living and community spaces."
    },
    {
      id: 3,
      title: "Tech Hub Innovation Center",
      category: "Industrial",
      location: "Bhaktapur",
      date: "Ongoing",
      image: "https://picsum.photos/seed/project3/800/600",
      description: "A modern industrial park designed specifically for tech startups and research facilities."
    },
    {
      id: 4,
      title: "Heritage Boutique Hotel",
      category: "Commercial",
      location: "Patan",
      date: "Completed 2023",
      image: "https://picsum.photos/seed/project4/800/600",
      description: "Restoration and expansion of a heritage property into a 5-star boutique hotel."
    },
    {
      id: 5,
      title: "Riverside Villas",
      category: "Residential",
      location: "Pokhara",
      date: "Completed 2025",
      image: "https://picsum.photos/seed/project5/800/600",
      description: "Exclusive waterfront villas with private docks and panoramic mountain views."
    },
    {
      id: 6,
      title: "Metro Logistics Hub",
      category: "Industrial",
      location: "Birgunj",
      date: "Ongoing",
      image: "https://picsum.photos/seed/project6/800/600",
      description: "A massive logistics and warehousing facility with advanced automated systems."
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Our Projects" 
        description="Explore our portfolio of residential, commercial, and industrial construction projects." 
      />
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Discover our portfolio of successfully completed projects that showcase our commitment to quality, innovation, and structural excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="group bg-surface rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-60 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                  {project.category}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              <p className="text-muted-foreground mb-6 flex-grow text-sm">
                {project.description}
              </p>
              <div className="flex flex-col gap-2 pt-4 border-t border-border text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-accent" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-accent" />
                  <span>{project.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
