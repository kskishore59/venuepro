import React, { useState, useEffect } from 'react';
import { 
  Palette, Type, Sliders, CheckCircle2, 
  Sparkles, RefreshCw, Info
} from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { toast } from 'sonner';

const FONT_PRESETS = [
  { name: 'Outfit', value: "'Outfit', 'Inter', sans-serif", desc: 'Modern geometric sans-serif with friendly corporate character.' },
  { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', 'Inter', sans-serif", desc: 'High-fidelity tech typography with beautiful clean proportions.' },
  { name: 'Inter', value: "'Inter', sans-serif", desc: 'Neumorphic workspace layout standard optimized for pure readability.' },
  { name: 'Playfair Display', value: "'Playfair Display', serif", desc: 'Premium elegance styled for luxury banquets and heritage weddings.' }
];

const COLOR_PRESETS = [
  { 
    name: 'Midnight Corporate', 
    primary: '211 67% 32%', // #1B4F8A
    accent: '221 83% 53%', // #2563EB
    hexPrimary: '#1B4F8A',
    hexAccent: '#2563EB',
    desc: 'The executive professional standard ideal for general B2B events.' 
  },
  { 
    name: 'Royal Orchid & Amber', 
    primary: '300 64% 25%', // #580d5b
    accent: '38 95% 50%', // #f59e0b
    hexPrimary: '#580d5b',
    hexAccent: '#f59e0b',
    desc: 'Exquisite luxury layout curated for high-end wedding planning.' 
  },
  { 
    name: 'Emerald Garden & Sage', 
    primary: '161 93% 19%', // #023e2b
    accent: '142 71% 45%', // #10b981
    hexPrimary: '#023e2b',
    hexAccent: '#10b981',
    desc: 'Earthy natural scheme matching destination resort settings.' 
  },
  { 
    name: 'Crimson Wine & Gold', 
    primary: '343 78% 22%', // #630c25
    accent: '45 93% 47%', // #d97706
    hexPrimary: '#630c25',
    hexAccent: '#d97706',
    desc: 'Deep warm palette for evening banquets and corporate galas.' 
  }
];

export const DesignSystem: React.FC = () => {
  const [currentFont, setCurrentFont] = useState<string>('');
  const [currentColor, setCurrentColor] = useState<string>('');

  useEffect(() => {
    const loadedFont = localStorage.getItem('venuepro-brand-font') || FONT_PRESETS[0].value;
    const loadedColor = localStorage.getItem('venuepro-brand-color-name') || COLOR_PRESETS[0].name;
    setCurrentFont(loadedFont);
    setCurrentColor(loadedColor);
  }, []);

  const handleApplyFont = (fontVal: string, name: string) => {
    setCurrentFont(fontVal);
    localStorage.setItem('venuepro-brand-font', fontVal);
    document.documentElement.style.setProperty('--global-font', fontVal);
    toast.success(`Active typography set to ${name} successfully!`);
  };

  const handleApplyColor = (preset: typeof COLOR_PRESETS[0]) => {
    setCurrentColor(preset.name);
    localStorage.setItem('venuepro-brand-color-name', preset.name);
    localStorage.setItem('venuepro-brand-primary', preset.primary);
    localStorage.setItem('venuepro-brand-accent', preset.accent);
    
    document.documentElement.style.setProperty('--primary', preset.primary);
    document.documentElement.style.setProperty('--accent', preset.accent);
    toast.success(`Color palette changed to ${preset.name} globally!`);
  };

  const handleReset = () => {
    handleApplyFont(FONT_PRESETS[0].value, FONT_PRESETS[0].name);
    handleApplyColor(COLOR_PRESETS[0]);
    toast.info('Brand system style defaults restored.');
  };

  return (
    <div className="space-y-6">
      <SEO title="Brand & Design System Console" description="Enterprise corporate style guidelines, live color controllers, typography selectors, and components sandbox." />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Console Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">Brand & Design System</h1>
          <p className="text-gray-500">Corporate document defining colors, typography, buttons, and layouts with real-time variables customization.</p>
        </div>

        <button 
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 text-sm font-bold rounded-xl transition-all shadow-sm border border-gray-200 z-10"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns: Controllers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Typography Customizer */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <Type className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Typography Customizer</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-full">Active</span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Choose a global font face. Selecting a preset updates the entire SaaS dashboard, public landing pages, invoices, and scheduling calendars instantly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {FONT_PRESETS.map(font => {
                  const isActive = currentFont === font.value;
                  return (
                    <button
                      key={font.name}
                      onClick={() => handleApplyFont(font.value, font.name)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-32 relative overflow-hidden ${
                        isActive 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {isActive && (
                        <CheckCircle2 className="w-4 h-4 text-primary absolute top-3 right-3" />
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{font.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{font.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-primary mt-2" style={{ fontFamily: font.value }}>
                        Aa Bb Cc 123
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Color Palettes Customizer */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <Palette className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Color Registry</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-full">Dynamic</span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Redefine the brand color variables globally. The selected theme propagates to active buttons, header gradients, analytics nodes, and layout borders across the workspace.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {COLOR_PRESETS.map(preset => {
                  const isActive = currentColor === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyColor(preset)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-36 relative overflow-hidden ${
                        isActive 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {isActive && (
                        <CheckCircle2 className="w-4 h-4 text-primary absolute top-3 right-3" />
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{preset.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{preset.desc}</p>
                      </div>

                      {/* Swatch Previews */}
                      <div className="flex items-center space-x-2 mt-4">
                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: preset.hexPrimary }} title="Primary" />
                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: preset.hexAccent }} title="Accent" />
                        <span className="text-[10px] font-mono text-gray-400">
                          {preset.hexPrimary} / {preset.hexAccent}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Style Guide Preview & Sandbox */}
        <div className="space-y-6">
          
          {/* Active Sandbox Preview Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
              <Sliders className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Style Guide Preview</h3>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Button Sandbox */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b pb-1">Interactive Elements</h4>
                <div className="flex flex-col gap-2">
                  <button className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-95 shadow-sm transition-all">
                    Solid Primary Button
                  </button>
                  <button className="w-full py-2 bg-white text-primary text-sm font-semibold border border-primary rounded-xl hover:bg-primary/5 transition-all">
                    Outline Accent Button
                  </button>
                </div>
              </div>

              {/* Typography Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b pb-1">Typography Sizing</h4>
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-mono">Title H1 (font-black 2xl)</span>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">The Grand Ballroom</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-mono">Subtitle H3 (font-semibold sm)</span>
                    <p className="text-sm font-semibold text-gray-600">Dynamic Multi-Tenant SaaS Workspace</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-mono">Body Paragraph (text-xs text-gray-400)</span>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      All transactional operations and lead intakes are captured in secure distributed tables with automated backup recovery schedules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b pb-1">Platform Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-100 text-xs font-bold rounded-full">Confirmed</span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-full">Active Hold</span>
                  <span className="px-2.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 text-xs font-bold rounded-full">Inquiry</span>
                </div>
              </div>

            </div>
          </div>

          {/* System Brand Directives */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs text-gray-500">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
              <Info className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">System Brand Rules</h3>
            </div>
            
            <div className="p-6 space-y-4 leading-relaxed">
              <p>
                VenuePro brand guidelines enforce clean corporate clarity mixed with a luxurious user experience. Use these principles when introducing new layouts:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong className="text-gray-700">Contrast Rules:</strong> Ensure standard interactive texts satisfy a minimum of 4.5:1 AA contrast ratio.
                </li>
                <li>
                  <strong className="text-gray-700">Corner Radius:</strong> Standardize component borders using a cohesive <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">rounded-2xl</code> (16px) bounding box.
                </li>
                <li>
                  <strong className="text-gray-700">Whitespace Spacing:</strong> Maintain generous vertical paddings (<code className="bg-gray-100 px-1 py-0.5 rounded font-mono">py-6</code> / 24px) to represent room and luxury layout concepts.
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default DesignSystem;
