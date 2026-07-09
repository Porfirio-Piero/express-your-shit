'use client';

import React, { useEffect, useRef, useState } from 'react';

// ===== WAX SEAL =====
export function WaxSeal({ 
  size = 'md', 
  animate = false,
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
  animate?: boolean;
  className?: string;
}) {
  const sizes = { 
    sm: 'w-12 h-12', 
    md: 'w-20 h-20', 
    lg: 'w-28 h-28',
    xl: 'w-36 h-36' 
  };
  const fontSizes = { sm: 'text-[8px]', md: 'text-xs', lg: 'text-sm', xl: 'text-base' };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizes[size]} ${className}`}>
      {/* Outer ring - wax texture */}
      <div 
        className={`absolute inset-0 rounded-full ${animate ? 'seal-animate' : 'seal-pulse'}`}
        style={{ 
          background: 'radial-gradient(circle at 35% 30%, #8B2A30 0%, #6B1E24 40%, #4A1418 100%)',
          boxShadow: '0 4px 16px rgba(107, 30, 36, 0.45), inset 0 -4px 8px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.12)',
        }}
      />
      {/* Inner ring */}
      <div 
        className="absolute rounded-full"
        style={{
          inset: size === 'lg' || size === 'xl' ? '6px' : '4px',
          border: '1px solid rgba(232, 225, 204, 0.25)',
          borderRadius: '50%',
        }}
      />
      {/* Wax drip */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 bg-wax-wine rounded-b-full seal-drip"
        style={{ height: animate ? 0 : 14 }} 
      />
      {/* Text */}
      <span className={`relative z-10 ${fontSizes[size]} font-display font-bold text-parchment tracking-wider`}>
        EYS
      </span>
    </div>
  );
}

// ===== SEAL GLYPH (inline bullet/checkmark) =====
export function SealGlyph({ className = '', size = 14 }: { className?: string; size?: number }) {
  return (
    <svg className={`inline-block shrink-0 ${className}`} width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#6B1E24" />
      <circle cx="8" cy="8" r="5.5" stroke="#E8E1CC" strokeWidth="0.6" fill="none" opacity="0.5" />
      <circle cx="8" cy="8" r="4.5" stroke="#B8925A" strokeWidth="0.3" fill="none" opacity="0.4" />
      <text x="8" y="10" textAnchor="middle" fontSize="3.5" fontFamily="Fraunces, serif" fontWeight="700" fill="#E8E1CC">EYS</text>
    </svg>
  );
}

// ===== CHECK SEAL (for comparison tables) =====
export function CheckSeal({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${className}`} style={{ background: 'radial-gradient(circle at 35% 30%, #8B2A30 0%, #6B1E24 100%)' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="#E8E1CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function CrossMark({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-charcoal-light/40 ${className}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 3L9 9M9 3L3 9" stroke="#6B1E24" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ===== DECKLED DIVIDER =====
export function DeckledDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-6 ${className}`}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 24">
        <path 
          d="M0,12 Q30,4 60,12 Q90,20 120,12 Q150,4 180,12 Q210,20 240,12 Q270,4 300,12 Q330,20 360,12 Q390,4 420,12 Q450,20 480,12 Q510,4 540,12 Q570,20 600,12 Q630,4 660,12 Q690,20 720,12 Q750,4 780,12 Q810,20 840,12 Q870,4 900,12 Q930,20 960,12 Q990,4 1020,12 Q1050,20 1080,12 Q1110,4 1140,12 Q1170,20 1200,12" 
          fill="none" 
          stroke="#B8925A" 
          strokeWidth="0.8" 
          opacity="0.2" 
        />
      </svg>
    </div>
  );
}

// ===== BUTTON =====
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
  const base = 'btn-press inline-flex items-center justify-center gap-2 font-body font-semibold rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-wax-wine text-parchment hover:bg-wax-wine/90 px-6 py-3 text-base shadow-lg shadow-wax-wine/20 hover:shadow-wax-wine/30 border border-wax-wine/0 hover:border-foil-gold/30',
    secondary: 'bg-charcoal/60 text-parchment border border-charcoal-light hover:border-foil-gold/50 hover:bg-charcoal px-6 py-3 text-base backdrop-blur-sm',
    ghost: 'bg-transparent text-parchment/70 hover:text-parchment hover:bg-charcoal/40 px-4 py-2 text-sm',
    gold: 'bg-gradient-to-r from-foil-gold via-foil-gold-light to-foil-gold text-ink font-bold px-8 py-4 text-lg shadow-xl shadow-foil-gold/20 hover:shadow-foil-gold/40 border border-foil-gold-light/30 hover:scale-[1.02]',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ===== SECTION =====
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
    <section id={id} className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 ${className}`}>
      {children}
    </section>
  );
}

// ===== SECTION HEADING =====
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
    <div className={`text-center mb-14 ${className}`}>
      <div className="inline-flex items-center gap-3 mb-4">
        <span className="h-px w-8 bg-foil-gold/30" />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-foil-gold/60">
          Office of Anonymous Justice
        </span>
        <span className="h-px w-8 bg-foil-gold/30" />
      </div>
      <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-parchment mb-4 text-balance leading-tight">
        {children}
      </h2>
      {sub && <p className="text-parchment/50 text-lg max-w-2xl mx-auto text-balance">{sub}</p>}
    </div>
  );
}

// ===== SCROLL REVEAL WRAPPER =====
export function Reveal({ 
  children, 
  className = '',
  variant = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'up' | 'fade' | 'left' | 'right' | 'scale';
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variantClass = {
    up: 'reveal',
    fade: 'reveal-fade',
    left: 'reveal-left',
    right: 'reveal-right',
    scale: 'reveal-scale',
  }[variant];

  return (
    <div 
      ref={ref} 
      className={`${variantClass} ${visible ? 'visible' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ===== TIER CARD =====
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
    <div className={`tier-card relative rounded-2xl p-7 md:p-8 flex flex-col ${
      tier.highlighted 
        ? 'featured glass-card-gold border border-foil-gold/40 gold-glow' 
        : 'glass-card border border-charcoal-light'
    }`}>
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-foil-gold to-foil-gold-light text-ink px-5 py-1.5 rounded-full text-xs font-bold font-body tracking-wider shadow-lg shadow-foil-gold/20">
            {tier.badge}
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl md:text-3xl text-parchment mb-2">{tier.name}</h3>
        <p className="text-parchment/50 text-sm">{tier.tagline}</p>
      </div>
      
      <div className="text-center mb-7">
        <span className="font-display text-4xl md:text-5xl gold-text font-semibold">${tier.price}</span>
      </div>
      
      <ul className="space-y-3.5 mb-8 flex-1">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-parchment/75 text-sm">
            <SealGlyph className="mt-0.5" size={16} />
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

// ===== CASE NUMBER =====
export function CaseNumber({ number }: { number: string }) {
  return (
    <span className="case-number text-foil-gold font-mono font-semibold tracking-widest">
      {number}
    </span>
  );
}

// ===== CERTIFICATE =====
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
    <div className="certificate-border bg-paper-white text-ink p-8 md:p-12 max-w-2xl mx-auto rounded-sm">
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
                <span className="text-wax-wine mt-0.5 font-mono">§</span>
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

// ===== FOOTER =====
export function Footer() {
  return (
    <footer className="bg-ink border-t border-charcoal-light/10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <WaxSeal size="sm" />
              <div className="font-display text-xl text-parchment tracking-wide">Express Your Sh*t</div>
            </div>
            <p className="text-parchment/40 text-sm mb-2">Say it with shit.</p>
            <p className="text-parchment/30 text-xs max-w-sm">
              A premium novelty gag-gift service from the Office of Anonymous Justice. 
              Certified, sealed, and delivered with the gravity it deserves.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-foil-gold/60 mb-4">Legal</div>
            <div className="space-y-2.5">
              <a href="/terms" className="block text-parchment/50 text-sm hover:text-foil-gold transition-colors">Terms of Service</a>
              <a href="/privacy" className="block text-parchment/50 text-sm hover:text-foil-gold transition-colors">Privacy Policy</a>
              <a href="/faq" className="block text-parchment/50 text-sm hover:text-foil-gold transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-foil-gold/60 mb-4">Compare</div>
            <div className="space-y-2.5">
              <a href="/vs-shitexpress" className="block text-parchment/50 text-sm hover:text-foil-gold transition-colors">vs ShitExpress</a>
              <a href="/vs-poopsenders" className="block text-parchment/50 text-sm hover:text-foil-gold transition-colors">vs PoopSenders</a>
              <a href="/vs-sendsomepoop" className="block text-parchment/50 text-sm hover:text-foil-gold transition-colors">vs SendSomePoop</a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-charcoal-light/5 text-center">
          <p className="text-parchment/20 text-xs">
            © {new Date().getFullYear()} Express Your Sh*t. All rights reserved. This is a novelty gag-gift service.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ===== NAVIGATION =====
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-ink/85 backdrop-blur-xl border-b border-foil-gold/10' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 30%, #8B2A30 0%, #6B1E24 100%)' }}>
            <span className="text-[8px] font-display font-bold text-parchment">EYS</span>
          </div>
          <span className="font-display text-base text-parchment tracking-wide group-hover:text-foil-gold-light transition-colors">
            Express Your Sh*t
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="/#how-it-works" className="text-parchment/60 text-sm hover:text-parchment transition-colors">How It Works</a>
          <a href="/#tiers" className="text-parchment/60 text-sm hover:text-parchment transition-colors">Tiers</a>
          <a href="/#kit" className="text-parchment/60 text-sm hover:text-parchment transition-colors">The Kit</a>
          <a href="/faq" className="text-parchment/60 text-sm hover:text-parchment transition-colors">FAQ</a>
          <Button variant="primary" className="text-sm px-5 py-2" onClick={() => window.location.href = '/checkout'}>
            Order Now
          </Button>
        </div>
        <button className="md:hidden text-parchment" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu-open md:hidden bg-ink/95 backdrop-blur-xl border-t border-foil-gold/10 px-4 py-6 space-y-4">
          <a href="/#how-it-works" className="block text-parchment/70 text-sm" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="/#tiers" className="block text-parchment/70 text-sm" onClick={() => setMenuOpen(false)}>Tiers</a>
          <a href="/#kit" className="block text-parchment/70 text-sm" onClick={() => setMenuOpen(false)}>The Kit</a>
          <a href="/faq" className="block text-parchment/70 text-sm" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Button variant="primary" className="w-full text-sm" onClick={() => { setMenuOpen(false); window.location.href = '/checkout'; }}>
            Order Now
          </Button>
        </div>
      )}
    </nav>
  );
}

// ===== WAVEFORM VISUALIZER =====
export function Waveform({ playing = false, bars = 24 }: { playing?: boolean; bars?: number }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: '100%',
            animationDelay: `${i * 0.06}s`,
            animationDuration: `${0.6 + (i % 4) * 0.15}s`,
            opacity: playing ? 1 : 0.3,
            animationPlayState: playing ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
}