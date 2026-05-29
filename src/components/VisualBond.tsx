/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, Camera, Image as ImageIcon, Heart, Trash2, Calendar, FileText, Download, Share2, HelpCircle } from 'lucide-react';
import { BondImage, RelationshipState } from '../types';

interface VisualBondProps {
  state: RelationshipState;
  onGenerateImage: (prompt: string, theme: string) => Promise<void>;
  isGenerating: boolean;
  onDeleteImage: (id: string) => void;
}

const VISUAL_THEMES = [
  { name: 'Dreamy Constellations', prompt: 'A magical starry night sky, with glowing stars aligning to form an interlocking outline of two lovers, deep indigo and golden stardust.' },
  { name: 'Cozy Watercolor', prompt: 'Two partners sharing a warm blanket on a wooden porch during falling autumn leaves, soft warm candlelight, vintage pastel colors.' },
  { name: 'Warm Silhouette', prompt: 'A couple holding hands while walking on a sun-drenched golden beach during sunset, high-contrast emotional reflection.' },
  { name: 'Enchanted Botanical', prompt: 'Two characters sitting inside a magnificent glass glasshouse filled with bioluminescent flowers and vines, magical emerald tones.' },
  { name: 'Minimalist Line Art', prompt: 'Modern single line-art illustration of two profiles touching foreheads, cozy cream beige background, warm neutral tones.' }
];

export default function VisualBond({ state, onGenerateImage, isGenerating, onDeleteImage }: VisualBondProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(VISUAL_THEMES[0].name);
  const [activeImage, setActiveImage] = useState<BondImage | null>(null);

  const getThemePrompt = () => {
    return VISUAL_THEMES.find(t => t.name === selectedTheme)?.prompt || '';
  };

  const handleGenerate = async () => {
    const finalPrompt = customPrompt.trim() || getThemePrompt();
    await onGenerateImage(finalPrompt, selectedTheme);
    setCustomPrompt('');
  };

  // Helper to generate a simulated high-end SVG fallback image URL if actual AI model is unavailable
  const renderFallbackVector = (partner1: string, partner2: string, theme: string) => {
    // Generate a beautiful, customizable inline SVG with glowing gradients, names, stars & anniversary details
    const cleanP1 = partner1 || "Love";
    const cleanP2 = partner2 || "Beloved";
    const anniversary = state.relationshipDate ? new Date(state.relationshipDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : "Our Anniversary";
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full h-full bg-[#0d0c11]">
        <defs>
          <radialGradient id="grad-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d0c11" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="50%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#301f2f" />
            <stop offset="50%" stopColor="#fda4af" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#301f2f" />
          </linearGradient>
        </defs>
        
        {/* Subtle glowing core */}
        <circle cx="250" cy="230" r="180" fill="url(#grad-glow)" />

        {/* Decorative Constellation Grid Lines */}
        <line x1="100" y1="250" x2="400" y2="250" stroke="url(#grad-line)" strokeWidth="1" />
        <line x1="250" y1="100" x2="250" y2="355" stroke="url(#grad-line)" strokeWidth="1" />
        <circle cx="250" cy="250" r="120" stroke="#fb7185" strokeWidth="0.5" strokeDasharray="3,6" fill="none" opacity="0.3" />
        <circle cx="250" cy="250" r="140" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4,8" fill="none" opacity="0.2" />

        {/* Constellation Stars */}
        <circle cx="160" cy="180" r="2.5" fill="#fff" opacity="0.7" />
        <circle cx="340" cy="180" r="2.5" fill="#fff" opacity="0.7" />
        <circle cx="200" cy="140" r="1" fill="#fda4af" opacity="0.5" />
        <circle cx="300" cy="140" r="1" fill="#fb7185" opacity="0.5" />
        <circle cx="180" cy="300" r="1.5" fill="#f59e0b" opacity="0.6" />
        <circle cx="320" cy="300" r="1.5" fill="#fb7185" opacity="0.6" />

        {/* Interlocking Glowing Hearts */}
        <g transform="translate(195, 190) scale(0.9)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#grad-gold)" opacity="0.75" />
        </g>
        <g transform="translate(245, 205) scale(0.9)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#f59e0b" opacity="0.6" />
        </g>

        {/* Constellation Connection Rays */}
        <line x1="210" y1="210" x2="295" y2="225" stroke="#fff" strokeWidth="1" strokeDasharray="2,3" opacity="0.4" />

        {/* Names Display inside layout */}
        <text x="250" y="340" fontFamily="Playfair Display, Georgia, serif" fontSize="23" fontWeight="600" fill="#ffffff" textAnchor="middle" letterSpacing="1">
          {cleanP1} &amp; {cleanP2}
        </text>
        
        {/* Anniversary Label */}
        <text x="250" y="365" fontFamily="Inter, sans-serif" fontSize="10.5" fill="#a8a29e" textAnchor="middle" letterSpacing="2" uppercase="true">
          {anniversary}
        </text>

        {/* Theme tag display */}
        <rect x="180" y="390" width="140" height="22" rx="11" fill="#1b1722" stroke="#fb7185" strokeWidth="0.5" opacity="0.6" />
        <text x="250" y="404" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#fda4af" textAnchor="middle" letterSpacing="1">
          BOND: {theme.toUpperCase()}
        </text>

        <text x="250" y="445" fontFamily="Inter, sans-serif" fontSize="8" fill="#57534e" textAnchor="middle" letterSpacing="1">
          AMOUR SECURE VISUALIZATION VAULT
        </text>
      </svg>
    );
  };

  const getSourceUrl = (image: BondImage) => {
    if (image.url === 'fallback') {
      // Return beautiful dataURI generated from our customized SVG fallback handler!
      const cleanP1 = state.partner1;
      const cleanP2 = state.partner2;
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500" style="background-color:#0d0c11;">
          <defs>
            <radialGradient id="grad-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#0d0c11" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fda4af" />
              <stop offset="50%" stop-color="#fb7185" />
              <stop offset="100%" stop-color="#f59e0b" />
            </linearGradient>
            <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#301f2f" />
              <stop offset="50%" stop-color="#fda4af" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#301f2f" />
            </linearGradient>
          </defs>
          <circle cx="250" cy="230" r="180" fill="url(#grad-glow)" />
          <line x1="100" y1="250" x2="400" y2="250" stroke="url(#grad-line)" stroke-width="1" />
          <line x1="250" y1="100" x2="250" y2="355" stroke="url(#grad-line)" stroke-width="1" />
          <circle cx="250" cy="250" r="120" stroke="#fb7185" stroke-width="0.5" stroke-dasharray="3,6" fill="none" opacity="0.3" />
          <circle cx="250" cy="250" r="140" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="4,8" fill="none" opacity="0.2" />
          
          <circle cx="160" cy="180" r="2.5" fill="#fff" opacity="0.7" />
          <circle cx="340" cy="180" r="2.5" fill="#fff" opacity="0.7" />
          <circle cx="200" cy="140" r="1" fill="#fda4af" opacity="0.5" />
          <circle cx="300" cy="140" r="1" fill="#fb7185" opacity="0.5" />
          
          <g transform="translate(195, 190) scale(0.9)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#grad-gold)" opacity="0.75" />
          </g>
          <g transform="translate(245, 205) scale(0.9)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#f59e0b" opacity="0.6" />
          </g>
          <line x1="210" y1="210" x2="295" y2="225" stroke="#fff" stroke-width="1" stroke-dasharray="2,3" opacity="0.4" />
          <text x="250" y="340" font-family="Playfair Display, Georgia, serif" font-size="23" font-weight="600" fill="#ffffff" text-anchor="middle" letter-spacing="1">
            ${cleanP1} &amp; ${cleanP2}
          </text>
          <text x="250" y="365" font-family="Inter, sans-serif" font-size="10.5" fill="#a8a29e" text-anchor="middle" letter-spacing="2">
            ${state.relationshipDate ? new Date(state.relationshipDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : "Our Anniversary"}
          </text>
          
          <rect x="180" y="390" width="140" height="22" rx="11" fill="#1b1722" stroke="#fb7185" stroke-width="0.5" opacity="0.6" />
          <text x="250" y="404" font-family="JetBrains Mono, monospace" font-size="9" fill="#fda4af" text-anchor="middle" letter-spacing="1">
            BOND: ${image.theme.toUpperCase()}
          </text>
        </svg>
      `;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
    }
    return image.url;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Visualizer Control Console (Left side) */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Camera className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bond Visualizer Workroom</h3>
              <p className="text-[10px] text-stone-400">Generate digital portraits mapping your spirit connection.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Direct Theme presets list */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block">
                Visual Art Direction
              </label>
              <div className="grid grid-cols-1 gap-2">
                {VISUAL_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    id={`art-theme-${theme.name.replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(theme.name);
                    }}
                    className={`text-left p-3 rounded-xl border transition text-xs relative overflow-hidden flex flex-col cursor-pointer ${
                      selectedTheme === theme.name
                        ? 'bg-gradient-to-tr from-rose-500/10 to-amber-500/10 border-rose-500/30 text-white'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-stone-400'
                    }`}
                  >
                    <span className="font-semibold block">{theme.name}</span>
                    <span className="text-[10px] text-stone-500 font-normal line-clamp-1 mt-0.5">{theme.prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Scene Override prompt */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block">
                  Custom Scene override (optional)
                </label>
                <span className="text-[9px] text-stone-500 font-mono">Bypasses Art Presets</span>
              </div>
              <textarea
                id="textarea-custom-scene"
                rows={3}
                placeholder="E.g., Two silhouettes under an umbrella in a starry purple cityscape rain, neon glowing drops..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-[#100e13]/80 border border-white/5 rounded-2xl p-3 text-xs text-white placeholder-stone-600 focus:border-rose-500/35 focus:outline-none transition resize-none leading-relaxed"
              />
            </div>

            <button
              id="btn-trigger-bond-render"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 active:scale-[0.98] text-xs font-semibold text-white shadow-lg shadow-rose-500/10 transition duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Weaving Visual Bond Painting...' : 'Visualize Our Relationship Bond'}</span>
            </button>
          </div>
        </div>

        {/* Security / Decrypted Cache Info banner */}
        <div className="bg-[#18151e]/50 border border-white/5 rounded-2xl p-4 text-[10.5px] leading-relaxed text-stone-400 flex items-start space-x-2.5">
          <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 fill-rose-500/20" />
          <span>
            <strong>Encrypted Visual Locker:</strong> Decoded images are held transiently in local storage sandbox inside your encrypted vault. Absolute protection against metadata trace leaks.
          </span>
        </div>
      </div>

      {/* Workspace Display Portrait (Right side) */}
      <div className="lg:col-span-7 space-y-6">
        {isGenerating ? (
          /* Active Gen Loading Stage */
          <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-8 h-[480px] flex flex-col items-center justify-center text-center shadow-xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="w-16 h-16 rounded-full border-t-2 border-r-2 border-rose-500 flex items-center justify-center mb-6"
            >
              <Heart className="w-6 h-6 text-rose-500 animate-pulse fill-rose-500/10" />
            </motion.div>
            <h4 className="text-sm font-semibold text-white font-serif mb-2">Weaving Cosmic Love Vectors...</h4>
            <div className="max-w-xs space-y-2 text-xs text-stone-400 leading-relaxed font-mono">
              <p className="animate-pulse delay-75">1. Translating emotional bond scores into visual geometry...</p>
              <p className="animate-pulse delay-150 text-[10px] text-stone-500">2. Requesting Imagen rendering canvas...</p>
              <p className="animate-pulse delay-300 text-[10px] text-amber-500">3. Securing image raw packets in browser memory...</p>
            </div>
          </div>
        ) : state.bondImages.length === 0 ? (
          /* Empty visual history display screen */
          <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-8 h-[480px] flex flex-col items-center justify-center text-center shadow-xl">
            <ImageIcon className="w-12 h-12 text-stone-700 mb-3" />
            <h4 className="text-base font-serif font-medium text-white mb-2">No Visual Portraits Recorded</h4>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed mb-4">
              Your relationship doesn&apos;t have any digital portraits generated yet. Trigger a visualization below to map your connection scores into a beautiful customized drawing.
            </p>
            {/* Interactive Fallback preview display */}
            <div className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden border border-white/5 opacity-40 shadow-inner">
              {renderFallbackVector(state.partner1, state.partner2, "Aura Preview")}
            </div>
            <span className="text-[9px] text-stone-600 font-mono mt-2 uppercase tracking-widest">Aura Preview Capsule</span>
          </div>
        ) : (
          /* Visual Bond rendering screen with History */
          <div className="space-y-5">
            {/* Spotlight Showcase Portrait card */}
            <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="aspect-square w-full max-w-[480px] mx-auto bg-stone-950 relative border-b border-white/5 flex items-center justify-center">
                {(() => {
                  const spotlight = activeImage || state.bondImages[0];
                  return spotlight.url === 'fallback' ? (
                    renderFallbackVector(state.partner1, state.partner2, spotlight.theme)
                  ) : (
                    <img
                      src={spotlight.url}
                      alt={spotlight.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  );
                })()}

                {/* Info Overlay Panel */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest block mb-0.5">
                      {activeImage ? activeImage.theme : state.bondImages[0].theme}
                    </span>
                    <p className="text-xs text-stone-200 line-clamp-1 max-w-[280px]">
                      {activeImage ? activeImage.prompt : state.bondImages[0].prompt}
                    </p>
                    <span className="text-[9px] text-stone-500 font-mono mt-1 block">
                      Generated: {new Date(activeImage ? activeImage.timestamp : state.bondImages[0].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex space-x-1.5">
                    <button
                      id="btn-delete-spotlight"
                      onClick={() => onDeleteImage(activeImage ? activeImage.id : state.bondImages[0].id)}
                      className="p-2 bg-stone-900/40 hover:bg-rose-950/40 border border-white/5 rounded-xl text-stone-400 hover:text-rose-400 transition"
                      title="Delete visualization"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      id="btn-download-spotlight"
                      href={getSourceUrl(activeImage || state.bondImages[0])}
                      download={`amour_relationship_bond-${selectedTheme.replace(/\s+/g, '_')}.png`}
                      className="p-2 bg-stone-900/40 hover:bg-white/5 border border-white/5 rounded-xl text-stone-400 hover:text-white transition flex items-center justify-center"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation Carousel */}
            <div>
              <h5 className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">
                Digital Connection History Portfolio ({state.bondImages.length})
              </h5>
              <div className="grid grid-cols-4 gap-3">
                {state.bondImages.map((img) => (
                  <button
                    key={img.id}
                    id={`thumb-btn-${img.id}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border relative bg-stone-900 transition ${
                      (activeImage?.id === img.id || (!activeImage && state.bondImages[0].id === img.id))
                        ? 'border-rose-500 ring-2 ring-rose-500/10 scale-[1.02]'
                        : 'border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {img.url === 'fallback' ? (
                      renderFallbackVector(state.partner1, state.partner2, img.theme)
                    ) : (
                      <img src={img.url} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white rounded px-1 max-w-[100%] line-clamp-1 truncate select-none">
                      {img.theme}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
