import { SEO } from '../SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';

export function BlogsTab() {
  const blogs = [
    {
      id: 1,
      title: "The Future of Sustainable Construction Materials",
      excerpt: "Exploring eco-friendly alternatives to traditional concrete and steel that are reshaping the building industry.",
      category: "Innovation",
      date: "Oct 12, 2026",
      author: "Jane Doe",
      image: "https://picsum.photos/seed/sustainable/800/600"
    },
    {
      id: 2,
      title: "5 Essential Tips for Your Home Renovation",
      excerpt: "Planning a major renovation? Here are the top things you need to consider before breaking ground.",
      category: "Guide",
      date: "Sep 28, 2026",
      author: "John Smith",
      image: "https://picsum.photos/seed/renovation/800/600"
    },
    {
      id: 3,
      title: "Understanding Structural Integrity in High-Rises",
      excerpt: "A deep dive into the engineering principles that keep modern skyscrapers standing tall against the elements.",
      category: "Engineering",
      date: "Sep 15, 2026",
      author: "Sarah Lee",
      image: "https://picsum.photos/seed/skyscraper/800/600"
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Blogs" 
        description="Read the latest news, insights, and guides from Shape & Structure Builders." 
      />
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-4">Our Latest Insights</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stay updated with the latest trends, tips, and news in the construction and architecture industry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Blog */}
        <article className="lg:col-span-2 group cursor-pointer relative rounded-3xl overflow-hidden min-h-[400px] flex items-end">
          <img 
            src={blogs[0].image} 
            alt={blogs[0].title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="relative z-10 p-8 md:p-12 w-full md:w-3/4">
            <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {blogs[0].category}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:underline decoration-accent underline-offset-4">
              {blogs[0].title}
            </h2>
            <p className="text-white/80 line-clamp-2 mb-6 text-lg">
              {blogs[0].excerpt}
            </p>
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2"><Calendar size={16} /> {blogs[0].date}</div>
              <div className="flex items-center gap-2"><User size={16} /> {blogs[0].author}</div>
            </div>
          </div>
        </article>

        {/* Other Blogs */}
        {blogs.slice(1).map((blog) => (
          <article key={blog.id} className="group cursor-pointer bg-surface rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={blog.image} 
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                  {blog.category}
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                {blog.title}
              </h3>
              <p className="text-muted-foreground mb-6 flex-grow">
                {blog.excerpt}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {blog.date}</span>
                </div>
                <span className="text-accent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read More <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
