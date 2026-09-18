import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { getUserProfile } from '@/lib/services/users';
import { useAuth } from '@/contexts/AuthContext';
import { profileKey } from '@/lib/utils';

export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(authUser.uid) || {} as User;

      // Merge with mock data from localStorage if available (for MVP demo purposes)
      try {
        const localDataRaw = localStorage.getItem(profileKey(authUser.uid));
        if (localDataRaw) {
          const localData = JSON.parse(localDataRaw);
          if (localData.experience && localData.experience.length > 0) {
            (data as any).experience = localData.experience;
            data.yearsExperience = localData.experience.length; // rough estimate to trick the completion check
          }
          if (localData.education && localData.education.length > 0) {
            (data as any).education = localData.education;
          }
          if (localData.projects && localData.projects.length > 0) {
            (data as any).projects = localData.projects;
          }
          if (localData.certifications && localData.certifications.length > 0) {
            data.certifications = localData.certifications;
          }
          if (localData.skills && localData.skills.length > 0) {
            data.skills = localData.skills;
          }
        }
      } catch (e) {
        console.error('Failed to parse local mock data', e);
      }

      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading, fetchProfile]);

  
  useEffect(() => {
    const handleStorage = () => {
      fetchProfile();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchProfile]);

  return { profile, setProfile, loading: authLoading || loading, error, refetch: fetchProfile };
}
