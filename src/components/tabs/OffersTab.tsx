import React, { useState, useEffect } from 'react';
import { SEO } from '../SEO';
import { Tag, CheckCircle2, Plus, Edit, Trash2, X, LogIn, LogOut } from 'lucide-react';
import { auth, db } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { LinkifyText } from '../LinkifyText';

interface Offer {
  id: string;
  title: string;
  description: string;
  features: string[];
  validUntil: string;
  featured: boolean;
  authorId: string;
  createdAt: any;
}

interface OffersTabProps {
  setActiveTab: (tab: any) => void;
}

export function OffersTab({ setActiveTab }: OffersTabProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const ADMIN_EMAILS = ['nekichipalu@gmail.com', 'stha123surya@gmail.com', 'shapeandstructure@gmail.com'];
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: '', // comma separated string for input
    validUntil: '',
    featured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const unsubscribeOffers = onSnapshot(q, (snapshot) => {
      const offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Offer[];
      setOffers(offersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching offers:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeOffers();
    };
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
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const featuresList = formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0);

      const offerData = {
        title: formData.title,
        description: formData.description,
        features: featuresList,
        validUntil: formData.validUntil,
        featured: formData.featured,
        authorId: user.uid,
      };

      if (editingId) {
        const offerRef = doc(db, 'offers', editingId);
        const existingOffer = offers.find(o => o.id === editingId);
        await updateDoc(offerRef, {
          ...offerData,
          createdAt: existingOffer?.createdAt || serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'offers'), {
          ...offerData,
          createdAt: serverTimestamp()
        });
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', features: '', validUntil: '', featured: false });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'offers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      features: offer.features.join(', '),
      validUntil: offer.validUntil,
      featured: offer.featured
    });
    setEditingId(offer.id);
    setIsFormOpen(true);
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'offers', id));
      setItemToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `offers/${id}`);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Special Offers" 
        description="Check out the latest offers and discounts from Shape & Structure Builders." 
      />
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-4">Current Offers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Take advantage of our limited-time promotions and special packages designed to give you the best value for your investment.
          </p>
        </div>
        <div>
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setFormData({ title: '', description: '', features: '', validUntil: '', featured: false });
                  setEditingId(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                <Plus size={18} /> New Offer
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
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Offer' : 'Create New Offer'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Offer Title</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea 
                  required rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Features (comma separated)</label>
                <input 
                  type="text" required
                  placeholder="Site evaluation, Budget estimation, Design brainstorming"
                  value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Valid Until</label>
                  <input 
                    type="text" required
                    placeholder="Dec 31, 2026"
                    value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox" id="featured"
                    checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold cursor-pointer">Featured Offer (Highlighted)</label>
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
                  {isSubmitting ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border">
          <p className="text-muted-foreground text-lg">No offers available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className={`relative rounded-3xl p-8 md:p-10 border ${
                offer.featured 
                  ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20' 
                  : 'bg-surface border-border hover:border-accent/50 transition-colors'
              }`}
            >
              {isAdmin && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                  <button onClick={() => handleEdit(offer)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"><Edit size={16} /></button>
                  <button onClick={() => setItemToDelete(offer.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                </div>
              )}

              {offer.featured && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                  <Tag size={14} /> Featured
                </div>
              )}
              
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isAdmin ? 'mt-6' : ''}`}>{offer.title}</h3>
              <p className={`mb-8 whitespace-pre-wrap ${offer.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                <LinkifyText text={offer.description} />
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
                <button 
                  onClick={() => setActiveTab('contact')}
                  className={`px-6 py-2 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 ${
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
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl p-6 md:p-8 relative shadow-xl border border-border">
            <h3 className="text-2xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-muted-foreground mb-8">Are you sure you want to delete this offer? This action cannot be undone.</p>
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
