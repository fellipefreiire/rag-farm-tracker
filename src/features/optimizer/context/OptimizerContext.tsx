import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AssassinProfile } from '../types/assassin';
import type { FarmRecommendation } from '../types/recommendation';

interface OptimizerContextType {
  // Character management
  currentProfile: AssassinProfile | null;
  profiles: AssassinProfile[];
  setCurrentProfile: (profile: AssassinProfile | null) => void;
  saveProfile: (profile: AssassinProfile) => void;
  loadProfiles: () => void;
  clearProfile: () => void;
  deleteProfile: (id: string) => void;

  // Recommendations
  recommendations: FarmRecommendation[];
  isGeneratingRecommendations: boolean;
  generateRecommendations: (profile: AssassinProfile) => Promise<void>;
  clearRecommendations: () => void;

  // Filter state
  recommendationFilters: {
    sortBy: 'score' | 'zeny' | 'exp' | 'killSpeed';
  };
  setRecommendationFilters: (filters: Partial<OptimizerContextType['recommendationFilters']>) => void;
}

const OptimizerContext = createContext<OptimizerContextType | undefined>(undefined);

const STORAGE_KEY = 'assassinProfiles';

export function OptimizerProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<AssassinProfile | null>(null);
  const [profiles, setProfiles] = useState<AssassinProfile[]>([]);
  const [recommendations, setRecommendations] = useState<FarmRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendationFilters, setFilters] = useState<OptimizerContextType['recommendationFilters']>({
    sortBy: 'score',
  });

  // Load profiles from localStorage on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedProfiles = JSON.parse(stored) as AssassinProfile[];
        setProfiles(loadedProfiles);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const saveProfile = (profile: AssassinProfile) => {
    try {
      const updatedProfile = {
        ...profile,
        updatedAt: Date.now(),
      };

      // Check if profile exists (editing) or is new
      const existingIndex = profiles.findIndex(p => p.id === updatedProfile.id);
      let updatedProfiles: AssassinProfile[];

      if (existingIndex >= 0) {
        // Update existing
        updatedProfiles = [...profiles];
        updatedProfiles[existingIndex] = updatedProfile;
      } else {
        // Add new
        updatedProfiles = [...profiles, updatedProfile];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
      setCurrentProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const deleteProfile = (id: string) => {
    try {
      const updatedProfiles = profiles.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);

      // If current profile was deleted, clear it
      if (currentProfile?.id === id) {
        setCurrentProfile(null);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const clearProfile = () => {
    try {
      setCurrentProfile(null);
      setRecommendations([]);
    } catch (error) {
      console.error('Failed to clear profile:', error);
    }
  };

  const generateRecommendations = async (profile: AssassinProfile) => {
    setIsGeneratingRecommendations(true);
    try {
      // Import the recommendation engine
      const { generateAssassinRecommendations } = await import('../engine/recommendationEngine');

      // Generate recommendations
      const recs = await generateAssassinRecommendations(profile, recommendationFilters);

      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const clearRecommendations = () => {
    setRecommendations([]);
  };

  const setRecommendationFilters = (filters: Partial<OptimizerContextType['recommendationFilters']>) => {
    setFilters(prev => ({ ...prev, ...filters }));
  };

  const value: OptimizerContextType = {
    currentProfile,
    profiles,
    setCurrentProfile,
    saveProfile,
    loadProfiles,
    clearProfile,
    deleteProfile,
    recommendations,
    isGeneratingRecommendations,
    generateRecommendations,
    clearRecommendations,
    recommendationFilters,
    setRecommendationFilters,
  };

  return (
    <OptimizerContext.Provider value={value}>
      {children}
    </OptimizerContext.Provider>
  );
}

export function useOptimizer() {
  const context = useContext(OptimizerContext);
  if (context === undefined) {
    throw new Error('useOptimizer must be used within an OptimizerProvider');
  }
  return context;
}
