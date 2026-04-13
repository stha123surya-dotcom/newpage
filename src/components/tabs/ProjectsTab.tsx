import React, { useState, useEffect } from 'react';
import { SEO } from '../SEO';
import { MapPin, Calendar, ArrowRight, LogIn, LogOut, Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { auth, db, storage } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  image: string;
  description: string;
  authorId: string;
  createdAt: any;
}

export function ProjectsTab() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const ADMIN_EMAILS = ['stha123surya@gmail.com', 'neki123nki@gmail.com', 'info@snsbuilders.com.np'];
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    date: '',
    description: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const storageRef = ref(storage, `project_images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (!imageUrl) {
        imageUrl = "https://picsum.photos/seed/project/800/600"; // Fallback image
      }

      const projectData = {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        image: imageUrl,
        authorId: user.uid,
      };

      if (editingId) {
        const projectRef = doc(db, 'projects', editingId);
        const existingProject = projects.find(p => p.id === editingId);
        await updateDoc(projectRef, {
          ...projectData,
          createdAt: existingProject?.createdAt || serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp()
        });
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', category: '', location: '', date: '', description: '', image: '' });
      setImageFile(null);
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'projects');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      category: project.category,
      location: project.location,
      date: project.date,
      description: project.description,
      image: project.image
    });
    setEditingId(project.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Our Projects" 
        description="Explore our portfolio of residential, commercial, and industrial construction projects." 
      />
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover our portfolio of successfully completed projects that showcase our commitment to quality, innovation, and structural excellence.
          </p>
        </div>
        <div>
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setFormData({ title: '', category: '', location: '', date: '', description: '', image: '' });
                  setEditingId(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                <Plus size={18} /> New Project
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
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Project' : 'Create New Project'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Project Title</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Category (e.g., Residential)</label>
                  <input 
                    type="text" required
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Location</label>
                  <input 
                    type="text" required
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date / Status (e.g., Completed 2025)</label>
                <input 
                  type="text" required
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea 
                  required rows={4}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Project Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors border border-border">
                    <ImageIcon size={18} />
                    <span className="text-sm font-medium">{imageFile ? imageFile.name : 'Upload Image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {!imageFile && formData.image && (
                    <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded-lg" />
                  )}
                </div>
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
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border">
          <p className="text-muted-foreground text-lg">No projects available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group bg-surface rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col relative">
              {isAdmin && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                  <button onClick={() => handleEdit(project)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                </div>
              )}
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 z-10">
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
      )}
    </div>
  );
}
