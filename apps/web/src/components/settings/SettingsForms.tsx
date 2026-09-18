'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserProfile } from '@/lib/services/users';
import PremiumSwitch from './PremiumSwitch';
import { SettingsSection } from './SettingsSidebar';
import { 
  User, Mail, Phone, MapPin, Link2, AlertCircle,
  Briefcase, Clock, Bell, MessageSquare, Sun, Moon, Laptop,
  Globe, DollarSign, ExternalLink, Trash2, CheckCircle2, HelpCircle, ChevronDown
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileKey } from '@/lib/utils';

export function SectionHeader({ title, description }: { title: string, description?: string }) {
  return (
    <div className="mb-6 border-b border-border/60 pb-5">
      <h2 className="text-[20px] font-extrabold text-text-primary tracking-tight">{title}</h2>
      {description && <p className="text-[14px] text-text-secondary mt-1">{description}</p>}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 bg-surface border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all";
const labelClass = "block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2";

export function ProfileSettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {
  const { profile, loading } = useUserProfile();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin: '',
    github: ''
  });
  
  useEffect(() => {
    if (profile) {
      const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(profileKey(user?.uid)) || '{}') : {};
      
      if (localData.photoUrl) {
        setPreviewUrl(localData.photoUrl);
      }
      setFormData(prev => ({
        ...prev,
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
        phone: profile.phone || '',
        username: localData.username || '',
        location: localData.location || '',
        bio: localData.bio || '',
        website: localData.website || '',
        linkedin: localData.linkedin || '',
        github: localData.github || ''
      }));
    }
  }, [profile]);
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPreviewUrl(dataUrl);
          showToast('success', 'Photo selected for upload');
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile || !user?.uid) return;
    setIsSaving(true);
    try {
      // Only save supported fields to Firestore
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await updateUserProfile(user.uid, {
        name,
        phone: formData.phone,
      });
      // Save unsupported mock fields to localStorage so they persist across reloads
      localStorage.setItem(profileKey(user?.uid), JSON.stringify({
        username: formData.username,
        location: formData.location,
        bio: formData.bio,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        photoUrl: previewUrl
      }));
      showToast('success', 'Profile updated successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Profile Settings" description="Manage your personal information and how others see you." />
      
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-6 pb-4 border-b border-border/40">
          <div className="w-20 h-20 rounded-full bg-[#F0F7FF] border border-[#007AFF]/20 flex items-center justify-center text-[#007AFF] text-2xl font-bold overflow-hidden shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              formData.firstName.charAt(0) || <User />
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/jpeg,image/png,image/gif" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-[14px] font-bold text-text-primary hover:bg-background transition-colors mb-2"
            >
              Change photo
            </button>
            <p className="text-[13px] text-text-secondary">JPG, GIF or PNG. Max size of 5MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>First Name</label>
            <input 
              value={formData.firstName} 
              onChange={e => setFormData({...formData, firstName: e.target.value})} 
              className={inputClass} 
              placeholder="John" 
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input 
              value={formData.lastName} 
              onChange={e => setFormData({...formData, lastName: e.target.value})} 
              className={inputClass} 
              placeholder="Doe" 
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <textarea 
            value={formData.bio} 
            onChange={e => setFormData({...formData, bio: e.target.value})} 
            className={`${inputClass} min-h-[100px] resize-y`} 
            placeholder="Write a short bio about your professional experience..." 
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AccountSettings({ showToast }: { showToast?: (t: 'success'|'error', m: string) => void }) {
  const { profile, loading, refetch } = useUserProfile();
  const { user } = useAuth();
  
  const [editingField, setEditingField] = useState<'email' | 'phone' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (loading) return <SettingsSkeleton />;

  const handleEditClick = (field: 'email' | 'phone', currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      if (editingField === 'phone') {
        await updateUserProfile(user.uid, { phone: editValue });
      } else if (editingField === 'email') {
        // In a real app, this would require Firebase Auth updateEmail + re-authentication
        await updateUserProfile(user.uid, { email: editValue });
      }
      
      if (refetch) await refetch();
      
      if (showToast) {
        showToast('success', `${editingField === 'email' ? 'Email' : 'Phone'} updated successfully`);
      }
      setEditingField(null);
    } catch (err: any) {
      if (showToast) {
        showToast('error', err.message || 'Failed to update');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: 'email' | 'phone', label: string, value: string, fallback: string) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="px-6 py-5 border-b border-border/60 transition-colors bg-background/30">
          <div className="w-full max-w-xl flex flex-col gap-2">
            <label className="text-[14px] font-bold text-text-primary">{label}</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type={field === 'email' ? 'email' : 'tel'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editValue.trim() && !isSaving) {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    setEditingField(null);
                  }
                }}
                className="flex-1 w-full min-w-[250px] px-4 py-2.5 bg-surface border border-border rounded-xl text-[15px] text-text-primary shadow-sm focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all placeholder:text-text-secondary/50"
                placeholder={`Enter new ${label.toLowerCase()}`}
                autoFocus
              />
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2.5 rounded-xl text-[14px] font-bold text-text-secondary hover:bg-surface hover:text-text-primary transition-colors border border-transparent hover:border-border"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !editValue.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-[14px] font-bold shadow-sm hover:bg-[#007AFF]/90 hover:shadow transition-all disabled:opacity-50 disabled:hover:shadow-sm min-w-[80px] flex justify-center items-center"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-6 py-5 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 transition-colors hover:bg-background/50">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[15px] font-bold text-text-primary mb-1">{label}</p>
          <p className="text-[14px] text-text-secondary truncate">{value || fallback}</p>
        </div>
        <button 
          onClick={() => handleEditClick(field, value || '')}
          className="px-4 py-1.5 rounded-lg bg-surface border border-border text-[#007AFF] text-[13px] font-bold shadow-sm hover:bg-background hover:border-[#007AFF]/30 transition-all self-start md:self-auto shrink-0"
        >
          Edit
        </button>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Account Information" description="View and manage your core account details." />
      
      <div className="bg-surface border border-border rounded-[20px] overflow-hidden">
        {renderField('email', 'Email Address', profile?.email || user?.email || '', 'No email linked')}
        {renderField('phone', 'Phone Number', profile?.phone || '', 'Not provided')}
        
        <div className="px-6 py-5 bg-background/50">
          <p className="text-[15px] font-bold text-text-primary mb-1">Account Details</p>
          <div className="flex flex-col gap-1 mt-3">
            <div className="flex justify-between text-[14px]">
              <span className="text-text-secondary">Account ID</span>
              <span className="font-mono text-text-primary">{user?.uid.substring(0, 12)}...</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-text-secondary">Account Created</span>
              <span className="text-text-primary">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-text-secondary">Account Type</span>
              <span className="text-text-primary font-bold">{profile?.trade || 'Professional'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationSettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    jobMatches: profile?.notificationPreferences?.jobMatches ?? true,
    certReminders: profile?.notificationPreferences?.certReminders ?? true,
    profileNudges: profile?.notificationPreferences?.profileNudges ?? false,
    messages: true,
  });

  const handleToggle = async (key: keyof typeof prefs, val: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: val }));
    // Save to backend if supported
    if (user?.uid && (key === 'jobMatches' || key === 'certReminders' || key === 'profileNudges')) {
      try {
        await updateUserProfile(user.uid, {
          notificationPreferences: {
            ...prefs,
            [key]: val
          }
        });
      } catch (err) {
        // Silent fail on save for this mock
      }
    }
    showToast('success', 'Preferences updated');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Notification Preferences" description="Control what alerts you receive and how you receive them." />
      
      <div className="space-y-6">
        <div>
          <h3 className="text-[14px] font-bold text-text-primary uppercase tracking-wider mb-4">Email Notifications</h3>
          <div className="space-y-1">
            <ToggleRow 
              title="Job recommendations" 
              desc="Receive notifications about jobs matching your interests." 
              value={prefs.jobMatches} 
              onChange={v => handleToggle('jobMatches', v)} 
            />
            <ToggleRow 
              title="Certification Reminders" 
              desc="Get alerted before your certs expire." 
              value={prefs.certReminders} 
              onChange={v => handleToggle('certReminders', v)} 
            />
            <ToggleRow 
              title="Messages" 
              desc="Alerts for new chat messages from employers." 
              value={prefs.messages} 
              onChange={v => handleToggle('messages', v)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, value, onChange }: { title: string, desc: string, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-surface border border-border rounded-xl mb-3 hover:border-primary/30 transition-colors">
      <div className="flex-1 pr-4 min-w-0">
        <p className="text-[15px] font-bold text-[#1D1D1F] dark:text-text-primary mb-1">{title}</p>
        <p className="text-[13px] text-[#6B7280] dark:text-text-secondary leading-relaxed">{desc}</p>
      </div>
      <div className="shrink-0">
        <PremiumSwitch value={value} onValueChange={onChange} />
      </div>
    </div>
  );
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Appearance" description="Customize how TradeMatch looks on this device." />
      
      <div>
        <h3 className="text-[14px] font-bold text-text-primary uppercase tracking-wider mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          <ThemeCard active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun />} label="Light" />
          <ThemeCard active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon />} label="Dark" />
          <ThemeCard active={theme === 'system'} onClick={() => setTheme('system')} icon={<Laptop />} label="System" />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all
        ${active ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]' : 'border-border bg-surface text-text-secondary hover:border-border/80'}
      `}
    >
      <div className="mb-3">{icon}</div>
      <span className="text-[14px] font-bold">{label}</span>
    </button>
  );
}

function Dropdown({ label, options, value, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o: any) => o.value === value) || options[0];

  return (
    <div className="relative w-full block">
      <label className="block text-[13px] font-bold text-[#6B7280] dark:text-text-secondary uppercase tracking-wider mb-2">{label}</label>
      <div 
        className="w-full min-w-[250px] flex-1 px-5 py-3.5 bg-surface border-2 border-border rounded-xl text-[15px] text-text-primary font-bold cursor-pointer hover:border-[#007AFF]/50 focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all flex items-center justify-between shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown size={18} className={`shrink-0 ml-3 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[250px] bg-surface border-2 border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[260px] overflow-y-auto p-1.5">
            {options.map((opt: any) => (
              <div 
                key={opt.value}
                className={`px-4 py-3.5 text-[15px] font-bold rounded-lg cursor-pointer flex items-center justify-between transition-colors ${value === opt.value ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                <span className="truncate pr-4">{opt.label}</span>
                {value === opt.value && <CheckCircle2 size={18} className="shrink-0 text-[#007AFF]" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LanguageSettings() {
  const [lang, setLang] = useState('en');
  const [region, setRegion] = useState('pk');
  const [tz, setTz] = useState('pkt');

  const langs = [
    { value: 'en', label: 'English (US)' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' }
  ];
  const regions = [
    { value: 'us', label: 'United States' },
    { value: 'pk', label: 'Pakistan' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'sa', label: 'Saudi Arabia' }
  ];
  const tzs = [
    { value: 'pkt', label: '(GMT+05:00) Islamabad, Karachi' },
    { value: 'gst', label: '(GMT+04:00) Dubai, Abu Dhabi' },
    { value: 'ast', label: '(GMT+03:00) Riyadh, Kuwait' },
    { value: 'est', label: '(GMT-05:00) Eastern Time' },
    { value: 'pst', label: '(GMT-08:00) Pacific Time' },
    { value: 'gmt', label: '(GMT+00:00) London' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Language & Region" description="Manage your locale settings." />
      
      <div className="space-y-6 max-w-lg pb-32">
        <Dropdown label="Language" options={langs} value={lang} onChange={setLang} />
        <Dropdown label="Region" options={regions} value={region} onChange={setRegion} />
        <Dropdown label="Timezone" options={tzs} value={tz} onChange={setTz} />
      </div>
    </div>
  );
}

export function PrivacySettings() {
  const [visibility, setVisibility] = useState('registered');
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Privacy" description="Control who can see your profile and job activity." />
      
      <div className="mb-8">
        <label className={labelClass}>Profile Visibility</label>
        <div className="space-y-2 mt-3">
          {['Everyone', 'Registered users', 'Only me'].map((opt, i) => (
            <label key={i} className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-background/50">
              <input 
                type="radio" 
                name="visibility" 
                checked={visibility === (i === 0 ? 'everyone' : i === 1 ? 'registered' : 'only_me')}
                onChange={() => setVisibility(i === 0 ? 'everyone' : i === 1 ? 'registered' : 'only_me')}
                className="w-5 h-5 text-[#007AFF] focus:ring-[#007AFF]" 
              />
              <span className="text-[15px] font-bold text-text-primary">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-bold text-text-primary uppercase tracking-wider mb-4">Data Management</h3>
        <div className="space-y-3">
          <button className="w-full px-5 py-4 border border-border rounded-xl text-[15px] font-bold text-text-primary bg-surface hover:bg-background transition-colors flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div className="text-left">
              <p className="text-[15px] font-bold text-text-primary">Download My Data</p>
              <p className="text-[13px] text-text-secondary font-normal mt-0.5">Export a copy of all your data</p>
            </div>
          </button>
          <button className="w-full px-5 py-4 border border-red-200 dark:border-red-900/50 rounded-xl text-[15px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <div className="text-left">
              <p className="text-[15px] font-bold text-red-600">Request Data Deletion</p>
              <p className="text-[13px] text-red-400 font-normal mt-0.5">Permanently delete your account and data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function BillingSettings() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Billing & Plans" description="Manage your subscription and payment methods." />
      
      <div className="bg-surface border border-border rounded-[24px] p-8 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-[#F0F7FF] text-[#007AFF] text-[12px] font-bold rounded-full uppercase tracking-wider mb-3">Current Plan</span>
          <h3 className="text-[32px] font-extrabold text-text-primary mb-1">Free Tier</h3>
          <p className="text-[15px] text-text-secondary mb-6">You are currently on the free basic plan.</p>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity">
              Upgrade Plan
            </button>
            <button className="px-6 py-3 border border-border bg-surface text-text-primary rounded-xl font-bold text-[15px] hover:bg-background transition-colors">
              Compare Plans
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-[#007AFF]/10 to-transparent rounded-bl-full pointer-events-none" />
      </div>
    </div>
  );
}

export function HelpSettings() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h2 className="text-[20px] font-extrabold text-text-primary tracking-tight">Help & Support</h2>
        <p className="text-[15px] text-text-secondary mt-1">Get help with your account or report an issue.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/help/center" className="p-7 bg-surface border-2 border-black dark:border-white rounded-[24px] shadow-sm transition-all group">
          <div className="w-12 h-12 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#007AFF] mb-5">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-[17px] font-bold text-text-primary mb-1">Help Center</h3>
          <p className="text-[14px] text-text-secondary leading-relaxed mb-6">Find answers to common questions and guides.</p>
          <div className="text-[14px] font-bold text-[#007AFF] flex items-center gap-1.5 group-hover:underline decoration-2 underline-offset-4">
            Visit Help Center <ExternalLink size={15} />
          </div>
        </Link>
        
        <Link href="/help/contact" className="p-7 bg-surface border border-border rounded-[24px] hover:border-[#007AFF]/40 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#007AFF] mb-5">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-[17px] font-bold text-text-primary mb-1">Contact Support</h3>
          <p className="text-[14px] text-text-secondary leading-relaxed mb-6">Need help? Contact our support team directly.</p>
          <div className="text-[14px] font-bold text-[#007AFF] flex items-center gap-1.5 group-hover:underline decoration-2 underline-offset-4">
            Contact Us <ExternalLink size={15} />
          </div>
        </Link>
      </div>
    </div>
  );
}

export function DangerZone({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Mock delete logic
    showToast('error', 'Demo account cannot be deleted.');
    setShowConfirm(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      showToast('error', 'Failed to sign out.');
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 border-b border-border/60 pb-5">
        <h2 className="text-[20px] font-extrabold text-text-primary tracking-tight">Danger Zone</h2>
        <p className="text-[14px] text-text-secondary mt-1">Irreversible and destructive actions.</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-border bg-surface rounded-[20px]">
          <div className="mb-4 md:mb-0 pr-4">
            <h3 className="text-[16px] font-bold text-text-primary mb-1">Sign Out</h3>
            <p className="text-[14px] text-text-secondary">Log out of your account on this device.</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="px-6 py-2.5 bg-surface border border-border text-text-primary rounded-xl font-bold text-[14px] hover:bg-background transition-colors shrink-0"
          >
            Sign Out
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-red-200 bg-red-50/50 rounded-[20px] dark:border-red-900/50 dark:bg-red-950/20">
          <div className="mb-4 md:mb-0 pr-4">
            <h3 className="text-[16px] font-bold text-red-700 dark:text-red-500 mb-1">Delete Account</h3>
            <p className="text-[14px] text-red-600/80 dark:text-red-400/80">Deleting your account is permanent. Your profile and data will be removed.</p>
          </div>
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-[14px] hover:bg-red-700 transition-colors shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showConfirm && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Premium Glassmorphism Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowConfirm(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-[440px] bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 overflow-hidden animate-in zoom-in-[0.96] fade-in duration-300">
            
            {/* Subtle glow effect behind icon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-red-500/20 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-500 mb-6 border border-red-100 dark:border-red-500/20 shadow-sm rotate-3 transform transition-transform hover:rotate-0">
                <Trash2 size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-[24px] font-extrabold text-[#1D1D1F] dark:text-white mb-3 tracking-tight">
                Delete account?
              </h3>
              
              <p className="text-[15px] text-[#6B7280] dark:text-[#A1A1AA] mb-8 leading-relaxed px-2">
                This action is permanent and cannot be undone. All your data, profile information, and settings will be completely wiped from our servers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="flex-1 py-3.5 px-4 bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-bold text-[15px] rounded-[16px] border border-[#E5E7EB] dark:border-transparent shadow-sm hover:bg-[#F9FAFB] dark:hover:bg-[#3A3A3C] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold text-[15px] rounded-[16px] shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:bg-red-700 hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="mb-6 border-b border-border/60 pb-5">
        <div className="h-6 w-48 bg-border/40 rounded-md mb-3" />
        <div className="h-4 w-96 bg-border/30 rounded-md" />
      </div>
      <div className="space-y-4">
        <div className="h-20 w-full bg-border/20 rounded-[20px]" />
        <div className="h-20 w-full bg-border/20 rounded-[20px]" />
      </div>
    </div>
  );
}
