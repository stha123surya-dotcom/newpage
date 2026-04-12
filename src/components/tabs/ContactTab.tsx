import React, { useState } from 'react';
import { SEO } from '../SEO';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export function ContactTab() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Save to Firebase Database (as a backup)
      await addDoc(collection(db, 'contact_submissions'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Send Email directly to your inbox via FormSubmit
      // Note: The first time this runs, you will receive an activation email from FormSubmit.
      // You MUST click "Activate" in that email for future messages to come through.
      await fetch("https://formsubmit.co/ajax/stha123surya@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            _subject: `New Website Inquiry: ${formData.subject}`, // Email subject line
            _template: "table" // Formats the email nicely
        })
      });

      setIsSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contact_submissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Shape & Structure Builders for your next construction project." 
      />
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Have a project in mind? We'd love to hear from you. Reach out to our team of experts for a consultation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <h3 className="text-2xl font-bold mb-8 relative z-10">Contact Information</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Our Location</h4>
                  <p className="text-primary-foreground/70 leading-relaxed">
                    Lalitpur, Nepal<br />
                    Bagmati Province
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone Number</h4>
                  <p className="text-primary-foreground/70">
                    +977 9841737795<br />
                    +977 9849105107
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email Address</h4>
                  <p className="text-primary-foreground/70">
                    info@snsbuilders.com.np
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Working Hours</h4>
                  <p className="text-primary-foreground/70">
                    Sun - Fri: 10:00 AM - 5:00 PM<br />
                    Saturday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3 bg-surface rounded-3xl p-8 md:p-10 border border-border shadow-sm">
          <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
          
          {isSuccess ? (
            <div className="bg-green-50 text-green-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-green-200 h-full min-h-[400px]">
              <CheckCircle2 size={64} className="text-green-500 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Message Sent!</h4>
              <p className="text-green-700">Thank you for reaching out. Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-semibold text-primary">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-semibold text-primary">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-primary">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-primary">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  placeholder="Project Inquiry"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-primary">Message</label>
                <textarea 
                  id="message" 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? 'Sending...' : (
                  <>Send Message <Send size={18} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
