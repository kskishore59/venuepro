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
    <div className="bg-[#0b0f19] text-white min-h-screen font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      <SEO title="Banquet & Venue Management Software" description="Eliminate double bookings, coordinate cleanliness operations, track payments, and grow your venue business with VenuePro." />

      {/* Floating Gradient Backdrop mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] sm:h-[600px] bg-gradient-to-b from-primary/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar - compact and responsive */}
      <header className="relative border-b border-gray-800/80 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 text-sm">V</div>
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">VenuePro</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-400">
            <a href="#pain" className="hover:text-white transition-colors">Why VenuePro</a>
            <a href="#features" className="hover:text-white transition-colors">Features Matrix</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/login" className="text-xs sm:text-sm font-bold text-gray-300 hover:text-white transition-colors px-2 py-1">
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 shrink-0"
            >
              List Venue
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION - compact spacing on mobile */}
      <section className="relative pt-6 sm:pt-12 pb-12 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Left column */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3 h-3 text-primary shrink-0" />
            <span>Modern Operating System for Venues</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
          >
            Manage Smarter. <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-emerald-400 bg-clip-text text-transparent">Grow Faster.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            The all-in-one platform helping Indian venue owners streamline booking calendars, track payments, coordinate cleanliness staff, and grow business double-booking free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-row items-center justify-center lg:justify-start gap-3 pt-2"
          >
            <Link
              to="/signup"
              className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] text-center"
            >
              Start Trial <ArrowRight className="w-3.5 h-3.5 ml-1.5 shrink-0" />
            </Link>
            <a
              href="#features"
              className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-800/80 transition-all hover:scale-[1.02] text-center"
            >
              See How It Works
            </a>
          </motion.div>

          <div className="pt-4 border-t border-gray-900/65 flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" /> Most Trusted Software For Venues</span>
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" /> Free Data Migration Support</span>
          </div>
        </div>

        {/* Right column: Floating Interactive Dashboard Mockup - scaled on mobile */}
        <div className="lg:col-span-6 flex justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[440px] sm:max-w-[500px] aspect-[4/3] rounded-xl sm:rounded-2xl border border-gray-800 bg-[#0f1422] shadow-2xl overflow-hidden p-2.5 sm:p-3"
          >
            {/* Header frame */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-semibold text-gray-600 font-mono">dashboard.venuepro.in</span>
              <div className="w-8" />
            </div>

            {/* Mock Layout */}
            <div className="grid grid-cols-12 gap-1.5 mt-2.5 h-[calc(100%-25px)]">
              {/* Sidebar Mock */}
              <div className="col-span-3 space-y-1.5 border-r border-gray-800/50 pr-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-5 sm:h-6 rounded-md ${i === 1 ? 'bg-primary/20' : 'bg-gray-900/40'} flex items-center px-1.5`}>
                    <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary' : 'bg-gray-850'} mr-1.5 shrink-0`} />
                    <div className={`h-1.5 rounded ${i === 1 ? 'bg-primary/50' : 'bg-gray-800/50'} w-10 sm:w-12`} />
                  </div>
                ))}
              </div>
              {/* Body Mock */}
              <div className="col-span-9 space-y-2 pl-1">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-1.5 flex flex-col justify-between h-10 sm:h-14">
                      <div className="h-1.5 bg-gray-850 rounded w-8" />
                      <div className="h-2.5 bg-gray-850 rounded w-10 mt-1" />
                    </div>
                  ))}
                </div>

                {/* Graph box */}
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-2 h-[95px] sm:h-[130px] flex items-end relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <div className="w-full h-full flex items-end gap-1 sm:gap-1.5">
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
      <section id="pain" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 border-t border-gray-900/60 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">The Problem</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Manual Venue Management is a Nightmare</h3>
          <p className="text-gray-500 text-xs sm:text-sm">Juggling channels, leaking revenue, and coordinate checkout errors lead to business friction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {PAIN_POINTS.map((pain, idx) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-gray-950/40 border border-gray-900 rounded-xl sm:rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-gray-800 hover:shadow-lg hover:shadow-red-500/5 transition-all"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs mb-3.5">0{idx + 1}</div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">{pain.title}</h4>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{pain.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES MATRIX SECTION */}
      <section id="features" className="py-12 sm:py-20 bg-gray-950/50 border-t border-b border-gray-900/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">Platform capabilities</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Everything You Need to Succeed</h3>
            <p className="text-gray-500 text-xs sm:text-sm">Industrial-grade tools designed specifically for multi-tenant venue networks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {FEATURES.map(feat => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-[#0f1422]/60 border border-gray-900/80 hover:border-primary/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 relative overflow-hidden group transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3.5">
                    <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">{feat.title}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">Success Stories</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Loved by Indian Venue Owners</h3>
          <p className="text-gray-500 text-xs sm:text-sm">See how banquet managers and resort owners scaled operations with VenuePro.</p>
        </div>

        <div className="bg-gray-950/40 border border-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex space-x-1 text-yellow-500 mb-4 sm:mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 sm:space-y-6"
            >
              <p className="text-gray-300 text-base sm:text-xl leading-relaxed italic">
                "{TESTIMONIALS[currentTestimonial].text}"
              </p>
              <div>
                <p className="font-bold text-white text-sm sm:text-base">{TESTIMONIALS[currentTestimonial].name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{TESTIMONIALS[currentTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Nav dots */}
          <div className="flex space-x-2 mt-6 sm:mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2 h-2 rounded-full transition-all ${currentTestimonial === idx ? 'bg-primary w-5' : 'bg-gray-800 hover:bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="py-12 sm:py-20 bg-gray-950/30 border-t border-gray-900/60 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <div className="text-center space-y-2 mb-10 sm:mb-16">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">Got Questions?</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-gray-500 text-xs sm:text-sm">Everything you need to know to get started with VenuePro.</p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#0f1422]/40 border border-gray-900 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between font-bold text-xs sm:text-sm text-left hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`} />
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
                        <div className="px-5 pb-4.5 pt-0.5 sm:px-6 sm:pb-5 text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-gray-900/60">
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

      {/* VENUE TYPES SECTION */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 border-t border-gray-900/60 relative">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">Perfect for Every Venue</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">VenuePro Adapts to Your Business</h3>
          <p className="text-gray-500 text-xs sm:text-sm">Whether you run a single hall or a chain of resorts, we've got you covered.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {VENUE_TYPES.map((vt, idx) => (
            <motion.div
              key={vt.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-gradient-to-b from-gray-900/60 to-gray-950/40 border border-gray-800/80 hover:border-primary/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <span className="text-lg font-black">{vt.title.charAt(0)}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{vt.title}</h4>
              <p className="text-gray-500 text-[10px] sm:text-xs leading-relaxed">{vt.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ONBOARDING STEPS */}
      <section className="py-12 sm:py-20 bg-gray-950/50 border-t border-gray-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">Getting Started</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">From Signup to Going Live</h3>
            <p className="text-gray-500 text-xs sm:text-sm">We make it effortless — 3 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Submit Your Request', desc: 'Fill out a quick form with your venue details. Our team will review and contact you within 24-48 hours.' },
              { step: '02', title: 'Free Data Migration', desc: 'We migrate your existing data for free — from Excel sheets, paper registers, or any other system. Zero hassle.' },
              { step: '03', title: 'Go Live & Grow', desc: 'Start managing bookings, tracking leads, and generating invoices. Full onboarding support included.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center sm:text-left space-y-3"
              >
                <div className="w-12 h-12 mx-auto sm:mx-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{s.step}</div>
                <h4 className="text-base sm:text-lg font-bold text-white">{s.title}</h4>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-t border-gray-900/80">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent pointer-events-none blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6 relative z-10"
        >
          <h3 className="text-2xl sm:text-4xl font-bold text-white">Ready to Transform Your Venue Management?</h3>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Join hundreds of venue owners who have simplified their operations and grown their business with VenuePro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="btn-primary inline-flex items-center px-6 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm rounded-xl"
            >
              List Your Venue Now <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
            </Link>
            <a href="#features" className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors">
              See How It Works →
            </a>
          </div>
        </motion.div>
      </section>

      {/* RICH MULTI-COLUMN FOOTER */}
      <footer className="bg-[#060a14] py-12 sm:py-16 border-t border-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Top row: Logo + tagline */}
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 sm:mb-12">
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-primary/20">V</div>
                <span className="font-bold text-lg tracking-tight text-white">VenuePro</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">Making venue management simple and efficient. Manage Smarter, Grow Faster.</p>
            </div>

            {/* Footer columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-xs">
              <div className="space-y-3">
                <h5 className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">Product</h5>
                <ul className="space-y-2 text-gray-500">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pain" className="hover:text-white transition-colors">Why VenuePro</a></li>
                  <li><a href="#faqs" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">Resources</h5>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                  <li><a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">Company</h5>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
                  <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">Legal</h5>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-gray-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-gray-600">
            <p>© 2026 VenuePro. All rights reserved. Made with ❤️ in India.</p>
            <p className="text-gray-700">Manage Smarter. Grow Faster.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
