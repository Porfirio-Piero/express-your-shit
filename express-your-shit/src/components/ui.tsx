'use client';

import React from 'react';

// Wax Seal Component
export function WaxSeal({ 
  size = 'md', 
  animate = false,
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  animate?: boolean;
  className?: string;
}) {
  const sizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-28 h-28' };
  const fontSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizes[size]} ${className}`}>
      <div className={`absolute inset-0 rounded-full bg-wax-wine ${animate ? 'seal-animate' : ''}`}
        style={{ boxShadow: '0 4px 12px rgba(107, 30, 36, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)' }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 bg-wax-wine rounded-b-full seal-drip"
        style={{ height: animate ? 0 : 12 }} />
      <span className={`relative z-10 ${fontSizes[size]} font-display font-bold text-parchment tracking-wider`}>
        EYS
      </span>
    </div>
  );
}

// Seal Glyph (inline, used as bullet/checkmark replacement)
export function SealGlyph({ className = '' }: { className?: string }) {
  return (
    <svg className={`inline-block ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#6B1E24" />
      <circle cx="8" cy="8" r="5" stroke="#E8E1CC" strokeWidth="0.75" fill="none" />
      <text x="8" y="10.5" textAnchor="middle" fontSize="5" fontFamily="Fraunces, serif" fontWeight="700" fill="#E8E1CC">EYS</text>
    </svg>
  );
}

// Deckled Divider
export function DeckledDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-4 ${className}`}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 16">
        <path d="M0,8 Q30,2 60,8 Q90,14 120,8 Q150,2 180,8 Q210,14 240,8 Q270,2 300,8 Q330,14 360,8 Q390,2 420,8 Q450,14 480,8 Q510,2 540,8 Q570,14 600,8 Q630,2 660,8 Q690,14 720,8 Q750,2 780,8 Q810,14 840,8 Q870,2 900,8 Q930,14 960,8 Q990,2 1020,8 Q1050,14 1080,8 Q1110,2 1140,8 Q1170,14 1200,8" fill="none" stroke="#E8E1CC" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
}

// Button variants
export function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-wax-wine text-parchment hover:bg-wax-wine/90 px-6 py-3 text-base shadow-lg shadow-wax-wine/20',
    secondary: 'bg-charcoal text-parchment border border-charcoal-light hover:border-foil-gold px-6 py-3 text-base',
    ghost: 'bg-transparent text-parchment hover:bg-charcoal/50 px-4 py-2 text-sm',
    gold: 'bg-gradient-to-r from-foil-gold to-foil-gold-light text-ink font-bold px-8 py-4 text-lg shadow-lg shadow-foil-gold/20 hover:shadow-foil-gold/40',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Section Container
export function Section({ 
  children, 
  className = '',
  id,
}: { 
  children: React.ReactNode; 
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}

// Section Heading
export function SectionHeading({ 
  children,
  sub,
  className = '',
}: { 
  children: React.ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-parchment mb-4">{children}</h2>
      {sub && <p className="text-parchment/70 text-lg max-w-2xl mx-auto">{sub}</p>}
    </div>
  );
}

// Tier Card
export interface Tier {
  id: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export function TierCard({ tier }: { tier: Tier }) {
  return (
    <div className={`tier-card relative rounded-2xl p-6 md:p-8 flex flex-col ${
      tier.highlighted 
        ? 'bg-charcoal border-2 border-foil-gold shadow-2xl shadow-foil-gold/10' 
        : 'bg-charcoal/50 border border-charcoal-light'
    }`}>
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foil-gold text-ink px-4 py-1 rounded-full text-sm font-bold font-body tracking-wide">
          {tier.badge}
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl md:text-3xl text-parchment mb-2">{tier.name}</h3>
        <p className="text-parchment/60 text-sm">{tier.tagline}</p>
      </div>
      <div className="text-center mb-6">
        <span className="font-display text-4xl md:text-5xl text-foil-gold">${tier.price}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-parchment/80 text-sm">
            <SealGlyph className="mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button variant={tier.highlighted ? 'gold' : 'secondary'} className="w-full">
        {tier.highlighted ? 'Select Full Send' : `Select ${tier.name}`}
      </Button>
    </div>
  );
}

// Case Number Display
export function CaseNumber({ number }: { number: string }) {
  return (
    <span className="case-number text-foil-gold font-mono font-semibold tracking-widest">
      {number}
    </span>
  );
}

// Certificate Component
export function Certificate({ 
  caseNumber,
  offenses,
  customCharge,
  complainant = 'Identity withheld by design',
}: {
  caseNumber: string;
  offenses: string[];
  customCharge?: string;
  complainant?: string;
}) {
  return (
    <div className="certificate-border bg-paper-white text-ink p-8 md:p-12 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="font-display text-xs tracking-[0.3em] uppercase text-wax-wine/60 mb-2">
          Office of Anonymous Justice
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-wax-wine mb-1">
          Certificate of Grievance
        </h2>
        <div className="case-number text-sm text-charcoal/60 mt-2">
          Case No. {caseNumber}
        </div>
      </div>
      
      <div className="space-y-4 text-sm md:text-base">
        <p className="text-center font-display italic text-charcoal/70">
          Let it be known that a formal complaint has been filed
        </p>
        
        <div className="border-t border-b border-wax-wine/20 py-4 my-4">
          <div className="font-display text-sm text-wax-wine mb-2">Cited Offenses:</div>
          <ul className="space-y-1">
            {offenses.map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-wax-wine mt-0.5">§</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>

        {customCharge && (
          <div className="border-l-2 border-wax-wine/30 pl-4 italic text-charcoal/80">
            &ldquo;{customCharge}&rdquo;
          </div>
        )}

        <div className="text-center mt-8 pt-4 border-t border-wax-wine/10">
          <div className="text-xs text-charcoal/50 mb-1">Filed by:</div>
          <div className="font-display text-wax-wine">{complainant}</div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <WaxSeal size="md" />
      </div>
    </div>
  );
}

// Footer
export function Footer() {
  return (
    <footer className="bg-ink border-t border-charcoal-light/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-display text-xl text-parchment mb-3">Express Your Sh*t</div>
            <p className="text-parchment/50 text-sm">Say it with shit.</p>
            <p className="text-parchment/30 text-xs mt-2">A premium novelty gag-gift service.</p>
          </div>
          <div>
            <div className="font-display text-sm text-foil-gold mb-3 tracking-wider uppercase">Legal</div>
            <div className="space-y-2">
              <a href="/terms" className="block text-parchment/60 text-sm hover:text-parchment transition-colors">Terms of Service</a>
              <a href="/privacy" className="block text-parchment/60 text-sm hover:text-parchment transition-colors">Privacy Policy</a>
              <a href="/faq" className="block text-parchment/60 text-sm hover:text-parchment transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <div className="font-display text-sm text-foil-gold mb-3 tracking-wider uppercase">Compare</div>
            <div className="space-y-2">
              <a href="/vs-shitexpress" className="block text-parchment/60 text-sm hover:text-parchment transition-colors">vs ShitExpress</a>
              <a href="/vs-poopsenders" className="block text-parchment/60 text-sm hover:text-parchment transition-colors">vs PoopSenders</a>
              <a href="/vs-sendsomepoop" className="block text-parchment/60 text-sm hover:text-parchment transition-colors">vs SendSomePoop</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-charcoal-light/10 text-center">
          <p className="text-parchment/30 text-xs">
            © {new Date().getFullYear()} Express Your Sh*t. All rights reserved. This is a novelty gag-gift service.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Navigation
export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink/90 backdrop-blur-md border-b border-charcoal-light/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="/" className="font-display text-lg text-parchment tracking-wide">
          Express Your Sh*t
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-parchment/70 text-sm hover:text-parchment transition-colors">How It Works</a>
          <a href="#tiers" className="text-parchment/70 text-sm hover:text-parchment transition-colors">Tiers</a>
          <a href="#faq" className="text-parchment/70 text-sm hover:text-parchment transition-colors">FAQ</a>
          <Button variant="primary" className="text-sm px-4 py-2" onClick={() => window.location.href = '/checkout'}>
            Order Now
          </Button>
        </div>
        <button className="md:hidden text-parchment" onClick={() => {
          const menu = document.getElementById('mobile-menu');
          menu?.classList.toggle('hidden');
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>
      <div id="mobile-menu" className="hidden md:hidden bg-ink border-t border-charcoal-light/20 px-4 py-4 space-y-3">
        <a href="#how-it-works" className="block text-parchment/70 text-sm">How It Works</a>
        <a href="#tiers" className="block text-parchment/70 text-sm">Tiers</a>
        <a href="#faq" className="block text-parchment/70 text-sm">FAQ</a>
        <Button variant="primary" className="w-full text-sm" onClick={() => window.location.href = '/checkout'}>
          Order Now
        </Button>
      </div>
    </nav>
  );
}