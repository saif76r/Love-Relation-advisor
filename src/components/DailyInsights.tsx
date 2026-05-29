/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, MessageSquare, Flame, Sparkles, BookOpen, AlertCircle, RefreshCcw, Smile, CheckSquare, Compass, Gift } from 'lucide-react';
import { RelationshipState } from '../types';

interface DailyInsightsProps {
  state: RelationshipState;
  onRefreshInsights: () => Promise<void>;
  isRefreshing: boolean;
}

export default function DailyInsights({ state, onRefreshInsights, isRefreshing }: DailyInsightsProps) {
  const insights = state.insights;
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Simple progress ring helper
  const renderProgressIndicator = (title: string, val: number, color: string, icon: React.ReactNode) => {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 text-center relative overflow-hidden flex flex-col items-center">
        <div className={`w-10 h-10 ${color} bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-3 shadow`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">
          {title}
        </span>
        <div className="text-2xl font-serif font-bold text-white mb-2">
          {val}%
        </div>
        {/* Simple inline progress bar */}
        <div className="w-full bg-[#1c1a22] h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${val}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Control Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#110f14]/80 border border-white/5 rounded-3xl gap-4">
        <div>
          <h2 className="text-lg font-serif font-semibold text-white mb-1">
            {state.userMode === 'single' ? 'Crush Manifestation & Confession Companion' : 'Relationship Health & Core Insights'}
          </h2>
          <p className="text-[11px] text-stone-400 max-w-xl font-sans">
            {state.userMode === 'single'
              ? 'Amour analyzes your secure, private crush diaries and advice chats to design interactive icebreakers, romantic confession scripts, and mindset guidance.'
              : 'Amour analyzes your secure, client-decrypted conversational threads and personal relationship diary entries to construct customized communication analytics and supportive conflict mitigation frameworks.'}
          </p>
        </div>

        <button
          id="btn-recompute-insights"
          disabled={isRefreshing}
          onClick={onRefreshInsights}
          className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-semibold text-xs text-white shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Mapping Core Insights...' : (state.userMode === 'single' ? 'Recompute Confession Strategy' : 'Recompute Relationship Insights')}</span>
        </button>
      </div>

      {insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Metrics Displays (Left Column) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {renderProgressIndicator(
                state.userMode === 'single' ? 'Closeness Resonance' : 'Bond Strength',
                insights.bondStrength,
                'text-rose-400',
                <Heart className="w-5 h-5 text-rose-450 fill-rose-500/10" />
              )}
              {renderProgressIndicator(
                state.userMode === 'single' ? 'Confession Vibe Level' : 'Communication Alignment',
                insights.communicationScore,
                'text-amber-400',
                <MessageSquare className="w-5 h-5" />
              )}
              {renderProgressIndicator(
                state.userMode === 'single' ? 'Mutual Attraction Vibe' : 'Emotional Resonance',
                insights.emotionalAlignment,
                'text-emerald-400',
                <Flame className="w-5 h-5" />
              )}
            </div>

            {/* Recurrent Themes block */}
            <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center space-x-2.5 mb-4">
                <Smile className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                  {state.userMode === 'single' ? 'Interaction Vibe Highlights' : 'Relationship Positives'}
                </h4>
              </div>
              <div className="space-y-2">
                {insights.recentThemes.map((theme, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-white/[0.02] border border-white/5 p-3 rounded-xl transition">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-stone-300 font-semibold font-mono tracking-wide">{theme}</span>
                  </div>
                ))}
              </div>
              <span className="text-[9.5px] text-stone-500 font-mono mt-4 block text-center font-mono uppercase tracking-widest leading-none select-none">Client Sealed Variables</span>
            </div>
          </div>

          {/* Core Advice Letter & Conflict Resolution Strategies (Right Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Daily Affirmation Card */}
            <div className="bg-gradient-to-tr from-rose-950/20 to-amber-950/20 border border-rose-500/15 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-rose-500/10">
                <Sparkles className="w-16 h-16" />
              </div>
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest block mb-1.5 font-mono">
                {state.userMode === 'single' ? 'Daily Manifestation Affirmation' : 'Our Relationship Affirmation'}
              </span>
              <p className="font-serif italic text-base font-medium text-stone-100 leading-relaxed max-w-xl text-stone-200">
                &ldquo;{insights.dailyAffirmation}&rdquo;
              </p>
            </div>

            {/* AI Counselor Letter */}
            <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-white/[0.04] pb-3">
                <BookOpen className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-semibold tracking-tight text-white font-serif">
                  {state.userMode === 'single' ? 'Amour Confidential Guide Letter' : 'Relationship Consultation Letter'}
                </h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-line font-serif italic text-stone-200">
                {insights.keyAdvice}
              </p>
            </div>

            {/* Dynamic Conflict Resolution Bento Panel (Couples Only) */}
            {state.userMode !== 'single' && insights.conflictStrategies && insights.conflictStrategies.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                  Active Conflict Resolution Strategies ({insights.conflictStrategies.length})
                </h4>
                
                {insights.conflictStrategies.map((strategy, index) => (
                  <div key={index} className="bg-[#110f14]/80 border border-white/5 rounded-3xl overflow-hidden p-6 shadow-xl space-y-5">
                    
                    {/* Resolution Header */}
                    <div className="flex items-start space-x-3.5 border-b border-white/[0.04] pb-4">
                      <div className="w-9 h-9 bg-rose-500/15 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9.5px] text-rose-400 font-mono tracking-widest uppercase block mb-0.5">Disagreements Resolving Strategy</span>
                        <h4 className="text-sm font-semibold text-white leading-snug">{strategy.issueDescription}</h4>
                      </div>
                    </div>

                    {/* Empathetic Balance Card */}
                    <div className="bg-[#18161d] border border-white/5 rounded-2xl p-4.5 space-y-3">
                      <p className="text-[11px] text-stone-300 leading-relaxed font-serif italic">
                        {strategy.empatheticAnalysis}
                      </p>
                      
                      {/* Double perspective mapping (The ultimate relationship helper!) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/[0.03] pt-3.5">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-amber-300 uppercase block tracking-wider">
                            {state.partner1}&apos;s Perspective
                          </span>
                          <p className="text-[11px] text-stone-400 leading-relaxed">
                            {strategy.partner1Perspective}
                          </p>
                        </div>
                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/[0.04] pt-3 md:pt-0 md:pl-4">
                          <span className="text-[9px] font-bold text-rose-300 uppercase block tracking-wider">
                            {state.partner2}&apos;s Perspective
                          </span>
                          <p className="text-[11px] text-stone-400 leading-relaxed">
                            {strategy.partner2Perspective}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Checklists bento grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tonight's Actionables */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider">
                            Tonight&apos;s Actions Checklist
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {strategy.actionableSteps.map((step, idx) => (
                            <li key={idx} className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-xs text-stone-300 leading-relaxed flex items-start space-x-2">
                              <span className="text-emerald-500 font-mono shrink-0 select-none">✓</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gentle Communication Tips */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider">
                            Gentle Communication Actions
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {strategy.communicationTips.map((tip, idx) => (
                            <li key={idx} className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-xs text-stone-300 leading-relaxed flex items-start space-x-2">
                              <span className="text-amber-500 shrink-0 font-mono select-none">✦</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Dynamic Confession Blueprints Bento Panel (Singles Only) */}
            {state.userMode === 'single' && insights.confessionStrategies && insights.confessionStrategies.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block font-mono">
                  Tailored Confession Blueprints ({insights.confessionStrategies.length})
                </h4>

                {insights.confessionStrategies.map((strategy, index) => (
                  <div key={index} className="bg-[#110f14]/80 border border-white/5 rounded-3xl overflow-hidden p-6 shadow-xl space-y-5 animate-fade-in">
                    
                    {/* Resolution Header */}
                    <div className="flex items-start space-x-3.5 border-b border-white/[0.04] pb-4">
                      <div className="w-9 h-9 bg-amber-500/15 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9.5px] text-amber-400 font-mono tracking-widest uppercase block mb-0.5">The Confession Proposition</span>
                        <h4 className="text-sm font-semibold text-white leading-snug">Approaching {strategy.targetCrush || state.partner2}</h4>
                      </div>
                    </div>

                    {/* Vibe Profile Card block */}
                    <div className="bg-[#18161d] border border-white/5 rounded-2xl p-4.5 space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.03]">
                        <span className="text-[10px] text-rose-450 font-mono">ESTIMATED CRUSH PERSONALITY:</span>
                        <span className="text-xs font-bold text-white bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg">
                          ✨ {strategy.crushPersonality || 'Sweet & Dreamy'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-mono block mb-1">RECOMMENDED CONFESSION SCENARIO:</span>
                        <p className="text-xs text-stone-300 leading-relaxed font-serif text-stone-200">
                          {strategy.confessionIdea}
                        </p>
                      </div>
                    </div>

                    {/* Checklists bento grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Copy Paste Message Ideas */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Compass className="w-4 h-4 text-rose-405 animate-pulse" />
                          <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider block font-mono">
                            Tailored Confession Text Suggestions
                          </span>
                        </div>
                        <div className="space-y-2">
                          {strategy.exactMessageSubstances.map((msg, idx) => {
                            const uniqueId = `confess-${index}-${idx}`;
                            const isCopied = copiedText === uniqueId;
                            return (
                              <div key={idx} className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl relative group hover:border-pink-500/20 transition duration-150">
                                <p className="text-xs text-stone-300 italic font-serif leading-relaxed pr-8 text-stone-200">
                                  {msg}
                                </p>
                                <button
                                  id={`copy-btn-${uniqueId}`}
                                  onClick={() => handleCopy(msg, uniqueId)}
                                  className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-white/[0.02] hover:bg-white/[0.08] active:scale-90 border border-white/5 transition cursor-pointer"
                                  title="Copy confession suggestion to clipboard"
                                >
                                  {isCopied ? (
                                    <span className="text-[8.5px] font-bold text-emerald-400">Copied!</span>
                                  ) : (
                                    <span className="text-[8.5px] font-medium text-stone-400 group-hover:text-stone-200">Copy</span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mindset tips */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-white block font-mono">
                            Mindset & Managing Nerves
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {strategy.mindsetTips.map((tip, idx) => (
                            <li key={idx} className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-xs text-stone-300 leading-relaxed flex items-start space-x-2 hover:bg-white/[0.02] transition">
                              <span className="text-emerald-500 font-mono shrink-0 select-none">✦</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Empty insights onboarding card */
        <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-14 h-14 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-md"
          >
            <Heart className="w-6 h-6 text-white fill-white/10" />
          </motion.div>
          <div className="space-y-2 text-center">
            <h3 className="text-base font-serif font-medium text-white">
              {state.userMode === 'single' ? 'Generate Your Crush Confession Blueprint' : 'Unlock Relationship Daily Insights'}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto font-sans">
              {state.userMode === 'single'
                ? 'Ready to make your confession outline? Amour processes your private crush diary files and secure advises to draft customized icebreakers, text messages, and confidence-building advice letters.'
                : 'Ready to construct empathetic relationship guidelines? Amour compiles your local chat thread logs and mood diaries to outline actionable advice, communication scores, and stress check-ins.'}
            </p>
          </div>
          <button
            id="btn-trigger-insights-gen"
            onClick={onRefreshInsights}
            disabled={isRefreshing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-bold text-xs text-white transition active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-rose-500/10"
          >
            {isRefreshing ? 'Analyzing Diaries...' : (state.userMode === 'single' ? 'Generate My Confession Strategy' : 'Analyze My Relationship Data')}
          </button>
        </div>
      )}
    </div>
  );
}
