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
  { q: 'Can I migrate my existing Excel sheets and records?', a: 'Yes! We support Excel/CSV imports and our team can help you migrate data from your existing system for free during onboarding.' },
  { q: 'Is my financial data secure?', a: 'Absolutely. We use bank-level encryption, secure cloud storage, and regular backups. Your data is stored on Indian servers and complies with all data protection regulations.' },
  { q: 'Does it work on mobile?', a: 'Yes! VenuePro is fully responsive and works perfectly on all devices — smartphones, tablets, and desktops. No app download required.' },
  { q: 'Does it support multiple separate banquets?', a: 'Yes. You can configure unlimited properties and halls. Easily toggle between venues using the dynamic navigation bar.' },
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel anytime with no questions asked. Your data remains accessible for export before account closure.' },
  { q: 'Do you provide training and onboarding support?', a: 'Yes! We provide video tutorials, documentation, and personalized onboarding support. Live training sessions are available based on your plan.' },
  { q: 'How do I get started?', a: 'Simply sign up through our List Your Venue page. Our team will contact you within 24-48 hours to discuss your needs and set up your account.' },
];

const VENUE_TYPES = [
  { title: 'Banquet Halls', desc: 'Manage wedding bookings, track advance payments, coordinate with vendors, and handle last-minute changes.' },
  { title: 'Hotels & Resorts', desc: 'Handle conference bookings, corporate events, and social gatherings across multiple halls and spaces.' },
  { title: 'Convention Centers', desc: 'Coordinate large-scale events, exhibitions, and conferences with complex scheduling.' },
  { title: 'Farmhouses & Villas', desc: 'Manage private party bookings, destination weddings, and weekend getaways.' },
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
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans overflow-x-hidden selection:bg-[#107ed8]/10 selection:text-[#107ed8] bg-dotted">
      <SEO title="Banquet & Venue Management Software" description="Eliminate double bookings, coordinate cleanliness operations, track payments, and grow your venue business with VenuePro." />

      {/* Floating Gradient Backdrop mesh - Google Analytics inspired soft blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-gradient-to-b from-[#107ed8]/5 via-[#C5A059]/3 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar - Crisp light Google style */}
      <header className="relative border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-md shadow-primary/25">
              <span className="text-sm font-extrabold">VP</span>
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">VenuePro</span>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[9px] text-slate-500 rounded-md font-mono hidden sm:inline-block font-bold">Stable v1.4</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#pain" className="hover:text-slate-950 transition-colors">Why VenuePro</a>
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-slate-950 transition-colors">Success Stories</a>
            <a href="#faqs" className="hover:text-slate-950 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/login" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-2 py-1">
              Log In
            </Link>
            <Link
              to="/signup"
              className="btn-brand px-3.5 py-2 text-xs sm:text-sm rounded-xl"
            >
              List Venue
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Crisp Light Layout */}
      <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Left column */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#107ed8]/8 border border-[#107ed8]/20 text-[#107ed8] rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#107ed8] shrink-0" />
            <span>Modern Operating System for Venues</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900"
          >
            Manage Smarter. <br />
            <span className="bg-gradient-to-r from-[#107ed8] via-blue-600 to-[#C5A059] bg-clip-text text-transparent">Grow Faster.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            The premier SaaS platform helping Indian venue owners streamline booking calendars, track payments, coordinate cleanliness staff, and grow business double-booking free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
          >
            <Link
              to="/signup"
              className="btn-brand flex-1 sm:flex-initial flex items-center justify-center px-5 py-3 text-xs sm:text-sm rounded-xl hover:scale-[1.02] text-center"
            >
              Start Trial <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
            </Link>
            <a
              href="#features"
              className="btn-outline-brand flex-1 sm:flex-initial flex items-center justify-center px-5 py-3 text-xs sm:text-sm rounded-xl hover:scale-[1.02] text-center"
            >
              See How It Works
            </a>
          </motion.div>

          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap gap-4 items-center justify-center lg:justify-start text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" /> MOST TRUSTED SOFTWARE</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" /> FREE DATA MIGRATION</span>
          </div>
        </div>

        {/* Right column: Google Analytics UI styled card mock */}
        <div className="lg:col-span-7 flex justify-center z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-[580px] bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden p-3.5 lift-on-hover"
          >
            {/* Window header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">analytics.venuepro.in</span>
              <span className="px-2 py-0.5 bg-blue-50 text-[#107ed8] text-[9px] font-mono font-bold rounded">Live Monitor</span>
            </div>

            {/* Dashboard Mock */}
            <div className="grid grid-cols-12 gap-3 mt-3.5">
              {/* Sidebar layout */}
              <div className="col-span-3 space-y-2 border-r border-slate-100 pr-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-6 rounded-lg ${i === 1 ? 'bg-blue-50/80' : 'bg-slate-50/50'} flex items-center px-2`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-[#107ed8]' : 'bg-slate-300'} mr-2`} />
                    <div className={`h-2 rounded ${i === 1 ? 'bg-[#107ed8]/40' : 'bg-slate-200'} w-12 sm:w-16`} />
                  </div>
                ))}
              </div>
              
              {/* Main content pane */}
              <div className="col-span-9 space-y-3 pl-1">
                {/* Micro Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Weekly Active', val: '4,291', trend: '+14%' },
                    { label: 'Filled Slots', val: '86%', trend: '+8%' },
                    { label: 'Pending Collections', val: '₹14K', trend: '-22%' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50/75 border border-slate-100 rounded-xl p-2 flex flex-col justify-between">
                      <div className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">{stat.label}</div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-xs sm:text-sm font-black text-slate-800 font-mono">{stat.val}</span>
                        <span className="text-[8px] text-emerald-500 font-bold font-mono">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Analytics Style Charts */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 h-[130px] sm:h-[150px] flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono z-10">
                    <span>Leads Traffic Channels (sessions)</span>
                    <span className="text-slate-500 font-bold">14-Day rolling</span>
                  </div>
                  
                  {/* Visual Chart Bars */}
                  <div className="w-full h-[80px] flex items-end gap-1.5 sm:gap-2.5 z-10 pt-2">
                    {[35, 55, 45, 75, 90, 65, 80, 50, 95, 70, 85, 110].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: i * 0.05 }}
                          className={`w-full rounded-t ${i % 2 === 0 ? 'bg-[#107ed8]' : 'bg-[#C5A059]'}`}
                        />
                        <span className="text-[7px] font-mono text-slate-400 mt-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i % 7]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Grid background lines */}
                  <div className="absolute inset-x-0 top-6 bottom-4 flex flex-col justify-between pointer-events-none opacity-50">
                    <div className="border-t border-slate-200/50 w-full" />
                    <div className="border-t border-slate-200/50 w-full" />
                    <div className="border-t border-slate-200/50 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAIN POINTS SECTION - Light Minimal Cards */}
      <section id="pain" className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-200/80 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">The Operational Friction</span>
          <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">Manual Venue Management is a Nightmare</h3>
          <p className="text-slate-500 text-xs sm:text-sm">Double bookings, uncollected balances, and communication gaps limit your banquet profit potential.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((pain, idx) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white border border-slate-250/60 hover:border-slate-300 rounded-2xl p-6 relative overflow-hidden group transition-all hover:shadow-lg shadow-sm"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs mb-4">0{idx + 1}</div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{pain.title}</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{pain.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES MATRIX SECTION - Light Gray grid */}
      <section id="features" className="py-14 sm:py-24 bg-slate-100/60 border-t border-b border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12 sm:mb-20">
            <span className="text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">Platform Capabilities</span>
            <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">Everything You Need to Scale</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Built-in safeguards, auto-scheduler mappings, and multi-tenant billing schemas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 relative overflow-hidden group transition-all hover:shadow-lg shadow-sm"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION - Light elegant quote block */}
      <section id="testimonials" className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="text-[#C5A059] text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">SUCCESS STORIES</span>
          <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">Approved by Elite Venue Operators</h3>
          <p className="text-slate-500 text-xs sm:text-sm">See how banquet managers and resort owners restored operational integrity.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 max-w-3xl mx-auto relative overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex space-x-1 text-[#C5A059] mb-5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <p className="text-slate-800 text-base sm:text-xl leading-relaxed font-medium italic">
                "{TESTIMONIALS[currentTestimonial].text}"
              </p>
              <div>
                <p className="font-extrabold text-slate-900 text-sm sm:text-base">{TESTIMONIALS[currentTestimonial].name}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{TESTIMONIALS[currentTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Nav dots */}
          <div className="flex space-x-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${currentTestimonial === idx ? 'bg-primary w-6' : 'bg-slate-200 hover:bg-slate-350'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION - Clean Accoridon */}
      <section id="faqs" className="py-14 sm:py-24 bg-slate-100/60 border-t border-slate-200/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <div className="text-center space-y-2 mb-10 sm:mb-16">
            <span className="text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">FAQ</span>
            <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">Answers to Common Questions</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Everything you need to know to get started with VenuePro.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/85 rounded-xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs sm:text-sm text-left hover:text-primary transition-colors text-slate-800"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`} />
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
                        <div className="px-5 pb-4.5 pt-1 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-100">
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

      {/* VENUE TYPES SECTION - Light Adaptable Cards */}
      <section className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-200/85 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">Adaptable Design</span>
          <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">VenuePro Adapts to Your Business</h3>
          <p className="text-slate-500 text-xs sm:text-sm">Whether you run a single banquet hall or a chain of resorts, we've got you covered.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {VENUE_TYPES.map((vt, idx) => (
            <motion.div
              key={vt.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white border border-slate-200/80 hover:border-primary/20 rounded-2xl p-5 text-center transition-all group shadow-sm hover:shadow-lg"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <span className="text-base font-extrabold">{vt.title.charAt(0)}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">{vt.title}</h4>
              <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed">{vt.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ONBOARDING STEPS */}
      <section className="py-14 sm:py-24 bg-slate-100/60 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
            <span className="text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">Getting Started</span>
            <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">From Signup to Going Live</h3>
            <p className="text-slate-500 text-xs sm:text-sm">We make it effortless — 3 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Submit Your Request', desc: 'Fill out a quick form with your venue details. Our team will review and contact you within 24-48 hours.' },
              { step: '02', title: 'Free Data Migration', desc: 'We migrate your existing data for free — from Excel sheets, paper registers, or any other system. Zero hassle.' },
              { step: '03', title: 'Go Live & Grow', desc: 'Start managing bookings, tracking leads, and generating invoices. Full onboarding support included.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center sm:text-left space-y-3 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm"
              >
                <div className="w-11 h-11 mx-auto sm:mx-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">{s.step}</div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">{s.title}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER - Soft blue gradient */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-t border-slate-200/80 bg-gradient-to-r from-blue-50 via-indigo-50/30 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 relative z-10">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Ready to Transform Your Venue Management?</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Join hundreds of Indian venue owners who have simplified their operations and grown their business with VenuePro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/signup"
              className="btn-brand px-7 py-3 text-xs sm:text-sm rounded-xl inline-flex items-center font-bold"
            >
              List Your Venue Now <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
            </Link>
            <a href="#features" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
              See How It Works →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-450 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 text-xs">
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-primary/20">VP</div>
                <span className="font-extrabold text-lg tracking-tight text-white">VenuePro</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">Making venue management simple and efficient. Manage Smarter, Grow Faster.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <div className="space-y-3">
                <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Product</h5>
                <ul className="space-y-2 text-slate-450">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pain" className="hover:text-white transition-colors">Why VenuePro</a></li>
                  <li><a href="#faqs" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Resources</h5>
                <ul className="space-y-2 text-slate-450">
                  <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                  <li><a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Company</h5>
                <ul className="space-y-2 text-slate-450">
                  <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
                  <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Legal</h5>
                <ul className="space-y-2 text-slate-450">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <p>© 2026 VenuePro. All rights reserved. Made with ❤️ in India.</p>
            <p className="text-slate-600">Manage Smarter. Grow Faster.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
