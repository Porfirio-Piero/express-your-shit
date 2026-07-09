'use client';

import { useState, useEffect } from 'react';
import { WaxSeal, SealGlyph } from '@/components/ui';

const OFFENSES_LIST = [
  'Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat',
  'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All',
  'Parking Space Piracy', 'Unsolicited Life Advice',
];

// This would be fetched from Supabase in production
interface GrievanceData {
  caseNumber: string;
  offenses: string[];
  customCharge?: string;
  characterName: string;
  gender: string;
  accent: string;
  message: string;
  createdAt: string;
}

export default function GrievancePage({ params }: { params: Promise<{ id: string }> }) {
  const [grievance, setGrievance] = useState<GrievanceData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<string>('');

  useEffect(() => {
    params.then(p => setResolvedParams(p.id));
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    // Mock data for now - in production this fetches from Supabase
    const mockGrievance: GrievanceData = {
      caseNumber: `EYS-GR-${resolvedParams.substring(0, 6).toUpperCase().padEnd(6, '0')}`,
      offenses: ['Chronic Left-on-Read', 'Crimes Against the Group Chat'],
      customCharge: 'And for the unforgivable act of liking your own posts.',
      characterName: 'The Disappointed Judge',
      gender: 'male',
      accent: 'american',
      message: 'You have been found guilty. Justice has been served.',
      createdAt: new Date().toISOString(),
    };
    setGrievance(mockGrievance);
  }, [resolvedParams]);

  function playVoiceNote() {
    if (!grievance || typeof window === 'undefined') return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(grievance.message);
      const voices = window.speechSynthesis.getVoices();
      const langMap: Record<string, string> = {
        american: 'en-US', british: 'en-GB', australian: 'en-AU', 'flat-robotic': 'en-US',
      };
      const targetLang = langMap[grievance.accent] || 'en-US';
      const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (matchingVoice) utterance.voice = matchingVoice;
      utterance.lang = targetLang;
      utterance.rate = grievance.accent === 'flat-robotic' ? 0.7 : 0.9;
      utterance.pitch = grievance.gender === 'female' ? 1.3 : 0.8;
      
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  if (!grievance) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <WaxSeal size="md" />
          <p className="text-parchment/60 mt-4 font-display">Loading case file...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-display text-xs tracking-[0.3em] uppercase text-foil-gold/70 mb-2">
            Office of Anonymous Justice
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-parchment mb-2">
            Certificate of Grievance
          </h1>
          <div className="case-number text-sm text-parchment/50">
            Case No. {grievance.caseNumber}
          </div>
        </div>

        {/* Certificate */}
        <div className="certificate-border bg-paper-white text-ink p-8 md:p-12 mb-8">
          <div className="text-center mb-6">
            <div className="font-display text-xs tracking-[0.3em] uppercase text-wax-wine/60 mb-2">
              Official Decree
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-wax-wine mb-2">
              Certificate of Grievance
            </h2>
            <div className="case-number text-sm text-charcoal/60">
              Case No. {grievance.caseNumber}
            </div>
          </div>

          <div className="space-y-4 text-sm md:text-base">
            <p className="text-center font-display italic text-charcoal/70">
              Let it be known that a formal complaint has been filed
            </p>

            <div className="border-t border-b border-wax-wine/20 py-4 my-4">
              <div className="font-display text-sm text-wax-wine mb-2">Cited Offenses:</div>
              <ul className="space-y-1">
                {grievance.offenses.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-wax-wine mt-0.5">§</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {grievance.customCharge && (
              <div className="border-l-2 border-wax-wine/30 pl-4 italic text-charcoal/80">
                &ldquo;{grievance.customCharge}&rdquo;
              </div>
            )}

            <div className="text-center mt-8 pt-4 border-t border-wax-wine/10">
              <div className="text-xs text-charcoal/50 mb-1">Filed by:</div>
              <div className="font-display text-wax-wine">Identity withheld by design</div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <WaxSeal size="md" />
          </div>
        </div>

        {/* Voice Note Player */}
        <div className="bg-charcoal/50 border border-charcoal-light rounded-xl p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-wax-wine flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-parchment" viewBox="0 0 24 24" fill="currentColor">
                {playing ? (
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-parchment mb-1">Play Grievance</div>
              <div className="text-parchment/50 text-sm mb-1">
                {grievance.characterName} · {grievance.gender} · {grievance.accent}
              </div>
              <div className="text-parchment/40 text-xs">
                Voice generated by AI. Production version uses professional TTS.
              </div>
            </div>
          </div>
          <button
            onClick={playVoiceNote}
            className="mt-4 w-full bg-wax-wine hover:bg-wax-wine/90 text-parchment font-display py-3 rounded-lg transition-colors"
          >
            {playing ? 'Playing...' : '▶ Play Voice Note'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-parchment/30 text-xs space-y-2">
          <p>This is a novelty gag-gift service. The recipient never sees your name or any identifying detail.</p>
          <p>Minimal records are kept to fulfill orders. Recipient data is purged 30 days after delivery.</p>
          <p className="mt-4">
            <a href="/" className="text-foil-gold/50 hover:text-foil-gold transition-colors">
              expressyourshit.io
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}