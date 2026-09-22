'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserProfile } from '@/lib/services/users';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileCompletion, profileKey } from '@/lib/utils';
import ProfileHeader from '@/components/profile/ProfileHeader';
import RightSidebar from '@/components/profile/RightSidebar';
import Modal from '@/components/ui/Modal';
import { useTranslations } from 'next-intl';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const SUGGESTED_SKILLS: Record<string, string[]> = {
  Electrician: ["Wiring", "Blueprint Reading", "Troubleshooting", "Safety Protocols", "Power Tools", "Conduit Bending", "Circuit Breakers"],
  Plumber: ["Pipe Fitting", "Drain Cleaning", "Water Heaters", "Welding", "PVC", "Sewer Repair"],
  Welder: ["MIG Welding", "TIG Welding", "Stick Welding", "Blueprint Reading", "Fabrication", "Safety Procedures"],
  Carpenter: ["Framing", "Finish Carpentry", "Power Tools", "Blueprint Reading", "Cabinetry", "Roofing"],
  HVAC: ["Refrigeration", "Ductwork", "Thermostats", "Troubleshooting", "Preventative Maintenance"],
  Default: ["Teamwork", "Problem Solving", "Safety Protocols", "Time Management", "Communication", "Project Management", "Leadership"]
};

import {
  AboutSection,
  ExperienceSection,
  SkillsSection,
  EducationSection,
  CertificationsSection,
  ProjectsSection,
  ResumeSection,
} from '@/components/profile/ProfileSections';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const [dbSkills, setDbSkills] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  useEffect(() => {
    getDoc(doc(db, 'platform_settings', 'skills')).then(snap => {
      if (snap.exists()) setDbSkills(snap.data().items || []);
    });
    getDoc(doc(db, 'platform_settings', 'job_categories')).then(snap => {
      if (snap.exists()) setDbCategories(snap.data().items || []);
    });
  }, []);

  const parseDateString = (dateStr: string) => {
    if (!dateStr) return null;
    const [month, year] = dateStr.split('/');
    if (month && year) {
      return new Date(parseInt(year), parseInt(month) - 1);
    }
    return new Date(dateStr); // fallback
  };
  const formatDateObj = (date: Date | null) => {
    if (!date) return '';
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${m < 10 ? '0'+m : m}/${y}`;
  };
  const formatYearObj = (date: Date | null) => {
    if (!date) return '';
    return date.getFullYear().toString();
  };

  const { user: authUser } = useAuth();
  const { profile, loading: profileLoading, setProfile } = useUserProfile();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Modals State ---
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // --- Real Form State (Backed by User Model) ---
  const [editName, setEditName] = useState('');
  const [editTrade, setEditTrade] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editAvailability, setEditAvailability] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editCerts, setEditCerts] = useState(''); // Comma separated for MVP

  // --- Mock Form State (Not in User Model, strictly UI) ---
  const [mockAbout, setMockAbout] = useState<string | null>(null);
  const [mockExperience, setMockExperience] = useState<any[]>([]);
  const [mockEducation, setMockEducation] = useState<any[]>([]);
  const [mockProjects, setMockProjects] = useState<any[]>([]);
  const [mockResume, setMockResume] = useState<any>(null);
  const [mockCertifications, setMockCertifications] = useState<any[]>([]);
  const [editExpIndex, setEditExpIndex] = useState<number | null>(null);
  const [editEduIndex, setEditEduIndex] = useState<number | null>(null);
  const [editCertIndex, setEditCertIndex] = useState<number | null>(null);
  const [editProjIndex, setEditProjIndex] = useState<number | null>(null);

  // Temp mock form inputs
  const [aboutInput, setAboutInput] = useState('');
  const [expInput, setExpInput] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' });
  const [eduInput, setEduInput] = useState({ institution: '', degree: '', field: '', startYear: '', endYear: '' });
  const [projInput, setProjInput] = useState({ name: '', technologies: '', description: '' });
  const [certInput, setCertInput] = useState({ name: '', issuer: '', issueDate: '', description: '', image: null as string|null });

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditTrade(profile.trade || '');
      setEditCountry(profile.country || '');
      setEditAvailability(profile.availability || 'immediate');
      setEditSkills(profile.skills?.join(', ') || '');
      setEditCerts(profile.certifications?.join(', ') || '');
    }
  }, [profile]);

  useEffect(() => {
    const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(profileKey(authUser?.uid)) || '{}') : {};
    if (localData.about) setMockAbout(localData.about);
    if (localData.experience) setMockExperience(localData.experience);
    if (localData.education) setMockEducation(localData.education);
    if (localData.projects) setMockProjects(localData.projects);
    if (localData.resume) setMockResume(localData.resume);
    if (localData.certifications) setMockCertifications(localData.certifications);
  }, []);

  const saveMockData = (key: string, value: any) => {
    const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(profileKey(authUser?.uid)) || '{}') : {};
    localData[key] = value;
    localStorage.setItem(profileKey(authUser?.uid), JSON.stringify(localData));
    // Trigger storage event so other tabs/components can optionally listen
    window.dispatchEvent(new Event('storage'));
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Save Handlers ---

  const handleSaveRealProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    try {
      const updateData = {
        name: editName,
        trade: editTrade,
        country: editCountry,
        availability: editAvailability,
      };
      await updateUserProfile(authUser.uid, updateData);
      setProfile((prev) => (prev ? { ...prev, ...updateData } : null));
      setActiveModal(null);
      showToast('success', t('success_profile'));
    } catch (err: any) {
      showToast('error', t('error_profile'));
    }
  };

  
  const handleAddSuggestedSkill = (skill: string) => {
    const currentSkills = editSkills.split(',').map(s => s.trim()).filter(Boolean);
    if (!currentSkills.includes(skill)) {
      setEditSkills([...currentSkills, skill].join(', '));
    }
  };

  const handleSaveSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    try {
      const skillsArray = editSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await updateUserProfile(authUser.uid, { skills: skillsArray });
      setProfile((prev) => (prev ? { ...prev, skills: skillsArray } : null));
      setActiveModal(null);
      showToast('success', t('success_skills'));
    } catch (err: any) {
      showToast('error', t('error_skills'));
    }
  };

  const handleSaveCerts = (e: React.FormEvent) => {
    e.preventDefault();
    const newCerts = [...mockCertifications];
    if (editCertIndex !== null) newCerts[editCertIndex] = certInput; else newCerts.push(certInput);
    setMockCertifications(newCerts);
    saveMockData('certifications', newCerts);
    closeModal();
    showToast('success', t('success_cert'));
  };

  const handleCertImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertInput({ ...certInput, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock handlers
  
  const handleEditExp = (index: number) => {
    setEditExpIndex(index);
    setExpInput(mockExperience[index]);
    setActiveModal('addExp');
  };
  const handleEditEdu = (index: number) => {
    setEditEduIndex(index);
    setEduInput(mockEducation[index]);
    setActiveModal('addEdu');
  };
  const handleEditCert = (index: number) => {
    setEditCertIndex(index);
    setCertInput(mockCertifications[index]);
    setActiveModal('addCert');
  };
  const handleEditProj = (index: number) => {
    setEditProjIndex(index);
    setProjInput(mockProjects[index]);
    setActiveModal('addProj');
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditExpIndex(null);
    setEditEduIndex(null);
    setEditCertIndex(null);
    setEditProjIndex(null);
    setExpInput({ title: '', company: '', startDate: '', endDate: '', current: false, location: '', description: '' });
    setEduInput({ institution: '', degree: '', field: '', startYear: '', endYear: '' });
    setCertInput({ name: '', issuer: '', issueDate: '', description: '', image: null });
    setProjInput({ name: '', technologies: '', description: '' });
  };

  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    setMockAbout(aboutInput);
    saveMockData('about', aboutInput);
    setActiveModal(null);
    showToast('success', t('success_about'));
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp = [...mockExperience];
    if (editExpIndex !== null) newExp[editExpIndex] = expInput; else newExp.push(expInput);
    setMockExperience(newExp);
    saveMockData('experience', newExp);
    closeModal();
    showToast('success', t('success_exp'));
  };

  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    const newEdu = [...mockEducation];
    if (editEduIndex !== null) newEdu[editEduIndex] = eduInput; else newEdu.push(eduInput);
    setMockEducation(newEdu);
    saveMockData('education', newEdu);
    closeModal();
    showToast('success', t('success_edu'));
  };

  const handleSaveProj = (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming technologies is a string in projInput, handled correctly when displaying
    const newProj = [...mockProjects];
    if (editProjIndex !== null) newProj[editProjIndex] = projInput; else newProj.push(projInput);
    setMockProjects(newProj);
    saveMockData('projects', newProj);
    closeModal();
    showToast('success', t('success_proj'));
  };

  const handleUploadResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary object URL to view the file locally
      const url = URL.createObjectURL(file);
      const resume = { name: file.name, updatedAt: 'Just now', url };
      setMockResume(resume);
      saveMockData('resume', { name: file.name, updatedAt: 'Just now' }); // exclude url from localstorage to avoid issues
      setActiveModal(null);
      showToast('success', t('success_resume'));
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#007AFF] border-t-transparent" />
      </div>
    );
  }

  const completionPercent = getProfileCompletion(profile);

  const inputClass = "w-full px-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[15px] font-medium text-[#1D1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all shadow-sm";
  const labelClass = "block text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-2";

  return (
    <div className="flex flex-col min-h-full">
      {/* Toast Notification */}
      {message && (
        <div className="fixed top-[92px] start-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-[14px] shadow-lg ${
            message.type === 'success' ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-5 py-8 md:py-12">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[32px] md:text-[36px] font-extrabold text-[#1D1D1F] tracking-tight">{t('title')}</h1>
          <p className="text-[16px] text-[#6B7280] mt-1 font-medium">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content (70%) */}
          <div className="lg:col-span-8 space-y-6">
            <ProfileHeader 
              profile={profile} 
              onEdit={() => setActiveModal('editProfile')} 
            />
            
            <AboutSection 
              about={mockAbout} 
              onEdit={() => {
                setAboutInput(mockAbout || '');
                setActiveModal('editAbout');
              }} 
            />
            <ExperienceSection 
              experience={mockExperience} 
              onAdd={() => setActiveModal('addExp')} 
              onEditItem={handleEditExp}
            />
            <SkillsSection 
              skills={profile?.skills || []} 
              onEdit={() => setActiveModal('editSkills')} 
            />
            
            <EducationSection education={mockEducation} onAdd={() => setActiveModal('addEdu')} onEditItem={handleEditEdu} />
            
            <CertificationsSection certifications={mockCertifications.length > 0 ? mockCertifications : profile?.certifications || []} onAdd={() => setActiveModal('addCert')} onEditItem={handleEditCert} />
            
            <ProjectsSection projects={mockProjects} onAdd={() => setActiveModal('addProj')} onEditItem={handleEditProj} />
            
            <ResumeSection 
              resume={mockResume} 
              onUpload={() => setActiveModal('uploadResume')} 
              onReplace={handleUploadResume}
              onView={() => {
                if (mockResume?.url) {
                  window.open(mockResume.url, '_blank');
                } else {
                  showToast('error', t('error_resume'));
                }
              }}
            />
          </div>

          {/* Right Sidebar (30%) */}
          <div className="lg:col-span-4 hidden lg:block">
            <RightSidebar 
              profile={profile} 
              completionPercent={completionPercent} 
              onEditPreferences={() => setActiveModal('editProfile')} 
              onAction={(action) => setActiveModal(action)}
            />
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Edit Profile / Preferences Modal (Real Data) */}
      <Modal isOpen={activeModal === 'editProfile'} onClose={closeModal} title={t('edit_profile')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveRealProfile} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
          <div>
            <label className={labelClass}>{t('full_name')}</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('trade')}</label>
            <select value={editTrade} onChange={e => setEditTrade(e.target.value)} className={inputClass}>
              <option value="">{t('select_trade')}</option>
              {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('location')}</label>
            <input type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)} className={inputClass} placeholder={t('location_placeholder')} />
          </div>
          <div>
            <label className={labelClass}>{t('availability')}</label>
            <select value={editAvailability} onChange={e => setEditAvailability(e.target.value)} className={inputClass}>
              <option value="immediate">{t('avail_immediate')}</option>
              <option value="2-weeks">{t('avail_2weeks')}</option>
              <option value="unavailable">{t('avail_not')}</option>
            </select>
          </div>
          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_changes')}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Skills (Real Data) */}
      <Modal isOpen={activeModal === 'editSkills'} onClose={closeModal} title={t('edit_skills')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveSkills} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
          
          <div>
            <label className={labelClass}>{t('skills_label')}</label>
            <textarea value={editSkills} onChange={e => setEditSkills(e.target.value)} className={`${inputClass} min-h-[140px] resize-y`} placeholder={t('skills_placeholder')} />
            <div className="mt-3 flex flex-wrap gap-2">
              {dbSkills.filter(s => !editSkills.includes(s)).slice(0, 20).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSuggestedSkill(s)}
                  className="px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[13px] font-medium hover:bg-[#E5E7EB] hover:text-[#1D1D1F] transition-colors border border-[#E5E7EB]"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_skills')}</button>
          </div>
        </form>
      </Modal>

      {/* Add Certification (Mock Data) */}
      <Modal isOpen={activeModal === 'addCert'} onClose={closeModal} title={t('add_cert')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveCerts} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
            <div className="flex gap-6 items-start">
              {/* Image Upload */}
              <div className="shrink-0">
                <label className={labelClass}>{t('cert_image')}</label>
                <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-[#D1D5DB] flex items-center justify-center bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer overflow-hidden group">
                  {certInput.image ? (
                    <img src={certInput.image} alt="Certificate" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-[#9CA3AF]">+</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">{t('upload')}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleCertImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className={labelClass}>{t('cert_name')}</label>
                  <input type="text" value={certInput.name} onChange={e => setCertInput({...certInput, name: e.target.value})} className={inputClass} placeholder={t('cert_name_placeholder')} required />
                </div>
                <div>
                  <label className={labelClass}>{t('issuer')}</label>
                  <input type="text" value={certInput.issuer} onChange={e => setCertInput({...certInput, issuer: e.target.value})} className={inputClass} placeholder={t('issuer_placeholder')} required />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('issue_date')}</label>
              <DatePicker 
                selected={certInput.issueDate ? parseDateString(certInput.issueDate) : null}
                onChange={(date: any) => setCertInput({...certInput, issueDate: formatDateObj(date)})}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                placeholderText="e.g. 05/2024"
                className={inputClass}
                wrapperClassName="w-full"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className={labelClass}>{t('desc_cred')}</label>
              <textarea value={certInput.description} onChange={e => setCertInput({...certInput, description: e.target.value})} className={`${inputClass} min-h-[120px] resize-y`} placeholder={t('desc_cred_placeholder')} />
            </div>
          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_cert')}</button>
          </div>
        </form>
      </Modal>

      {/* Edit About (Mock Data) */}
      <Modal isOpen={activeModal === 'editAbout'} onClose={closeModal} title={t('edit_about')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveAbout} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
          <div>
            <label className={labelClass}>{t('prof_summary')}</label>
            <textarea value={aboutInput} onChange={e => setAboutInput(e.target.value)} className={`${inputClass} min-h-[320px] resize-y`} placeholder={t('prof_summary_placeholder')} required />
          </div>
          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_summary')}</button>
          </div>
        </form>
      </Modal>

      {/* Add Experience (Mock Data) */}
      <Modal isOpen={activeModal === 'addExp'} onClose={closeModal} title={t('add_exp')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveExp} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
          <div>
            <label className={labelClass}>{t('job_title')}</label>
            <input type="text" value={expInput.title} onChange={e => setExpInput({...expInput, title: e.target.value})} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('company')}</label>
            <input type="text" value={expInput.company} onChange={e => setExpInput({...expInput, company: e.target.value})} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('start_date')}</label>
              
              <DatePicker autoComplete="new-password" 
                selected={expInput.startDate ? parseDateString(expInput.startDate) : null}
                onChange={(date: any) => setExpInput({...expInput, startDate: formatDateObj(date)})}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                placeholderText="e.g. 06/2026"
                className={inputClass}
                wrapperClassName="w-full"
                required
              />

            </div>
            <div>
              <label className={labelClass}>{t('end_date')}</label>
              
              <DatePicker autoComplete="new-password" 
                selected={expInput.endDate && !expInput.current ? parseDateString(expInput.endDate) : null}
                onChange={(date: any) => setExpInput({...expInput, endDate: formatDateObj(date)})}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                placeholderText="e.g. 12/2026"
                className={inputClass}
                wrapperClassName="w-full"
                disabled={expInput.current}
                required={!expInput.current}
              />

            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="current" checked={expInput.current} onChange={e => setExpInput({...expInput, current: e.target.checked})} className="w-5 h-5 text-[#007AFF] rounded-md border-2 border-[#D1D5DB] focus:ring-2 focus:ring-[#007AFF]/20" />
            <label htmlFor="current" className="text-[15px] font-semibold text-[#374151] cursor-pointer">{t('current_work')}</label>
          </div>
          <div>
            <label className={labelClass}>{t('description')}</label>
            <textarea value={expInput.description} onChange={e => setExpInput({...expInput, description: e.target.value})} className={`${inputClass} min-h-[240px] resize-y`} />
          </div>
          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#E8EAF0] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E8EAF0] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-3 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_exp')}</button>
          </div>
        </form>
      </Modal>

      {/* Add Education (Mock Data) */}
      <Modal isOpen={activeModal === 'addEdu'} onClose={closeModal} title={t('add_edu')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveEdu} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
          <div>
            <label className={labelClass}>{t('institution')}</label>
            <input type="text" value={eduInput.institution} onChange={e => setEduInput({...eduInput, institution: e.target.value})} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('degree')}</label>
              <input type="text" value={eduInput.degree} onChange={e => setEduInput({...eduInput, degree: e.target.value})} className={inputClass} placeholder={t('degree_placeholder')} required />
            </div>
            <div>
              <label className={labelClass}>{t('field_study')}</label>
              <input type="text" value={eduInput.field} onChange={e => setEduInput({...eduInput, field: e.target.value})} className={inputClass} placeholder={t('field_study_placeholder')} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('start_year')}</label>
              
              <DatePicker autoComplete="new-password" 
                selected={eduInput.startYear ? new Date(parseInt(eduInput.startYear), 0) : null}
                onChange={(date: any) => setEduInput({...eduInput, startYear: formatYearObj(date)})}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="YYYY"
                className={inputClass}
                wrapperClassName="w-full"
                required
              />

            </div>
            <div>
              <label className={labelClass}>{t('end_year')}</label>
              
              <DatePicker autoComplete="new-password" 
                selected={eduInput.endYear ? new Date(parseInt(eduInput.endYear), 0) : null}
                onChange={(date: any) => setEduInput({...eduInput, endYear: formatYearObj(date)})}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="YYYY"
                className={inputClass}
                wrapperClassName="w-full"
                required
              />

            </div>
          </div>
          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#E8EAF0] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E8EAF0] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-3 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_edu')}</button>
          </div>
        </form>
      </Modal>

      {/* Add Project (Mock Data) */}
      <Modal isOpen={activeModal === 'addProj'} onClose={closeModal} title={t('add_proj')} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveProj} className="flex flex-col min-h-full">
          <div className="p-6 space-y-6 flex-1">
          <div>
            <label className={labelClass}>{t('proj_name')}</label>
            <input type="text" value={projInput.name} onChange={e => setProjInput({...projInput, name: e.target.value})} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('tech')}</label>
            <input type="text" value={projInput.technologies} onChange={e => setProjInput({...projInput, technologies: e.target.value})} className={inputClass} placeholder={t('tech_placeholder')} required />
          </div>
          <div>
            <label className={labelClass}>{t('description')}</label>
            <textarea value={projInput.description} onChange={e => setProjInput({...projInput, description: e.target.value})} className={`${inputClass} min-h-[240px] resize-y`} required />
          </div>
          </div>
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold whitespace-nowrap hover:opacity-90 shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all">{t('save_proj')}</button>
          </div>
        </form>
      </Modal>

      {/* Upload Resume (Mock Data) */}
      <Modal isOpen={activeModal === 'uploadResume'} onClose={closeModal} title={t('upload_resume')} maxWidth="max-w-2xl">
        <div className="p-6 space-y-5 text-center">
          <label className="block border-2 border-dashed border-[#D1D5DB] hover:border-[#007AFF] transition-colors rounded-[20px] p-10 bg-[#F9FAFB] hover:bg-[#F0F7FF] cursor-pointer group relative">
            <p className="text-[16px] font-bold text-[#374151] group-hover:text-[#007AFF] transition-colors mb-2">{t('drag_drop')}</p>
            <p className="text-[14px] text-[#6B7280] mb-6">{t('supports')}</p>
            <div className="px-6 py-3 rounded-xl bg-[#007AFF] text-white font-bold hover:opacity-90 transition-opacity mx-auto inline-block">
              {t('select_file')}
            </div>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadResume} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </label>
        </div>
      </Modal>

    </div>
  );
}
