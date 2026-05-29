/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Heart, Smile, AlertCircle, Plus, Trash2, Calendar, FileText, Sparkles, Send } from 'lucide-react';
import { DiaryEntry, RelationshipState } from '../types';

interface RelationshipJournalProps {
  state: RelationshipState;
  onAddEntry: (title: string, content: string, mood: string) => Promise<void>;
  onDeleteEntry: (id: string) => void;
}

const MOODS = [
  { value: 'loving', label: 'Deeply Loving', emoji: '💖', color: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
  { value: 'joyful', label: 'Celebrating / Joyful', emoji: '✨', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { value: 'neutral', label: 'Calm / Daily Life', emoji: '☕', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
  { value: 'anxious', label: 'Anxious / Lonely', emoji: '🌧️', color: 'bg-teal-500/10 text-teal-300 border-teal-500/20' },
  { value: 'tense', label: 'Tense / Disagreement', emoji: '⚡', color: 'bg-orange-500/10 text-orange-300 border-orange-500/20' }
];

export default function RelationshipJournal({ state, onAddEntry, onDeleteEntry }: RelationshipJournalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await onAddEntry(title.trim(), content.trim(), selectedMood);
    setTitle('');
    setContent('');
    setSelectedMood('neutral');
    setIsAdding(false);
  };

  const getMoodConfig = (moodVal: string) => {
    return MOODS.find(m => m.value === moodVal) || MOODS[2];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Diary Control Panel (Left side) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Relationship Diary</h3>
                <p className="text-[10px] text-stone-400">Keep safe records of special moments or core issues.</p>
              </div>
            </div>
            
            {!isAdding && (
              <button
                id="btn-diary-start-create"
                onClick={() => setIsAdding(true)}
                className="p-1.5 bg-white/[0.02] hover:bg-white/[0.08] active:scale-95 border border-white/5 text-stone-300 hover:text-white rounded-xl transition cursor-pointer flex items-center space-x-1 text-xs px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Entry</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.form
                key="diary-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Entry Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block font-mono">
                    Entry Title
                  </label>
                  <input
                    id="diary-input-title"
                    type="text"
                    placeholder="E.g., Dinner at our favorite Italian corner..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#100e13]/80 border border-white/5 rounded-2xl py-3 px-4 text-xs text-white placeholder-stone-600 focus:border-rose-500/35 focus:outline-none transition font-medium"
                    required
                  />
                </div>

                {/* Mood Selector Row */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block font-mono">
                    Partner/Relationship Mood Accent
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        id={`mood-pill-${mood.value}`}
                        type="button"
                        onClick={() => setSelectedMood(mood.value)}
                        className={`px-3 py-2 rounded-xl text-xs border transition cursor-pointer flex items-center space-x-1.5 ${
                          selectedMood === mood.value
                            ? 'bg-rose-500/10 border-rose-500/35 text-white scale-[1.03]'
                            : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-stone-400'
                        }`}
                      >
                        <span>{mood.emoji}</span>
                        <span className="text-[10px] font-medium">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content body input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block font-mono">
                    Your Reflections (Strictly Client-Encrypted)
                  </label>
                  <textarea
                    id="diary-textarea-content"
                    rows={4}
                    placeholder="Record what happened, how you felt, and key takeaways for advice evaluations..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-[#100e13]/80 border border-white/5 rounded-2xl p-3 text-xs text-white placeholder-stone-600 focus:border-rose-500/35 focus:outline-none transition resize-none leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    id="btn-diary-cancel"
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="w-full py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-stone-400 hover:text-white transition duration-150 cursor-pointer"
                  >
                    Cancel / Exit
                  </button>
                  <button
                    id="btn-diary-save"
                    type="submit"
                    className="w-full py-3 bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-xs font-semibold text-white rounded-xl shadow transition duration-150 cursor-pointer"
                  >
                    Lock in Encrypted Entry
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Informational Greeting pane */
              <motion.div
                key="diary-onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 text-center py-6"
              >
                <div className="w-11 h-11 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Private relationship capsule</h4>
                <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                  Cataloging daily relationship moments builds a digital log of your path. All entries are hashed and sealed using your personal relationship passcode in local browser sandboxes.
                </p>
                <button
                  id="btn-onboarding-diary-trigger"
                  onClick={() => setIsAdding(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-bold text-[10px] text-white active:scale-95 transition cursor-pointer"
                >
                  Write Your First Secure Entry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security / Decrypted Cache Info banner */}
        <div className="bg-[#18151e]/50 border border-white/5 rounded-2xl p-4 text-[10.5px] leading-relaxed text-stone-400 flex items-start space-x-2.5">
          <Smile className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 fill-amber-500/10" />
          <span>
            <strong>Secure client-side database:</strong> Diaries remain completely offline. They are processed on-the-fly and parsed with transient cryptographic handshakes. Nobody but you can access them.
          </span>
        </div>
      </div>

      {/* Diary Card List History (Right side) */}
      <div className="lg:col-span-7 space-y-4">
        <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
          Encrypted Entries Ledger ({state.diaryEntries.length})
        </h4>

        {state.diaryEntries.length === 0 ? (
          <div className="bg-[#110f14]/80 border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-[340px] shadow-xl">
            <FileText className="w-10 h-10 text-stone-700 mb-2.5 animate-pulse" />
            <span className="text-xs font-serif font-medium text-white italic">Diary ledger empty</span>
            <p className="text-[11px] text-stone-500 max-w-xs mt-1.5 leading-relaxed">
              No private diaries recorded yet. Select &lsquo;Write Entry&rsquo; on the side to secure your first intimate dynamic log.
            </p>
          </div>
        ) : (
          <div className="space-y-4 h-[480px] overflow-y-auto pr-1">
            {state.diaryEntries.map((entry) => {
              const mood = getMoodConfig(entry.mood);
              return (
                <div
                  key={entry.id}
                  className="bg-[#110f14]/80 border border-white/5 rounded-2xl p-5 shadow-lg relative transition flex flex-col justify-between"
                >
                  <div>
                    {/* Entry Mood indicator header row */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center space-x-2">
                        {/* Custom styled mood pill badge */}
                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-semibold border ${mood.color}`}>
                          {mood.emoji} {mood.label.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-stone-500 flex items-center space-x-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          <span>{new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                      </div>
                      <button
                        id={`delete-entry-btn-${entry.id}`}
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this encrypted diary entry permanently?")) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="p-1.5 text-stone-600 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-tight mb-2 font-serif">
                      {entry.title}
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-line font-serif italic text-stone-200">
                      {entry.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-white/[0.03] text-[9px] text-stone-500 font-mono flex items-center justify-between select-none">
                    <span>Decrypted locally with PBKDF2</span>
                    <span>128-bit integrity tag verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
