import React, { useState, useEffect } from 'react';
import { SEO } from '../SEO';
import { Calendar, User, ArrowRight, LogIn, LogOut, Plus, Edit, Trash2, X, Share2, ArrowLeft } from 'lucide-react';
import { auth, db } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

const formatImageUrl = (inputUrl: string) => {
  if (!inputUrl) return '';
  let url = inputUrl.trim();
  // Auto-convert Google Drive share links to direct image links
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  // Auto-convert Dropbox links
  if (url.includes('dropbox.com') && url.endsWith('?dl=0')) {
    return url.replace('?dl=0', '?raw=1');
  }
  return url;
};

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  authorId: string;
  image: string;
  createdAt: any;
}

export function BlogsTab() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  
  const ADMIN_EMAILS = ['stha123surya@gmail.com', 'neki123nki@gmail.com', 'info@snsbuilders.com.np'];
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = async (blog: Blog) => {
    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${blog.title}\n${window.location.href}`);
      setCopiedId(blog.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribeBlogs = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let dateStr = "Unknown Date";
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return {
          id: doc.id,
          ...data,
          date: dateStr
        } as Blog;
      });
      setBlogs(blogsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching blogs:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeBlogs();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      if (!imageUrl) {
        imageUrl = "https://picsum.photos/seed/construction/800/600"; // Fallback image
      }

      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image: imageUrl,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
      };

      if (editingId) {
        const blogRef = doc(db, 'blogs', editingId);
        const existingBlog = blogs.find(b => b.id === editingId);
        await updateDoc(blogRef, {
          ...blogData,
          createdAt: existingBlog?.createdAt || serverTimestamp() // Preserve original createdAt
        });
      } else {
        await addDoc(collection(db, 'blogs'), {
          ...blogData,
          createdAt: serverTimestamp()
        });
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', excerpt: '', content: '', category: '', image: '' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'blogs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      image: blog.image
    });
    setEditingId(blog.id);
    setIsFormOpen(true);
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setItemToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
      setItemToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  }

  if (viewingBlog) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SEO 
          title={viewingBlog.title} 
          description={viewingBlog.excerpt} 
        />
        <button 
          onClick={() => setViewingBlog(null)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back to Blogs
        </button>
        
        <article className="bg-surface rounded-3xl overflow-hidden border border-border shadow-sm">
          <div className="w-full h-[400px] relative">
            <img 
              src={viewingBlog.image} 
              alt={viewingBlog.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-primary text-sm font-bold uppercase tracking-wider rounded-full">
                {viewingBlog.category}
              </span>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{viewingBlog.title}</h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar size={18} /> {viewingBlog.date}</div>
                <div className="flex items-center gap-2"><User size={18} /> {viewingBlog.author}</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleShare(viewingBlog)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-primary rounded-lg font-medium transition-colors"
                >
                  <Share2 size={18} /> {copiedId === viewingBlog.id ? 'Copied!' : 'Share'}
                </button>
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => {
                        setViewingBlog(null);
                        handleEdit(viewingBlog);
                      }} 
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        handleDelete(viewingBlog.id);
                        setViewingBlog(null);
                      }} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap">
              {viewingBlog.content}
            </div>
          </div>
        </article>
      </div>
    );
  }

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
        <div>
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setFormData({ title: '', excerpt: '', content: '', category: '', image: '' });
                  setEditingId(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                <Plus size={18} /> New Post
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-red-500 font-medium">Access Denied: Not an Admin</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              <LogIn size={16} /> Admin Login
            </button>
          )}
        </div>
      </div>

      {isFormOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-2xl rounded-3xl p-6 md:p-8 relative my-8">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Post' : 'Create New Post'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <input 
                  type="text" required
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Excerpt (Short Description)</label>
                <textarea 
                  required rows={2}
                  value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Content</label>
                <textarea 
                  required rows={6}
                  value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Image URL (Google Drive, Dropbox, etc.)</label>
                <input 
                  type="url" 
                  placeholder="Paste share link here..."
                  value={formData.image} 
                  onChange={e => setFormData({...formData, image: formatImageUrl(e.target.value)})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <div className="relative h-32 w-48 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Invalid+Image+Link';
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-4">
                <button 
                  type="button" onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border">
          <p className="text-muted-foreground text-lg">No blog posts available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Blog */}
          <article className="lg:col-span-2 group relative rounded-3xl overflow-hidden min-h-[400px] flex items-end">
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
              <h2 
                onClick={() => setViewingBlog(blogs[0])}
                className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:underline decoration-accent underline-offset-4 cursor-pointer"
              >
                {blogs[0].title}
              </h2>
              <p className="text-white/80 line-clamp-2 mb-6 text-lg">
                {blogs[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-white/60 text-sm">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {blogs[0].date}</div>
                  <div className="flex items-center gap-2"><User size={16} /> {blogs[0].author}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleShare(blogs[0])}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors flex items-center gap-2"
                    title="Share"
                  >
                    <Share2 size={16} /> {copiedId === blogs[0].id && <span className="text-xs">Copied!</span>}
                  </button>
                  {isAdmin && (
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg mr-2">
                      <button onClick={() => handleEdit(blogs[0])} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(blogs[0].id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                    </div>
                  )}
                  <button 
                    onClick={() => setViewingBlog(blogs[0])}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-colors"
                  >
                    Read Full Post
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Other Blogs */}
          {blogs.slice(1).map((blog) => (
            <article key={blog.id} className="group bg-surface rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col">
              <div 
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => setViewingBlog(blog)}
              >
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
                <h3 
                  className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors cursor-pointer"
                  onClick={() => setViewingBlog(blog)}
                >
                  {blog.title}
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {blog.date}</span>
                    <button 
                      onClick={() => handleShare(blog)}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                      title="Share"
                    >
                      <Share2 size={14} /> {copiedId === blog.id ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button onClick={() => handleEdit(blog)} className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(blog.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </>
                    )}
                    <span 
                      onClick={() => setViewingBlog(blog)}
                      className="text-accent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer ml-2"
                    >
                      Read More <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl p-6 md:p-8 relative shadow-xl border border-border">
            <h3 className="text-2xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-muted-foreground mb-8">Are you sure you want to delete this blog post? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-6 py-2 rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => confirmDelete(itemToDelete)}
                className="px-6 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
