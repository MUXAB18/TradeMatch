'use client';

import { useState } from 'react';
import { SectionHeader } from './SettingsForms';
import Modal from '@/components/ui/Modal';
import { Shield, Lock, Smartphone, Laptop, SmartphoneIcon } from 'lucide-react';
import PremiumSwitch from './PremiumSwitch';

const inputClass = "w-full px-4 py-3 bg-surface border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all";
const labelClass = "block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2";

export default function SecuritySettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {
  const [activeModal, setActiveModal] = useState<'password' | '2fa' | null>(null);
  
  // State
  const [twoFactor, setTwoFactor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }
    // Mock save
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveModal(null);
    showToast('success', 'Password updated successfully.');
  };

  const handleToggle2FA = () => {
    setTwoFactor(!twoFactor);
    setActiveModal(null);
    showToast('success', `Two-Factor Authentication ${!twoFactor ? 'enabled' : 'disabled'}.`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="Security & Sign in" description="Manage your passwords and secure your account." />
      
      <div className="space-y-6">
        {/* Passwords */}
        <div className="p-5 border border-border bg-surface rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-text-primary">Password</h3>
              <p className="text-[13px] text-text-secondary mt-0.5">Last changed 3 months ago</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('password')}
            className="px-5 py-2.5 bg-surface border border-border text-text-primary rounded-xl font-bold text-[14px] hover:bg-background transition-colors w-full md:w-auto text-center shrink-0"
          >
            Change Password
          </button>
        </div>

        {/* 2FA */}
        <div className="p-5 border border-border bg-surface rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-text-primary">Two-factor authentication</h3>
              <p className="text-[13px] text-text-secondary mt-0.5">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${twoFactor ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-border/50 text-text-secondary'}`}>
              {twoFactor ? 'Enabled' : 'Disabled'}
            </span>
            <PremiumSwitch value={twoFactor} onValueChange={() => setActiveModal('2fa')} activeColor="#34C759" />
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="text-[14px] font-bold text-text-primary uppercase tracking-wider mb-4 mt-8">Active Sessions</h3>
          <div className="bg-surface border border-border rounded-[20px] overflow-hidden">
            {/* Session 1 */}
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-secondary">
                  <Laptop size={20} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-text-primary">MacBook Pro</h4>
                  <p className="text-[13px] text-text-secondary">Chrome · <span className="text-[#34C759] font-medium">Current session</span></p>
                  <p className="text-[12px] text-text-secondary mt-1">Lahore, Pakistan</p>
                </div>
              </div>
            </div>
            
            {/* Session 2 */}
            <div className="px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-secondary">
                  <SmartphoneIcon size={20} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-text-primary">iPhone 13</h4>
                  <p className="text-[13px] text-text-secondary">Safari · Last active 2 hours ago</p>
                  <p className="text-[12px] text-text-secondary mt-1">Lahore, Pakistan</p>
                </div>
              </div>
              <button className="text-[14px] font-bold text-[#007AFF] hover:underline">Log out</button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button className="text-[14px] font-bold text-text-secondary hover:text-text-primary hover:underline">
              Log out of all devices
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'password'} onClose={() => setActiveModal(null)} title="Change Password">
        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} required />
            {/* Simple password strength indicator (visual only) */}
            <div className="flex gap-1 mt-2">
              <div className={`h-1 flex-1 rounded-full ${newPassword.length > 0 ? 'bg-[#FF3B30]' : 'bg-border'}`} />
              <div className={`h-1 flex-1 rounded-full ${newPassword.length > 4 ? 'bg-[#FF9500]' : 'bg-border'}`} />
              <div className={`h-1 flex-1 rounded-full ${newPassword.length > 7 ? 'bg-[#34C759]' : 'bg-border'}`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} required />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:bg-background">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold hover:opacity-90">Update Password</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === '2fa'} onClose={() => setActiveModal(null)} title="Two-Factor Authentication">
        <div className="p-6 space-y-5">
          <div className="bg-background border border-border rounded-[16px] p-5">
            <h3 className="text-[16px] font-bold text-text-primary mb-2">Protect your account</h3>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:bg-background">Cancel</button>
            <button onClick={handleToggle2FA} className={`px-5 py-2.5 rounded-xl text-white font-bold hover:opacity-90 transition-opacity ${twoFactor ? 'bg-[#FF3B30]' : 'bg-[#007AFF]'}`}>
              {twoFactor ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
