import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, Users, Shield, TrendingUp, 
  ArrowRight, CheckCircle2, ChevronDown, Sparkles, 
  Star, Landmark, Award
} from 'lucide-react';
import { SEO } from '../components/ui/SEO';

const PAIN_POINTS = [
  { title: 'Messy Booking Logs', desc: 'Juggling paper registers, Excel sheets, and WhatsApp chats causes double bookings.' },
  { title: 'Revenue Leakage', desc: 'Missed customer follow-ups and uncollected final payments leak precious income.' },
  { title: 'Cleanliness Chaos', desc: 'Hall handovers fail because cleaning staff do not have clear digital schedules.' }
];

const FEATURES = [
  { icon: Calendar, title: 'Never Miss a Booking Again', desc: 'Intuitive multi-venue calendar showing color-coded booking statuses, deposit holds, and drag-and-drop rescheduling.' },
  { icon: Users, title: 'Centralized Leads Pipeline', desc: 'Inquiries from WhatsApp, Google Maps, and walk-ins instantly flow into one unified CRM pipeline.' },
  { icon: Landmark, title: 'Bilingual Invoicing & GST', desc: 'Generate professional corporate invoices in English and Hindi. Supports custom SAC billing categories.' },
  { icon: Shield, title: 'Accountability & Cleanliness Mappings', desc: 'Assign staff specifically to designated halls. Cleaning staff see room turnarounds instantly.' },
  { icon: TrendingUp, title: 'Google Analytics UI Reporting', desc: 'Track high-level metrics, goal completions, real-time sessions, and channel analytics at a glance.' },
  { icon: Award, title: 'Platform Spending Hard Caps', desc: 'Built-in protection schemas with spending limits and rate locks to guard against abuse.' }
];

const FAQS = [
  { q: 'How long does it take to set up VenuePro?', a: 'Most venue managers complete onboarding in under 10 minutes. Our setup wizard guides you through rooms, halls, pricing slots, and user creation.' },
  { q: 'Can I migrate my existing Excel sheets and records?', a: 'Absolutely. We offer free data migration services. Send us your spreadsheets or logs, and our support team will port them into VenuePro for free.' },
  { q: 'Is my financial data secure?', a: 'Yes. All database connections utilize bank-level SSL encryption. Your databases are hosted on enterprise Indian data servers with automatic hourly backups.' },
  { q: 'Does it support multiple separate banquets?', a: 'Yes. You can configure unlimited properties and halls. Easily toggle between active sub-venues using the dynamic navigation bar.' }
];

const TESTIMONIALS = [
  { name: 'Rajesh Kumar', role: 'Royal Banquet Hall, Mumbai', text: 'VenuePro transformed how we manage our banquet hall. We reduced double bookings to absolute zero and boosted net revenue by 30%!' },
  { name: 'Priya Sharma', role: 'Green Valley Resort, Bangalore', text: 'Managing three outdoor lawns was a logistical nightmare. Now, our operations are completely synchronized in a single dashboard.' },
  { name: 'Amit Patel', role: 'Crystal Convention Center, Delhi', text: 'The lead pipeline alone paid for the system within a month. Our team is converting 45% more inquiries into finalized bookings!' }
];

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  return (
    <div className="bg-[#0b0f19] text-white min-h-screen font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      <SEO title="Banquet & Venue Management Software" description="Eliminate double bookings, coordinate cleanliness operations, track payments, and grow your venue business with VenuePro." />

      {/* Floating Gradient Backdrop mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative border-b border-gray-800/80 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">V</div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">VenuePro</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-400">
            <a href="#pain" className="hover:text-white transition-colors">Why VenuePro</a>
            <a href="#features" className="hover:text-white transition-colors">Features Matrix</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
            >
              List Your Venue →
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column */}
        <div className="lg:col-span-6 space-y-6 z-10 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Operating System for Venues</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
          >
            Manage Smarter. <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-emerald-400 bg-clip-text text-transparent">Grow Faster.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            The all-in-one platform helping Indian venue owners streamline booking calendars, track payments, coordinate cleanliness staff, and grow business double-booking free.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <Link 
              to="/signup" 
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02]"
            >
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-bold rounded-xl hover:bg-gray-800/80 transition-all hover:scale-[1.02]"
            >
              See How It Works
            </a>
          </motion.div>

          <div className="pt-6 border-t border-gray-900/60 flex flex-wrap gap-6 items-center justify-center lg:justify-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> Trusted by 500+ Indian Venues</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> Free Data Migration Support</span>
          </div>
        </div>

        {/* Right column: Floating Interactive Dashboard Mockup */}
        <div className="lg:col-span-6 flex justify-center z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[500px] aspect-[4/3] rounded-2xl border border-gray-800 bg-[#0f1422] shadow-2xl overflow-hidden p-3"
          >
            {/* Header frame */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600 font-mono">dashboard.venuepro.in</span>
              <div className="w-8" />
            </div>

            {/* Mock Layout */}
            <div className="grid grid-cols-12 gap-2 mt-3 h-[calc(100%-25px)]">
              {/* Sidebar Mock */}
              <div className="col-span-3 space-y-2 border-r border-gray-800/50 pr-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-6 rounded-md ${i === 1 ? 'bg-primary/20' : 'bg-gray-900/40'} flex items-center px-2`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 1 ? 'bg-primary' : 'bg-gray-800'} mr-2`} />
                    <div className={`h-2 rounded ${i === 1 ? 'bg-primary/50' : 'bg-gray-800/50'} w-12`} />
                  </div>
                ))}
              </div>
              {/* Body Mock */}
              <div className="col-span-9 space-y-3 pl-1">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-2 flex flex-col justify-between h-14">
                      <div className="h-2 bg-gray-850 rounded w-10" />
                      <div className="h-3 bg-gray-800 rounded w-14 mt-2" />
                    </div>
                  ))}
                </div>

                {/* Graph box */}
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 h-[130px] flex items-end relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <div className="w-full h-full flex items-end gap-1.5">
                    {[35, 60, 45, 75, 90, 65, 80, 55, 95].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-primary/80 to-blue-400/80 rounded-t"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAIN POINTS SECTION */}
      <section id="pain" className="py-20 max-w-7xl mx-auto px-6 border-t border-gray-900/60 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">The Problem</span>
          <h3 className="text-3xl font-extrabold text-white">Manual Venue Management is a Nightmare</h3>
          <p className="text-gray-500 text-sm">Juggling channels, leaking revenue, and coordinate checkout errors lead to business friction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((pain, idx) => (
            <motion.div 
              key={pain.title}
              whileHover={{ y: -8 }}
              className="bg-gray-950/40 border border-gray-900 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-800 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm mb-4">0{idx + 1}</div>
              <h4 className="text-lg font-bold text-white mb-2">{pain.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{pain.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES MATRIX SECTION */}
      <section id="features" className="py-20 bg-gray-950/50 border-t border-b border-gray-900/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Platform capabilities</span>
            <h3 className="text-3xl font-extrabold text-white">Everything You Need to Succeed</h3>
            <p className="text-gray-500 text-sm">Industrial-grade tools designed specifically for multi-tenant venue networks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(feat => {
              const Icon = feat.icon;
              return (
                <motion.div 
                  key={feat.title}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0f1422]/60 border border-gray-900/80 hover:border-gray-800 rounded-2xl p-6 relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Success Stories</span>
          <h3 className="text-3xl font-extrabold text-white">Loved by Indian Venue Owners</h3>
          <p className="text-gray-500 text-sm">See how banquet managers and resort owners scaled operations with VenuePro.</p>
        </div>

        <div className="bg-gray-950/40 border border-gray-900 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex space-x-1 text-yellow-500 mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed italic">
                "{TESTIMONIALS[currentTestimonial].text}"
              </p>
              <div>
                <p className="font-extrabold text-white text-base">{TESTIMONIALS[currentTestimonial].name}</p>
                <p className="text-xs text-gray-500 font-medium">{TESTIMONIALS[currentTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Nav dots */}
          <div className="flex space-x-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${currentTestimonial === idx ? 'bg-primary w-6' : 'bg-gray-800 hover:bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="py-20 bg-gray-950/30 border-t border-gray-900/60 relative">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center space-y-2 mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Got Questions?</span>
            <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
            <p className="text-gray-500 text-sm">Everything you need to know to get started with VenuePro.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-[#0f1422]/40 border border-gray-900 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-left hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-gray-400 text-sm leading-relaxed border-t border-gray-900/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="relative py-24 overflow-hidden border-t border-gray-900/80">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent pointer-events-none blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Transform Your Venue Business?</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            Join hundreds of venue managers who have simplified booking coordination, reduced payment leaks to absolute zero, and expanded operational yields.
          </p>
          <div className="pt-2">
            <Link 
              to="/signup" 
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
            >
              List Your Venue Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 py-12 border-t border-gray-900/60 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-bold text-white text-xs">V</div>
            <span className="font-bold text-sm tracking-tight text-white">VenuePro</span>
          </div>
          <p>© 2026 VenuePro. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
