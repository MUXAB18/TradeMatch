'use client';
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GlobalSettings } from '@/lib/services/admin';
import { Settings, Clock } from 'lucide-react';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null; // Or a subtle loader if preferred

  if (settings?.maintenanceMode) {
    const endTime = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : 'soon';

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999999, background: '#F9FAFB',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: 'inherit'
      }}>
        <div style={{
          background: '#fff', borderRadius: 24, padding: '48px 32px', maxWidth: 500, width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', textAlign: 'center',
          border: '1px solid #E5E7EB', position: 'relative', overflow: 'hidden'
        }}>
          {/* Header decoration */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 6,
            background: 'linear-gradient(90deg, #2563EB, #7C3AED)'
          }} />
          
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Settings size={40} color="#2563EB" style={{ animation: 'spin 4s linear infinite' }} />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>
            Under Maintenance
          </h1>
          
          <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.6, margin: '0 0 32px' }}>
            {settings.maintenanceMessage || 'We are currently performing scheduled maintenance to improve your experience. We will be back online shortly.'}
          </p>

          <div style={{
            background: '#F3F4F6', borderRadius: 16, padding: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
          }}>
            <Clock size={20} color="#6B7280" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estimated Completion</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{endTime}</div>
            </div>
          </div>
          
          {settings.supportEmail && (
            <p style={{ fontSize: 14, color: '#6B7280', marginTop: 32 }}>
              Need urgent help? Contact <a href={`mailto:${settings.supportEmail}`} style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>{settings.supportEmail}</a>
            </p>
          )}
        </div>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return <>{children}</>;
}
