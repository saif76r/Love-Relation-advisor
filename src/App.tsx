/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Image as ImageIcon, 
  CheckCircle,
  LogOut,
  AlertCircle
} from 'lucide-react';

import { RelationshipState, ChatMessage, BondImage, DiaryEntry, RelationshipInsights } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import PasscodeVault from './components/PasscodeVault';
import ChatWindow from './components/ChatWindow';
import DailyInsights from './components/DailyInsights';
import VisualBond from './components/VisualBond';
import RelationshipJournal from './components/RelationshipJournal';

type ActiveView = 'chat' | 'insights' | 'visuals' | 'diary';

// Capacitor / Android dynamic API request router to safely bridge local vs production Cloud Run routes
const getApiUrl = (endpoint: string) => {
  const isWebDev = window.location.port === '3000';
  const isMobile = !isWebDev && (window.location.hostname === 'localhost' || window.location.protocol === 'file:');
  
  if (isMobile) {
    return `https://ais-pre-kuns6p7j73bquz53emo2ip-466821687468.asia-southeast1.run.app${endpoint}`;
  }
  return endpoint;
};

export default function App() {
  const [activeState, setActiveState] = useState<RelationshipState | null>(null);
  const [vaultPasscode, setVaultPasscode] = useState<string>('');
  const [currentView, setCurrentView] = useState<ActiveView>('chat');
  
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Monitor Firebase active user state changes for single-sign on persistence 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setActiveState(null);
        setVaultPasscode('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUnlockVault = (decrypted: RelationshipState, passcode: string) => {
    setActiveState(decrypted);
    setVaultPasscode(passcode);
    setGlobalError(null);
  };

  const handleInitializeVault = (newState: RelationshipState, passcode: string) => {
    setActiveState(newState);
    setVaultPasscode(passcode);
    setGlobalError(null);
  };

  const handleLockVault = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase Sign out failed:", err);
    }
    setActiveState(null);
    setVaultPasscode('');
    setCurrentView('chat');
    setGlobalError(null);
  };

  // 1. Dynamic Advisory Chat Actions
  const handleSendMessage = async (text: string) => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };

    const nextHistory = [...activeState.chatHistory, userMsg];
    setActiveState(prev => prev ? { ...prev, chatHistory: nextHistory } : null);
    setIsSendingChat(true);
    setGlobalError(null);

    // Save user message to Firestore subcollection instantly
    const userMsgPath = `users/${user.uid}/chatHistory/${userMsg.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'chatHistory', userMsg.id), userMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, userMsgPath);
    }

    try {
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: nextHistory,
          partner1: activeState.partner1,
          partner2: activeState.partner2,
          userMode: activeState.userMode
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to receive advice.");
      }

      const resData = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: resData.reply,
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...nextHistory, botMsg];
      setActiveState(prev => prev ? { ...prev, chatHistory: finalHistory } : null);

      // Save bot reply to Firestore
      const botMsgPath = `users/${user.uid}/chatHistory/${botMsg.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'chatHistory', botMsg.id), botMsg);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, botMsgPath);
      }

    } catch (err: any) {
      console.error("Advising chat failed:", err);
      const errBotMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I encountered a configuration challenge securing our AI advising pipeline. Ensure your AI Studio Gemini API key is active.",
        timestamp: new Date().toISOString()
      };

      const errorSavedHistory = [...nextHistory, errBotMsg];
      setActiveState(prev => prev ? { ...prev, chatHistory: errorSavedHistory } : null);

      // Save error message placeholder to Firestore for history coherence
      const errBotPath = `users/${user.uid}/chatHistory/${errBotMsg.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'chatHistory', errBotMsg.id), errBotMsg);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, errBotPath);
      }
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChatHistory = async () => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    setActiveState(prev => prev ? { ...prev, chatHistory: [] } : null);

    try {
      const chatColRef = collection(db, 'users', user.uid, 'chatHistory');
      const snap = await getDocs(chatColRef);
      const batch = writeBatch(db);
      snap.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to empty chats in Firestore:", err);
      setGlobalError("Failed to synchronize cleared chat history. Make sure database rules are loaded.");
    }
  };

  // 2. Relationship Journal Actions
  const handleAddDiaryEntry = async (title: string, content: string, mood: string) => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      title,
      content,
      mood,
      timestamp: new Date().toISOString()
    };

    const nextDiaries = [newEntry, ...activeState.diaryEntries];
    setActiveState(prev => prev ? { ...prev, diaryEntries: nextDiaries } : null);

    // Save to Firestore
    const diaryPath = `users/${user.uid}/diaryEntries/${newEntry.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'diaryEntries', newEntry.id), newEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, diaryPath);
    }
  };

  const handleDeleteDiaryEntry = async (id: string) => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    const nextDiaries = activeState.diaryEntries.filter(entry => entry.id !== id);
    setActiveState(prev => prev ? { ...prev, diaryEntries: nextDiaries } : null);

    // Delete from Firestore
    const diaryPath = `users/${user.uid}/diaryEntries/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'diaryEntries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, diaryPath);
    }
  };

  // 3. Visual Relationship Bonds Generation Actions
  const handleGenerateBondImage = async (prompt: string, theme: string) => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    setIsGeneratingImage(true);
    setGlobalError(null);

    try {
      const response = await fetch(getApiUrl('/api/generate-bond'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          theme,
          partner1: activeState.partner1,
          partner2: activeState.partner2,
          userMode: activeState.userMode
        })
      });

      if (!response.ok) {
        throw new Error("Bond service unavailable.");
      }

      const resData = await response.json();
      
      const newBondObj: BondImage = {
        id: `bond-${Date.now()}`,
        url: resData.imageUrl, // Will be base64 or 'fallback' indicator
        prompt,
        theme,
        timestamp: new Date().toISOString()
      };

      const nextBonds = [newBondObj, ...activeState.bondImages];
      setActiveState(prev => prev ? { ...prev, bondImages: nextBonds } : null);

      // Save bond image reference to Firestore subcollection
      const imgPath = `users/${user.uid}/bondImages/${newBondObj.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'bondImages', newBondObj.id), newBondObj);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, imgPath);
      }

    } catch (err: any) {
      console.error("Bond visualization failed:", err);
      // Fallback SVG image representation
      const fallbackBond: BondImage = {
        id: `bond-fallback-${Date.now()}`,
        url: "fallback",
        prompt,
        theme,
        timestamp: new Date().toISOString()
      };
      
      const nextBonds = [fallbackBond, ...activeState.bondImages];
      setActiveState(prev => prev ? { ...prev, bondImages: nextBonds } : null);

      const imgPath = `users/${user.uid}/bondImages/${fallbackBond.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'bondImages', fallbackBond.id), fallbackBond);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, imgPath);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDeleteBondImage = async (id: string) => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    const nextBonds = activeState.bondImages.filter(img => img.id !== id);
    setActiveState(prev => prev ? { ...prev, bondImages: nextBonds } : null);

    // Delete from Firestore
    const imgPath = `users/${user.uid}/bondImages/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bondImages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, imgPath);
    }
  };

  // 4. Refresh Relationship Health Assessment Indices
  const handleRefreshInsights = async () => {
    const user = auth.currentUser;
    if (!user || !activeState) return;

    setIsRefreshingInsights(true);
    setGlobalError(null);

    try {
      const response = await fetch(getApiUrl('/api/assess'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatHistory: activeState.chatHistory,
          diaryEntries: activeState.diaryEntries,
          partner1: activeState.partner1,
          partner2: activeState.partner2,
          userMode: activeState.userMode
        })
      });

      if (!response.ok) {
        throw new Error("Unable to recompute analytics.");
      }

      const freshInsights: RelationshipInsights = await response.json();
      
      setActiveState(prev => prev ? { ...prev, insights: freshInsights } : null);

      // Save insights to Firestore latest document
      const docPath = `users/${user.uid}/insights/latest`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'insights', 'latest'), freshInsights);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }

    } catch (err: any) {
      console.error("Health analysis calculations failed:", err);
      setGlobalError("Failed to calculate relationship analytics. Make sure Gemini API key is set.");
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  // Counter helper for special days spent together
  const calculateDaysTogether = (anniversaryStr: string) => {
    const anniversary = new Date(anniversaryStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - anniversary.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Guard locked states
  if (!activeState) {
    return (
      <PasscodeVault 
        onUnlock={handleUnlockVault}
        onInitialize={handleInitializeVault}
      />
    );
  }

  const daysSpent = calculateDaysTogether(activeState.relationshipDate);

  return (
    <div className="min-h-screen bg-[#070608] text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Banner Navigation Capsule */}
      <header className="border-b border-white/5 bg-[#0e0c10]/95 backdrop-blur-md sticky top-0 z-55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Group */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white fill-white/10" />
              </div>
              <div>
                <span className="text-[9.5px] uppercase tracking-widest font-mono text-rose-400 block mb-0.5">
                  Private Love Counsel
                </span>
                <h1 className="text-base font-serif font-semibold tracking-tight text-white flex items-center">
                  <span>Amour Adviser</span>
                </h1>
              </div>
            </div>

            {/* Middle Couple Metrics Badge */}
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full select-none">
              <Calendar className="w-4 h-4 text-amber-300" />
              <p className="text-xs text-stone-300">
                {activeState.userMode === 'single' ? (
                  <>
                    Crushing on <span className="font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-300">{activeState.partner2}</span> for <span className="font-mono font-medium">{daysSpent} Days</span>
                  </>
                ) : (
                  <>
                    Celebrating <span className="font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-300">{daysSpent} Days</span> of connection
                  </>
                )}
              </p>
              <span className="text-[10px] text-stone-500 font-mono">({activeState.userMode === 'single' ? 'Single Path' : `${activeState.partner1} & ${activeState.partner2}`})</span>
            </div>

            {/* Logout/Lock Section */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-[10.5px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vault Sync ON</span>
              </div>
              
              <button
                id="btn-lock-vault-system"
                onClick={handleLockVault}
                className="p-2.5 bg-white/[0.02] hover:bg-rose-950/20 hover:text-rose-400 border border-white/5 text-stone-400 rounded-xl transition cursor-pointer"
                title="Log out and secure vault"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Secondary Mobile/Tab Indicators Rows */}
        <div className="md:hidden flex items-center justify-between p-4.5 bg-white/[0.01] border border-white/5 rounded-2xl">
          <div className="flex items-center space-x-1.5 text-xs text-stone-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400 font-mono" />
            <span>
              {activeState.userMode === 'single' ? (
                <>Crushing: <strong>{daysSpent} days</strong></>
              ) : (
                <>Connection: <strong>{daysSpent} days</strong></>
              )}
            </span>
          </div>
          <span className="text-xs text-stone-400 font-medium">({activeState.userMode === 'single' ? `Crush: ${activeState.partner2}` : `${activeState.partner1} & ${activeState.partner2}`})</span>
        </div>

        {/* Global errors handling */}
        {globalError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-300 flex items-start space-x-2.5 max-w-3xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Interface Navigation Tab Rail */}
        <div className="flex justify-start border-b border-white/5 space-x-6 pb-0.5 overflow-x-auto">
          {(
            [
              { id: 'chat', label: activeState.userMode === 'single' ? 'AI Confidence Coach Chat' : 'Empathetic Advisor Chat', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'insights', label: activeState.userMode === 'single' ? 'Confession & Insights' : 'Daily Insights Report', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'visuals', label: activeState.userMode === 'single' ? 'Spiritual Portrait Creator' : 'Bond Portrait Generation', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'diary', label: activeState.userMode === 'single' ? 'Crush Secret Diary' : 'Relationship Secret Diary', icon: <BookOpen className="w-4 h-4" /> },
            ] as const
          ).map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center space-x-2 pb-4 text-sm font-medium transition-all relative shrink-0 cursor-pointer ${
                  isActive 
                    ? 'text-white font-semibold' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBorder"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Viewport */}
        <div className="py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentView === 'chat' && (
                <ChatWindow 
                  state={activeState}
                  onSendMessage={handleSendMessage}
                  isSending={isSendingChat}
                  onClearHistory={handleClearChatHistory}
                />
              )}

              {currentView === 'insights' && (
                <DailyInsights
                  state={activeState}
                  onRefreshInsights={handleRefreshInsights}
                  isRefreshing={isRefreshingInsights}
                />
              )}

              {currentView === 'visuals' && (
                <VisualBond
                  state={activeState}
                  onGenerateImage={handleGenerateBondImage}
                  isGenerating={isGeneratingImage}
                  onDeleteImage={handleDeleteBondImage}
                />
              )}

              {currentView === 'diary' && (
                <RelationshipJournal
                  state={activeState}
                  onAddEntry={handleAddDiaryEntry}
                  onDeleteEntry={handleDeleteDiaryEntry}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer System Credits */}
      <footer className="border-t border-white/5 py-6 bg-[#09080b] mt-auto select-none">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">
            Amour Secure Cloud Ecosystem • Powered by Google Firebase
          </p>
          <p className="text-[9.5px] text-stone-600">
            Real-time, offline-first client-authenticated operations. Standalone Android packaging compilation ready.
          </p>
        </div>
      </footer>
    </div>
  );
}
