'use client';

import { useState, useEffect } from 'react';

const OFFENSES_LIST = [
  'Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat',
  'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All',
  'Parking Space Piracy', 'Unsolicited Life Advice',
];

function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

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
    if (!grievance || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(grievance.message);
    const voices = window.speechSynthesis.getVoices();
    const langMap: Record<string, string> = { american: 'en-US', british: 'en-GB', australian: 'en-AU', 'flat-robotic': 'en-US' };
    const targetLang = langMap[grievance.accent] || 'en-US';
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.lang = targetLang;
    utterance.rate = grievance.accent === 'flat-robotic' ? 0.7 : 0.9;
    utterance.pitch = grievance.gender === 'female' ? 1.3 : 0.8;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  }

  if (!grievance) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="eys-seal-static" style={{ width: 80, height: 80, margin: '0 auto 16px' }}>
            <span className="glyph" style={{ fontSize: '1.2rem' }}>EYS</span>
          </div>
          <p style={{ color: 'var(--parchment-dim)', fontFamily: 'var(--serif)' }}>Loading case file...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--ink)', position: 'relative' }}>
      {/* Radial glow */}
      <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', opacity: 0.1, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(184,146,90,0.3) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eys-eyebrow" style={{ marginBottom: 14 }}>Office of Anonymous Justice</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 600, fontSize: '1.9rem', color: '#1D1610', marginBottom: 6 }}>
            Certificate of Grievance
          </h1>
          <div className="eys-cert-case">Case No. {grievance.caseNumber}</div>
        </div>

        {/* Certificate */}
        <div className="eys-cert-preview-wrap" style={{ marginBottom: 40 }}>
          <div className="eys-certificate">
            <div className="eys-cert-eyebrow">Office of Anonymous Justice</div>
            <div className="eys-cert-title">Certificate of Grievance</div>
            <div className="eys-cert-case">Case No. {grievance.caseNumber}</div>
            <div className="eys-cert-body">This certifies that the recipient of this specimen was found, beyond reasonable doubt, in violation of the following:</div>
            <div className="eys-cert-chips">
              {grievance.offenses.map(o => <span className="eys-cert-chip" key={o}>{o}</span>)}
            </div>
            {grievance.customCharge && (
              <div className="eys-cert-quote">&ldquo;{grievance.customCharge}&rdquo;</div>
            )}
            <div className="eys-cert-footer">
              <div className="eys-cert-sig">The Complainant<small>Identity withheld by design</small></div>
              <div className="eys-cert-seal-mini"><span>EYS</span></div>
            </div>
          </div>
        </div>

        {/* Voice Note Player */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-line)', borderRadius: 8, padding: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
            <button
              onClick={playVoiceNote}
              style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: 'radial-gradient(circle at 34% 30%, var(--wine-bright), var(--wine) 55%, #4A1418 100%)',
                boxShadow: '0 8px 16px -6px rgba(107,30,36,0.6)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--parchment)">
                {playing ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
            </button>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--parchment)', marginBottom: 4 }}>Play Grievance</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--parchment-dim)', marginBottom: 4 }}>
                {grievance.characterName} · {grievance.gender} · {grievance.accent}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--parchment-dim)', opacity: 0.6 }}>
                Voice generated by AI. Production version uses professional TTS.
              </div>
            </div>
          </div>
          <button
            onClick={playVoiceNote}
            style={{
              width: '100%', background: 'var(--wine)', color: 'var(--parchment)',
              border: '1px solid var(--wine-bright)', padding: '14px', borderRadius: 2,
              fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
          >
            {playing ? '⏸ Playing...' : '▶ Play Voice Note'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: 'var(--parchment-dim)', opacity: 0.4, fontSize: '0.75rem', lineHeight: 1.6 }}>
          <p>This is a novelty gag-gift service. The recipient never sees your name or any identifying detail.</p>
          <p>Minimal records are kept to fulfill orders. Recipient data is purged 30 days after delivery.</p>
          <p style={{ marginTop: 24 }}>
            <a href="/" style={{ color: 'var(--gold-bright)', opacity: 0.6, textDecoration: 'none', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>expressyourshit.io</a>
          </p>
        </div>
      </div>
    </main>
  );
}