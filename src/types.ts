/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface BondImage {
  id: string;
  url: string; // data URL or base64
  prompt: string;
  theme: string;
  timestamp: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string; // e.g., 'joyful', 'neutral', 'anxious', 'loving', 'tense'
  timestamp: string;
}

export interface ConflictResolutionStrategy {
  issueDescription: string;
  empatheticAnalysis: string;
  partner1Perspective: string;
  partner2Perspective: string;
  actionableSteps: string[];
  communicationTips: string[];
}

export interface ConfessionStrategy {
  targetCrush: string;
  crushPersonality: string;
  confessionIdea: string;
  exactMessageSubstances: string[];
  mindsetTips: string[];
}

export interface RelationshipInsights {
  bondStrength: number; // 0 to 100
  communicationScore: number; // 0 to 100
  emotionalAlignment: number; // 0 to 100
  dailyAffirmation: string;
  keyAdvice: string;
  recentThemes: string[];
  conflictStrategies: ConflictResolutionStrategy[];
  confessionStrategies?: ConfessionStrategy[]; // Custom for SingleMode
}

export interface EncryptedVaultData {
  ciphertext: string;
  iv: string;
}

export interface RelationshipState {
  hasSetup: boolean;
  userMode?: 'couple' | 'single'; // 'couple' or 'single'
  partner1: string;
  partner2: string; // Represents 'partner' in couples mode, and 'crush' in singles mode
  relationshipDate: string; // Anniversary date or first crush date
  passcodeHash: string; // SHA-256 hex string of passcode
  salt: string; // hex string salt used for hashing/encryption
  username?: string; // Username for multi-user account login system
  chatHistory: ChatMessage[];
  bondImages: BondImage[];
  diaryEntries: DiaryEntry[];
  insights: RelationshipInsights | null;
}
