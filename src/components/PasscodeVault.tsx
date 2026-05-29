/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Heart, 
  Calendar, 
  Users, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  User, 
  UserPlus, 
  LogIn, 
  Trash2 
} from 'lucide-react';
import { RelationshipState, ChatMessage, DiaryEntry, BondImage, RelationshipInsights } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore';

interface PasscodeVaultProps {
  onUnlock: (state: RelationshipState, passcode: string) => void;
  onInitialize: (state: RelationshipState, passcode: string) => void;
}

export default function PasscodeVault({ onUnlock, onInitialize }: PasscodeVaultProps) {
  // App routing/view inside vault
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login input fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register input fields
  const [userMode, setUserMode] = useState<'couple' | 'single'>('couple');
  const [regUsername, setRegUsername] = useState('');
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [startDate, setStartDate] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  // General state feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassKey, setShowPassKey] = useState(false);

  // Auto-fill last logged in user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('amour_last_username');
    if (savedUser) {
      setLoginUsername(savedUser);
    }
  }, []);

  // Shared routine to pull state out of Firestore subcollections
  const pullRemoteState = async (uid: string, username: string, originalPass: string): Promise<RelationshipState> => {
    const userDocRef = doc(db, 'users', uid);
    let userSnap;
    try {
      userSnap = await getDoc(userDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }

    if (!userSnap || !userSnap.exists()) {
      throw new Error("Your user profile is not configured in Firestore.");
    }

    const userData = userSnap.data();

    // 1. Fetch ChatHistory
    let chatHistory: ChatMessage[] = [];
    try {
      const chatSnap = await getDocs(collection(db, 'users', uid, 'chatHistory'));
      chatHistory = chatSnap.docs.map(doc => doc.data() as ChatMessage);
      // Sort in ascending order of timestamp so threads match chronology
      chatHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/chatHistory`);
    }

    // 2. Fetch Diary entries
    let diaryEntries: DiaryEntry[] = [];
    try {
      const diarySnap = await getDocs(collection(db, 'users', uid, 'diaryEntries'));
      diaryEntries = diarySnap.docs.map(doc => doc.data() as DiaryEntry);
      diaryEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/diaryEntries`);
    }

    // 3. Fetch Bond Images
    let bondImages: BondImage[] = [];
    try {
      const bondSnap = await getDocs(collection(db, 'users', uid, 'bondImages'));
      bondImages = bondSnap.docs.map(doc => doc.data() as BondImage);
      bondImages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/bondImages`);
    }

    // 4. Fetch Insights
    let insights: RelationshipInsights | null = null;
    try {
      const insightsSnap = await getDoc(doc(db, 'users', uid, 'insights', 'latest'));
      if (insightsSnap.exists()) {
        insights = insightsSnap.data() as RelationshipInsights;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}/insights/latest`);
    }

    return {
      hasSetup: true,
      userMode: userData.userMode,
      partner1: userData.partner1,
      partner2: userData.partner2,
      relationshipDate: userData.relationshipDate,
      passcodeHash: '', // Bypassed with live Auth
      salt: '', // Bypassed with live Auth
      username: username,
      chatHistory,
      diaryEntries,
      bondImages,
      insights
    };
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const normUser = loginUsername.trim().toLowerCase();
    if (!normUser) {
      setError('Please enter your username.');
      setIsLoading(false);
      return;
    }

    if (!loginPassword) {
      setError('Please provide your password.');
      setIsLoading(false);
      return;
    }

    try {
      // Map username transparently to valid custom firebase email handles
      const authEmail = `${normUser}@amour.app`;

      // 1. Firebase auth login
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, loginPassword);
      const user = userCredential.user;

      // 2. Pull synchronized data from Firestore collections
      const stateObject = await pullRemoteState(user.uid, normUser, loginPassword);
      
      // Save username state to auto-fill next time
      localStorage.setItem('amour_last_username', normUser);

      // Successfully unlock state
      onUnlock(stateObject, loginPassword);
    } catch (err: any) {
      console.error("Login verification failed:", err);
      let errorMsg = 'Invalid username or password. Please verify and try again.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = `User "${normUser}" was not found. Please click Register to create a secure account.`;
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (err.message && err.message.includes('Firestore Error')) {
        errorMsg = 'Connected to Authentication successfully, but Firestore permission denied. Ensure database rules are active.';
      }
      setLoginPassword('');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const normUser = regUsername.trim().toLowerCase();
    if (!normUser || !/^[a-zA-Z0-9_-]{3,20}$/.test(normUser)) {
      setError('Username must be 3-20 characters, containing only letters, numbers, dashes or underscores.');
      return;
    }

    if (!partner1.trim() || !partner2.trim()) {
      setError(userMode === 'single' ? "Please provide your name and your crush's name." : 'Please provide names for both partners.');
      return;
    }

    if (!startDate) {
      setError(userMode === 'single' ? 'Please specify when you started liking them.' : 'Please select your relationship anniversary date.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const authEmail = `${normUser}@amour.app`;

      // 1. Create client credential in Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, regPassword);
      const user = userCredential.user;

      // 2. Create standard structured settings inside Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userSettingPayload = {
        userId: user.uid,
        username: normUser,
        userMode: userMode,
        partner1: partner1.trim(),
        partner2: partner2.trim(),
        relationshipDate: startDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, userSettingPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
      }

      // 3. Setup initial welcome chatbot message inside Firestore chat subcollection
      const initMsgId = 'init-msg';
      const initMsgPayload: ChatMessage = {
        id: initMsgId,
        sender: 'bot',
        text: userMode === 'single'
          ? `Welcome, ${partner1.trim()}! I am Amour, your private Love Advisor and Confidence Guide. I'm here to support you in navigating your secret feelings for ${partner2.trim()}, building genuine interactive dating confidence, reading signals of interest, and generating fully tailored, creative confession plans or sweet message hints. How is your heart doing today?`
          : `Welcome, ${partner1.trim()} and ${partner2.trim()}! I am Amour, your private Love & Relationship Advisor. I provide conflict resolution guidelines, relationship check-ins, and help you visualize your spiritual connection through customized bond images. How can I help you today?`,
        timestamp: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', user.uid, 'chatHistory', initMsgId), initMsgPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/chatHistory/${initMsgId}`);
      }

      // Assemble full state to initialize interface
      const finalState: RelationshipState = {
        hasSetup: true,
        userMode: userMode,
        partner1: partner1.trim(),
        partner2: partner2.trim(),
        relationshipDate: startDate,
        passcodeHash: '',
        salt: '',
        username: normUser,
        chatHistory: [initMsgPayload],
        diaryEntries: [],
        bondImages: [],
        insights: null
      };

      localStorage.setItem('amour_last_username', normUser);
      setSuccess("Vault successfully created! Logging in...");
      
      setTimeout(() => {
        onInitialize(finalState, regPassword);
      }, 1000);

    } catch (err: any) {
      console.error("Firebase registration failure:", err);
      let errorMsg = 'Failed to create security vault: ' + (err.message || err);
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = `The username "${normUser}" is already taken by another lovely user. Please choose a different handle.`;
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070608] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Soft atmospheric ambient light patterns */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#110f14] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Top Header Logo Banner */}
        <div className="text-center mb-6">
          <motion.div 
            animate={{ scale: [1, 1.03, 1] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-rose-500/10"
          >
            <Heart className="w-6 h-6 text-white fill-white/10" />
          </motion.div>
          
          <h1 className="text-xl font-serif font-semibold tracking-tight text-white mb-1.5">
            {isRegistering ? 'Create Romantic Vault' : 'Welcome to Amour'}
          </h1>
          <p className="text-[11px] text-stone-400 max-w-xs mx-auto leading-relaxed">
            {isRegistering 
              ? 'Configure a cloud synchronized, private advisor vault using Firebase Authentication & secure Firestore rules.' 
              : 'Enter user credentials to synchronize your relationship check-ins, advice capsule, and visual canvases.'}
          </p>
        </div>

        {/* Dynamic Panels */}
        <AnimatePresence mode="wait">
          {!isRegistering ? (
            /* --- LOG IN PANEL --- */
            <motion.div
              key="login-form-panel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <form onSubmit={handleLogin} className="space-y-4.5">
                {/* Username Input Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-username-input"
                      type="text"
                      placeholder="Your login handle"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition font-medium"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password / Passcode Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                    Password / PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password-input"
                      type={showPassKey ? 'text' : 'password'}
                      placeholder="Enter Vault Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-3 pl-10 pr-10 text-sm text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition tracking-wide"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassKey(!showPassKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    >
                      {showPassKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 flex items-start space-x-2.5 text-[10.5px] leading-relaxed text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Firebase Cloud Sync:</strong> All data is synchronized securely with zero telemetry or tracking logs, ensuring security across web and Google Play Android.
                  </span>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-xs text-rose-300 flex items-start space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-300 flex items-start space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-bold text-xs text-white uppercase tracking-wider shadow-lg shadow-rose-500/5 hover:shadow-rose-500/15 active:scale-[0.98] transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40"
                >
                  {isLoading ? (
                    <span>Authenticating secure database...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Authenticate & sync</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between pt-3 text-[10.5px] font-mono border-t border-white/[0.03]">
                <button
                  id="btn-switch-register"
                  onClick={() => {
                    setIsRegistering(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-amber-300/80 hover:text-amber-200 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Free Account</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* --- REGISTER & INITIALIZE PANEL --- */
            <motion.div
              key="register-form-panel"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Relationship Mode Path Selector */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-semibold text-stone-500 uppercase tracking-widest block font-mono">
                    Select Relationship Path
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="mode-reg-couple"
                      type="button"
                      onClick={() => {
                        setUserMode('couple');
                        setError(null);
                      }}
                      className={`p-2.5 rounded-2xl border transition duration-150 cursor-pointer flex flex-col items-center justify-center text-center space-y-0.5 ${
                        userMode === 'couple'
                          ? 'bg-rose-500/10 border-rose-500/35 text-white'
                          : 'bg-white/[0.012]' + ' border-white/5 hover:bg-white/[0.03] text-stone-400'
                      }`}
                    >
                      <span className="text-sm">💖</span>
                      <span className="text-[10px] font-bold">Couple Mode</span>
                    </button>
                    <button
                      id="mode-reg-single"
                      type="button"
                      onClick={() => {
                        setUserMode('single');
                        setError(null);
                      }}
                      className={`p-2.5 rounded-2xl border transition duration-150 cursor-pointer flex flex-col items-center justify-center text-center space-y-0.5 ${
                        userMode === 'single'
                          ? 'bg-amber-500/10 border-amber-500/35 text-white'
                          : 'bg-white/[0.012]' + ' border-white/5 hover:bg-white/[0.03] text-stone-400'
                      }`}
                    >
                      <span className="text-sm">✨</span>
                      <span className="text-[10px] font-bold">Single Mode</span>
                    </button>
                  </div>
                </div>

                {/* Account Username */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-medium text-stone-400 uppercase tracking-wider block">
                    Choose Username Handle
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-username-input"
                      type="text"
                      placeholder="e.g., lovebirds_99"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition font-medium"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Names input grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-medium text-stone-400 uppercase tracking-wider block">
                      {userMode === 'single' ? 'Your Name' : 'Partner 1 Name'}
                    </label>
                    <input
                      id="reg-p1-input"
                      type="text"
                      placeholder="Your name"
                      value={partner1}
                      onChange={(e) => setPartner1(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-medium text-stone-400 uppercase tracking-wider block">
                      {userMode === 'single' ? "Crush's Name" : 'Partner 2 Name'}
                    </label>
                    <input
                      id="reg-p2-input"
                      type="text"
                      placeholder={userMode === 'single' ? "Crush's name" : "Partner's name"}
                      value={partner2}
                      onChange={(e) => setPartner2(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Relationship Date Picker */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-medium text-stone-400 uppercase tracking-wider block">
                    {userMode === 'single' ? 'Date You First Liked Them' : 'Anniversary Date'}
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-startdate-input"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-rose-500/40 focus:outline-none transition [color-scheme:dark]"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password confirmation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-medium text-stone-400 uppercase tracking-wider block">
                      Password (min 6)
                    </label>
                    <input
                      id="reg-password-input"
                      type={showPassKey ? 'text' : 'password'}
                      placeholder="Min 6 keys"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-medium text-stone-400 uppercase tracking-wider block">
                      Confirm Pass
                    </label>
                    <input
                      id="reg-confirm-input"
                      type={showPassKey ? 'text' : 'password'}
                      placeholder="Repeat details"
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      className="w-full bg-white/[0.015] border border-white/5 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder-stone-650 focus:border-rose-500/40 focus:outline-none transition"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end pr-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setShowPassKey(!showPassKey)}
                    className="text-stone-500 hover:text-stone-300 font-mono"
                  >
                    {showPassKey ? 'Hide Passwords' : 'View Passwords'}
                  </button>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-xs text-rose-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-300 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-semibold text-xs text-white uppercase tracking-wider shadow-lg active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating secure vault...' : 'Initialize & Setup Vault'}
                </button>

                <button
                  id="btn-reg-back"
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full text-center text-[10.5px] text-stone-500 hover:text-stone-300 transition block cursor-pointer"
                >
                  Back to authentication login
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
