/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw, Command, Heart, HelpCircle, ShieldAlert } from 'lucide-react';
import { ChatMessage, RelationshipState } from '../types';

interface ChatWindowProps {
  state: RelationshipState;
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  onClearHistory: () => void;
}

export default function ChatWindow({ state, onSendMessage, isSending, onClearHistory }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    
    onSendMessage(inputText);
    setInputText('');
  };

  // Simple custom renderer for markdown bullet lists & bold markers to ensure beautiful look
  const formatMsgText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Check for bullet lists
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const cleanContent = line.replace(/^[\s*-]+/, '').trim();
        return (
          <li key={idx} className="ml-5 my-1.5 list-disc text-stone-200">
            {parseBold(cleanContent)}
          </li>
        );
      }
      
      // Check for headers
      if (line.trim().startsWith('###')) {
         return <h4 key={idx} className="text-sm font-semibold text-white mt-3 mb-1.5 font-serif">{line.replace('###', '').trim()}</h4>;
      }
      if (line.trim().startsWith('##')) {
         return <h3 key={idx} className="text-base font-semibold text-amber-200 mt-4 mb-2 font-serif">{line.replace('##', '').trim()}</h3>;
      }

      return (
        <p key={idx} className="my-1.5 leading-relaxed text-stone-300 text-sm">
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[650px] bg-[#110f14]/80 border border-white/5 rounded-3xl overflow-hidden relative shadow-xl backdrop-blur-md">
      {/* Encryption Banner Status */}
      <div className="bg-[#18151e] border-b border-white/5 py-3.5 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500" />
            <div className="w-9 h-9 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-semibold text-white">Amour AI Advisor</h2>
              <span className="text-[9px] bg-rose-500/15 text-rose-300 font-mono px-1.5 py-0.5 rounded-full border border-rose-500/20">
                SSL + TLS Encrypted
              </span>
            </div>
            <p className="text-[10px] text-stone-400 flex items-center">
              <span className="mr-1">Interactive consultation for</span>
              <span className="font-medium text-amber-200">{state.partner1} & {state.partner2}</span>
            </p>
          </div>
        </div>

        <button
          id="btn-clear-chat"
          onClick={() => {
            if (confirm("Are you sure you want to clear the advisor conversation logs? Decrypted chat logs will be removed permanently.")) {
              onClearHistory();
            }
          }}
          className="text-xs text-stone-500 hover:text-stone-300 transition duration-150 flex items-center space-x-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {state.chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-10 h-10 text-stone-600 mb-2.5" />
            <p className="text-sm text-stone-400 font-serif italic">Your advisor conversation is entirely clear.</p>
            <p className="text-[11px] text-stone-500 max-w-xs mt-1">
              Select an option below or type your daily issue to initiate a private consultation capsule with Amour.
            </p>
          </div>
        ) : (
          state.chatHistory.map((message) => {
            const isBot = message.sender === 'bot';
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm relative shadow-md ${
                    isBot
                      ? 'bg-[#18151e] border border-white/5 rounded-tl-sm text-stone-300'
                      : 'bg-gradient-to-tr from-rose-500/10 to-amber-500/10 border border-rose-500/20 rounded-tr-sm text-white'
                  }`}
                >
                  {/* Sender title identifier */}
                  <div className="flex items-center space-x-1.5 mb-1.5 text-[10px] uppercase tracking-wider font-semibold">
                    {isBot ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        <span className="text-rose-400">Amour Adviser</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" />
                        <span className="text-amber-400">Our Capsule</span>
                      </>
                    )}
                    <span className="text-stone-500">•</span>
                    <span className="font-mono text-stone-600 font-normal">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="whitespace-pre-line leading-relaxed">
                    {isBot ? formatMsgText(message.text) : <p>{message.text}</p>}
                  </div>

                  {/* Vault security note for Model answers */}
                  {isBot && (
                    <div className="mt-3.5 pt-2 border-t border-white/[0.03] text-[9.5px] text-stone-500 font-mono flex items-center justify-between">
                      <span>Zero-Knowledge Decrypted</span>
                      <ShieldAlert className="w-3.5 h-3.5 text-stone-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[#18151e] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-stone-400 max-w-[280px]">
              <div className="flex items-center space-x-1.5 mb-2 text-[10px] uppercase tracking-wider font-semibold text-rose-400">
                <Sparkles className="w-3 h-3 text-rose-400 animate-spin" />
                <span>Consulting Amour...</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-stone-500">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-300" />
                </div>
                <span className="italic font-mono text-[10px]">Encrypting secure advising tunnel...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Form Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#18151e] border-t border-white/5 flex items-center space-x-3">
        <input
          id="chat-input-text"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Write your daily challenge here...`}
          disabled={isSending}
          className="flex-1 bg-[#100e13]/80 border border-white/5 rounded-2xl py-3 px-4.5 text-sm text-white placeholder-stone-600 focus:border-rose-500/40 focus:outline-none transition"
        />
        <button
          id="btn-chat-submit"
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="w-11 h-11 bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 rounded-2xl flex items-center justify-center transition shadow-lg shadow-rose-500/5 active:scale-95 text-white disabled:opacity-40 shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
