import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import {
  Activity,
  VocabularyWord,
  UserProfile,
  VocabularyStatus,
  GrammarItem,
  UserGoals,
  CEFRLevel,
} from '../types';
import {
  initialActivities,
  initialVocabulary,
  initialGrammar,
  defaultProfile,
  sampleStarterActivities,
  sampleStarterVocabulary,
} from '../data/initialData';

export type NavigationSection = 'dashboard' | 'cefr' | 'grammar' | 'vocabulary' | 'goals' | 'activities';

interface AppContextType {
  user: User | null;
  userId: string;
  isAuthReady: boolean;
  isSyncing: boolean;
  dbStatus: 'connected' | 'saving' | 'error';
  activities: Activity[];
  vocabulary: VocabularyWord[];
  grammar: GrammarItem[];
  profile: UserProfile;
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  selectedActivityForDetails: Activity | null;
  setSelectedActivityForDetails: (activity: Activity | null) => void;
  selectedActivityForEdit: Activity | null;
  setSelectedActivityForEdit: (activity: Activity | null) => void;
  selectedVocabForEdit: VocabularyWord | null;
  setSelectedVocabForEdit: (vocab: VocabularyWord | null) => void;
  isAddVocabModalOpen: boolean;
  setIsAddVocabModalOpen: (open: boolean) => void;
  isAddGrammarModalOpen: boolean;
  setIsAddGrammarModalOpen: (open: boolean) => void;
  feedbackMessage: string | null;
  setFeedbackMessage: (msg: string | null) => void;

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  addVocabulary: (vocab: Omit<VocabularyWord, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateVocabulary: (id: string, updates: Partial<VocabularyWord>) => Promise<void>;
  toggleVocabularyStatus: (id: string, nextStatus: VocabularyStatus) => Promise<void>;
  deleteVocabulary: (id: string) => Promise<void>;

  addGrammarItem: (item: Omit<GrammarItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateGrammarItem: (id: string, updates: Partial<GrammarItem>) => Promise<void>;
  deleteGrammarItem: (id: string) => Promise<void>;

  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateLevels: (currentLevel: CEFRLevel, targetLevel: CEFRLevel) => Promise<void>;
  updateGoals: (goals: UserGoals) => Promise<void>;
  clearAllData: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  speakWord: (text: string) => void;

  // Computed metrics
  totalMinutes: number;
  totalHoursFormatted: string;
  totalSessions: number;
  completedPercentA2: number;
  todayMinutes: number;
  thisWeekMinutes: number;
  skillMinutesMap: Record<string, number>;
  skillPercentMap: Record<string, number>;
  currentStreakDays: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'saving' | 'error'>('connected');
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(initialVocabulary);
  const [grammar, setGrammar] = useState<GrammarItem[]>(initialGrammar);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<Activity | null>(null);
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState<Activity | null>(null);
  const [selectedVocabForEdit, setSelectedVocabForEdit] = useState<VocabularyWord | null>(null);
  const [isAddVocabModalOpen, setIsAddVocabModalOpen] = useState(false);
  const [isAddGrammarModalOpen, setIsAddGrammarModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Determine active userId
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('project_r_user_id');
      if (saved) return saved;
      localStorage.setItem('project_r_user_id', 'reinan');
      return 'reinan';
    }
    return 'reinan';
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser?.uid) {
        setActiveUserId(currentUser.uid);
        localStorage.setItem('project_r_user_id', currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const userId = user?.uid || activeUserId;

  // Real-time Firestore sync listeners
  useEffect(() => {
    if (!userId) return;

    setIsSyncing(true);
    setDbStatus('saving');

    // 1. Activities collection listener
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const qActivities = query(activitiesRef, orderBy('createdAt', 'desc'));

    const unsubActivities = onSnapshot(
      qActivities,
      (snapshot) => {
        const acts = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Activity, 'id'>) }));
        setActivities(acts);
        setIsSyncing(false);
        setDbStatus('connected');
      },
      (err) => {
        setIsSyncing(false);
        setDbStatus('error');
        console.error('Firestore activities sync error:', err);
      }
    );

    // 2. Vocabulary collection listener
    const vocabRef = collection(db, 'users', userId, 'vocabulary');
    const unsubVocab = onSnapshot(
      vocabRef,
      (snapshot) => {
        const vocabs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VocabularyWord, 'id'>) }));
        setVocabulary(vocabs);
        setDbStatus('connected');
      },
      (err) => {
        console.error('Firestore vocabulary sync error:', err);
      }
    );

    // 3. Grammar collection listener
    const grammarRef = collection(db, 'users', userId, 'grammar');
    const unsubGrammar = onSnapshot(
      grammarRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GrammarItem, 'id'>) }));
        setGrammar(items);
        setDbStatus('connected');
      },
      (err) => {
        console.error('Firestore grammar sync error:', err);
      }
    );

    // 4. User profile listener
    const profileDocRef = doc(db, 'users', userId, 'profile', 'info');
    const unsubProfile = onSnapshot(
      profileDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        }
      },
      (err) => {
        console.error('Firestore profile sync error:', err);
      }
    );

    return () => {
      unsubActivities();
      unsubVocab();
      unsubGrammar();
      unsubProfile();
    };
  }, [userId]);

  // Actions that ALWAYS execute against Firestore
  const addActivity = useCallback(
    async (actData: Omit<Activity, 'id' | 'userId' | 'createdAt'>) => {
      const newId = `act-${Date.now()}`;
      const newActivity: Activity = {
        ...actData,
        id: newId,
        userId,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setActivities((prev) => [newActivity, ...prev]);

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await setDoc(doc(db, 'users', userId, 'activities', newId), newActivity);
        setDbStatus('connected');
        setFeedbackMessage('Sessão gravada no Firestore com sucesso!');
      } catch (err) {
        setDbStatus('error');
        console.error('Error saving activity to Firestore:', err);
        handleFirestoreError(err, OperationType.CREATE, `users/${userId}/activities/${newId}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const updateActivity = useCallback(
    async (id: string, updates: Partial<Activity>) => {
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await updateDoc(doc(db, 'users', userId, 'activities', id), updates);
        setDbStatus('connected');
        setFeedbackMessage('Sessão atualizada no Firestore!');
      } catch (err) {
        setDbStatus('error');
        console.error('Error updating activity in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/activities/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      setActivities((prev) => prev.filter((a) => a.id !== id));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await deleteDoc(doc(db, 'users', userId, 'activities', id));
        setDbStatus('connected');
        setFeedbackMessage('Sessão removida do Firestore!');
      } catch (err) {
        setDbStatus('error');
        console.error('Error deleting activity in Firestore:', err);
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}/activities/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const addVocabulary = useCallback(
    async (vocabData: Omit<VocabularyWord, 'id' | 'userId' | 'createdAt'>) => {
      const newId = `vocab-${Date.now()}`;
      const newVocab: VocabularyWord = {
        ...vocabData,
        id: newId,
        userId,
        createdAt: new Date().toISOString(),
      };

      setVocabulary((prev) => [newVocab, ...prev]);

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await setDoc(doc(db, 'users', userId, 'vocabulary', newId), newVocab);
        setDbStatus('connected');
        setFeedbackMessage('Palavra gravada no Firestore com sucesso!');
      } catch (err) {
        setDbStatus('error');
        console.error('Error saving vocabulary to Firestore:', err);
        handleFirestoreError(err, OperationType.CREATE, `users/${userId}/vocabulary/${newId}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const updateVocabulary = useCallback(
    async (id: string, updates: Partial<VocabularyWord>) => {
      const updatedAt = new Date().toISOString();
      setVocabulary((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt } : v)));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await updateDoc(doc(db, 'users', userId, 'vocabulary', id), { ...updates, updatedAt });
        setDbStatus('connected');
      } catch (err) {
        setDbStatus('error');
        console.error('Error updating vocabulary in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/vocabulary/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const toggleVocabularyStatus = useCallback(
    async (id: string, nextStatus: VocabularyStatus) => {
      await updateVocabulary(id, { status: nextStatus });
    },
    [updateVocabulary]
  );

  const deleteVocabulary = useCallback(
    async (id: string) => {
      setVocabulary((prev) => prev.filter((v) => v.id !== id));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await deleteDoc(doc(db, 'users', userId, 'vocabulary', id));
        setDbStatus('connected');
      } catch (err) {
        setDbStatus('error');
        console.error('Error deleting vocabulary in Firestore:', err);
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}/vocabulary/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const addGrammarItem = useCallback(
    async (itemData: Omit<GrammarItem, 'id' | 'userId' | 'createdAt'>) => {
      const newId = `gram-${Date.now()}`;
      const newItem: GrammarItem = {
        ...itemData,
        id: newId,
        userId,
        createdAt: new Date().toISOString(),
      };

      setGrammar((prev) => [newItem, ...prev]);

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await setDoc(doc(db, 'users', userId, 'grammar', newId), newItem);
        setDbStatus('connected');
        setFeedbackMessage('Regra gramatical gravada no Firestore!');
      } catch (err) {
        setDbStatus('error');
        console.error('Error saving grammar to Firestore:', err);
        handleFirestoreError(err, OperationType.CREATE, `users/${userId}/grammar/${newId}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const updateGrammarItem = useCallback(
    async (id: string, updates: Partial<GrammarItem>) => {
      setGrammar((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await updateDoc(doc(db, 'users', userId, 'grammar', id), updates);
        setDbStatus('connected');
      } catch (err) {
        setDbStatus('error');
        console.error('Error updating grammar in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/grammar/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const deleteGrammarItem = useCallback(
    async (id: string) => {
      setGrammar((prev) => prev.filter((g) => g.id !== id));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await deleteDoc(doc(db, 'users', userId, 'grammar', id));
        setDbStatus('connected');
      } catch (err) {
        setDbStatus('error');
        console.error('Error deleting grammar in Firestore:', err);
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}/grammar/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...updates }));

      try {
        setIsSyncing(true);
        setDbStatus('saving');
        await setDoc(doc(db, 'users', userId, 'profile', 'info'), updates, { merge: true });
        setDbStatus('connected');
      } catch (err) {
        setDbStatus('error');
        console.error('Error updating profile in Firestore:', err);
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/profile/info`);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  const updateLevels = useCallback(
    async (currentLevel: CEFRLevel, targetLevel: CEFRLevel) => {
      const hoursMap: Record<CEFRLevel, number> = {
        A1: 80,
        A2: 100,
        B1: 200,
        B2: 400,
        C1: 600,
        C2: 800,
      };
      await updateProfile({
        currentLevel,
        targetLevel,
        targetHours: hoursMap[targetLevel] || 100,
      });
    },
    [updateProfile]
  );

  const updateGoals = useCallback(
    async (goals: UserGoals) => {
      await updateProfile({ goals });
    },
    [updateProfile]
  );

  // Clear all data (zeroing both local state and Firestore database)
  const clearAllData = useCallback(async () => {
    setActivities([]);
    setVocabulary([]);
    setGrammar([]);

    try {
      setIsSyncing(true);
      setDbStatus('saving');
      const acts = await getDocs(collection(db, 'users', userId, 'activities'));
      for (const d of acts.docs) await deleteDoc(d.ref);

      const vocabs = await getDocs(collection(db, 'users', userId, 'vocabulary'));
      for (const d of vocabs.docs) await deleteDoc(d.ref);

      const grams = await getDocs(collection(db, 'users', userId, 'grammar'));
      for (const d of grams.docs) await deleteDoc(d.ref);

      setDbStatus('connected');
      setFeedbackMessage('Dados limpos com sucesso no Firestore!');
    } catch (e) {
      setDbStatus('error');
      console.error('Error clearing data in Firestore:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const loadSampleData = useCallback(async () => {
    setActivities(sampleStarterActivities);
    setVocabulary(sampleStarterVocabulary);

    try {
      setIsSyncing(true);
      setDbStatus('saving');
      for (const act of sampleStarterActivities) {
        await setDoc(doc(db, 'users', userId, 'activities', act.id), { ...act, userId });
      }
      for (const voc of sampleStarterVocabulary) {
        await setDoc(doc(db, 'users', userId, 'vocabulary', voc.id), { ...voc, userId });
      }
      setDbStatus('connected');
      setFeedbackMessage('Exemplos gravados no Firestore!');
    } catch (e) {
      setDbStatus('error');
      console.error('Error loading sample data:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      setActiveUserId(res.user.uid);
      localStorage.setItem('project_r_user_id', res.user.uid);
      setFeedbackMessage(`Conectado com Google (${res.user.email})!`);
    } catch (e) {
      console.error('Google sign-in error:', e);
      setFeedbackMessage('Não foi possível autenticar com Google.');
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveUserId('reinan');
      localStorage.setItem('project_r_user_id', 'reinan');
      setFeedbackMessage('Desconectado.');
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  }, []);

  const speakWord = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Computed metrics
  const totalMinutes = useMemo(() => {
    return activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
  }, [activities]);

  const totalHoursFormatted = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0 && mins === 0) return '0h';
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  }, [totalMinutes]);

  const totalSessions = activities.length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinutes = useMemo(() => {
    return activities
      .filter((a) => a.date === todayStr)
      .reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
  }, [activities, todayStr]);

  const thisWeekMinutes = useMemo(() => {
    return activities.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
  }, [activities]);

  const completedPercentA2 = useMemo(() => {
    const targetMins = (profile.targetHours || 100) * 60;
    if (targetMins === 0) return 0;
    return Math.min(100, Math.round((totalMinutes / targetMins) * 100));
  }, [totalMinutes, profile.targetHours]);

  const currentStreakDays = useMemo(() => {
    if (activities.length === 0) return 0;
    const uniqueDates = new Set(activities.map((a) => a.date));
    return uniqueDates.size;
  }, [activities]);

  const skillMinutesMap = useMemo(() => {
    const map: Record<string, number> = {
      listening: 0,
      speaking: 0,
      writing: 0,
      reading: 0,
      grammar: 0,
    };
    for (const act of activities) {
      if (map[act.skill] !== undefined) {
        map[act.skill] += Number(act.durationMinutes) || 0;
      }
    }
    return map;
  }, [activities]);

  const skillPercentMap = useMemo(() => {
    const total = totalMinutes || 1;
    return {
      listening: Math.round(((skillMinutesMap.listening || 0) / total) * 100),
      reading: Math.round(((skillMinutesMap.reading || 0) / total) * 100),
      grammar: Math.round(((skillMinutesMap.grammar || 0) / total) * 100),
      writing: Math.round(((skillMinutesMap.writing || 0) / total) * 100),
      speaking: Math.round(((skillMinutesMap.speaking || 0) / total) * 100),
    };
  }, [skillMinutesMap, totalMinutes]);

  return (
    <AppContext.Provider
      value={{
        user,
        userId,
        isAuthReady,
        isSyncing,
        dbStatus,
        activities,
        vocabulary,
        grammar,
        profile,
        activeSection,
        setActiveSection,
        isSidebarOpen,
        setIsSidebarOpen,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        selectedActivityForDetails,
        setSelectedActivityForDetails,
        selectedActivityForEdit,
        setSelectedActivityForEdit,
        selectedVocabForEdit,
        setSelectedVocabForEdit,
        isAddVocabModalOpen,
        setIsAddVocabModalOpen,
        isAddGrammarModalOpen,
        setIsAddGrammarModalOpen,
        feedbackMessage,
        setFeedbackMessage,
        addActivity,
        updateActivity,
        deleteActivity,
        addVocabulary,
        updateVocabulary,
        toggleVocabularyStatus,
        deleteVocabulary,
        addGrammarItem,
        updateGrammarItem,
        deleteGrammarItem,
        updateProfile,
        updateLevels,
        updateGoals,
        clearAllData,
        loadSampleData,
        signInWithGoogle,
        signOutUser,
        speakWord,
        totalMinutes,
        totalHoursFormatted,
        totalSessions,
        completedPercentA2,
        todayMinutes,
        thisWeekMinutes,
        skillMinutesMap,
        skillPercentMap,
        currentStreakDays,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
