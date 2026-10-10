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
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
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

  // Authenticate user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthReady(true);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
        } catch (e) {
          console.warn('Anonymous auth failed, falling back to local user:', e);
        } finally {
          setIsAuthReady(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const userId = user?.uid || 'user_active';

  // Real-time Firestore sync
  useEffect(() => {
    if (!isAuthReady || !user) return;

    setIsSyncing(true);
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const qActivities = query(activitiesRef, orderBy('createdAt', 'desc'));

    const unsubActivities = onSnapshot(
      qActivities,
      (snapshot) => {
        const acts = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Activity, 'id'>) }));
        setActivities(acts);
        setIsSyncing(false);
      },
      (err) => {
        setIsSyncing(false);
        try {
          handleFirestoreError(err, OperationType.LIST, `users/${userId}/activities`);
        } catch (e) {
          console.warn('Firestore fallback on activities:', e);
        }
      }
    );

    const vocabRef = collection(db, 'users', userId, 'vocabulary');
    const unsubVocab = onSnapshot(
      vocabRef,
      (snapshot) => {
        const vocabs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VocabularyWord, 'id'>) }));
        setVocabulary(vocabs);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, `users/${userId}/vocabulary`);
        } catch (e) {
          console.warn('Firestore fallback on vocabulary:', e);
        }
      }
    );

    const grammarRef = collection(db, 'users', userId, 'grammar');
    const unsubGrammar = onSnapshot(
      grammarRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GrammarItem, 'id'>) }));
        setGrammar(items);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, `users/${userId}/grammar`);
        } catch (e) {
          console.warn('Firestore fallback on grammar:', e);
        }
      }
    );

    const profileDocRef = doc(db, 'users', userId, 'profile', 'info');
    const unsubProfile = onSnapshot(
      profileDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          try {
            await setDoc(profileDocRef, { ...defaultProfile, userId });
          } catch (err) {
            console.error('Error saving profile:', err);
          }
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, `users/${userId}/profile/info`);
        } catch (e) {
          console.warn('Firestore fallback on profile:', e);
        }
      }
    );

    return () => {
      unsubActivities();
      unsubVocab();
      unsubGrammar();
      unsubProfile();
    };
  }, [isAuthReady, user, userId]);

  // Actions
  const addActivity = useCallback(
    async (actData: Omit<Activity, 'id' | 'userId' | 'createdAt'>) => {
      const newId = `act-${Date.now()}`;
      const newActivity: Activity = {
        ...actData,
        id: newId,
        userId,
        createdAt: new Date().toISOString(),
      };

      setActivities((prev) => [newActivity, ...prev]);

      if (user) {
        try {
          await setDoc(doc(db, 'users', userId, 'activities', newId), newActivity);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/activities/${newId}`);
        }
      }
    },
    [user, userId]
  );

  const updateActivity = useCallback(
    async (id: string, updates: Partial<Activity>) => {
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

      if (user) {
        try {
          await updateDoc(doc(db, 'users', userId, 'activities', id), updates);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/activities/${id}`);
        }
      }
    },
    [user, userId]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      setActivities((prev) => prev.filter((a) => a.id !== id));

      if (user) {
        try {
          await deleteDoc(doc(db, 'users', userId, 'activities', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/activities/${id}`);
        }
      }
    },
    [user, userId]
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

      if (user) {
        try {
          await setDoc(doc(db, 'users', userId, 'vocabulary', newId), newVocab);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/vocabulary/${newId}`);
        }
      }
    },
    [user, userId]
  );

  const updateVocabulary = useCallback(
    async (id: string, updates: Partial<VocabularyWord>) => {
      const updatedAt = new Date().toISOString();
      setVocabulary((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt } : v)));

      if (user) {
        try {
          await updateDoc(doc(db, 'users', userId, 'vocabulary', id), { ...updates, updatedAt });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/vocabulary/${id}`);
        }
      }
    },
    [user, userId]
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

      if (user) {
        try {
          await deleteDoc(doc(db, 'users', userId, 'vocabulary', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/vocabulary/${id}`);
        }
      }
    },
    [user, userId]
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

      if (user) {
        try {
          await setDoc(doc(db, 'users', userId, 'grammar', newId), newItem);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/grammar/${newId}`);
        }
      }
    },
    [user, userId]
  );

  const updateGrammarItem = useCallback(
    async (id: string, updates: Partial<GrammarItem>) => {
      setGrammar((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));

      if (user) {
        try {
          await updateDoc(doc(db, 'users', userId, 'grammar', id), updates);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/grammar/${id}`);
        }
      }
    },
    [user, userId]
  );

  const deleteGrammarItem = useCallback(
    async (id: string) => {
      setGrammar((prev) => prev.filter((g) => g.id !== id));

      if (user) {
        try {
          await deleteDoc(doc(db, 'users', userId, 'grammar', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/grammar/${id}`);
        }
      }
    },
    [user, userId]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...updates }));

      if (user) {
        try {
          await setDoc(doc(db, 'users', userId, 'profile', 'info'), updates, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}/profile/info`);
        }
      }
    },
    [user, userId]
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

  // Clear all data (zeroing the app)
  const clearAllData = useCallback(async () => {
    setActivities([]);
    setVocabulary([]);
    setGrammar([]);

    if (user) {
      try {
        const acts = await getDocs(collection(db, 'users', userId, 'activities'));
        for (const d of acts.docs) await deleteDoc(d.ref);

        const vocabs = await getDocs(collection(db, 'users', userId, 'vocabulary'));
        for (const d of vocabs.docs) await deleteDoc(d.ref);

        const grams = await getDocs(collection(db, 'users', userId, 'grammar'));
        for (const d of grams.docs) await deleteDoc(d.ref);
      } catch (e) {
        console.error('Error clearing data in Firestore:', e);
      }
    }
  }, [user, userId]);

  const loadSampleData = useCallback(async () => {
    setActivities(sampleStarterActivities);
    setVocabulary(sampleStarterVocabulary);

    if (user) {
      try {
        for (const act of sampleStarterActivities) {
          await setDoc(doc(db, 'users', userId, 'activities', act.id), { ...act, userId });
        }
        for (const voc of sampleStarterVocabulary) {
          await setDoc(doc(db, 'users', userId, 'vocabulary', voc.id), { ...voc, userId });
        }
      } catch (e) {
        console.error('Error loading sample data:', e);
      }
    }
  }, [user, userId]);

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
