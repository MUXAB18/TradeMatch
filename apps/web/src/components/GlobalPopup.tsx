'use client';
import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import * as LucideIcons from 'lucide-react';
import { Promotion } from '@/lib/services/admin';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePathname } from 'next/navigation';

export default function GlobalPopup() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const pathname = usePathname();
  
  const [validPromos, setValidPromos] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchPromo() {
      try {
        const q = query(collection(db, 'promotions'), where('isActive', '==', true));
        const snap = await getDocs(q);
        const promos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
        
        const now = Date.now();
        const validPromosList = promos.filter(p => {
          if (p.startDate && now < p.startDate) return false;
          if (p.endDate && now > p.endDate) return false;
          
          if (pathname?.includes('/admin')) return true; // Admins see all promos to test them
          
          const role = profile?.role || 'worker'; // Fallback to worker if role missing
          if (p.target === 'workers' && role !== 'worker') return false;
          if (p.target === 'agencies' && role !== 'agency') return false;

          return true;
        });

        if (validPromosList.length > 0) {
          setValidPromos(validPromosList);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Failed to load promotions", err);
      }
    }
    fetchPromo();
  }, [user, profile, pathname]);

  const activePromo = validPromos[currentIndex];
  if (!activePromo) return null;

  const handleDismiss = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const IconComponent = (LucideIcons as any)[activePromo.icon] || LucideIcons.Megaphone;
  
  const themeColors: Record<string, string> = {
    primary: '#2563EB', success: '#16A34A', warning: '#D97706', danger: '#DC2626'
  };
  const color = themeColors[activePromo.themeColor] || themeColors.primary;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', padding: 20
    }}>
      <div key={activePromo.id} style={{
        background: '#fff', borderRadius: 24, maxWidth: 460, width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative',
        overflow: 'hidden', animation: 'scaleIn 0.3s ease-out'
      }}>
        <div style={{ height: 120, background: `linear-gradient(135deg, ${color}dd, ${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconComponent size={48} color="#fff" style={{ opacity: 0.9 }} />
        </div>
        
        <button onClick={handleDismiss} style={{
          position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)',
          border: 'none', borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          <LucideIcons.X size={20} />
        </button>

        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800, color: '#111827' }}>
            {activePromo.title}
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: '#4B5563', lineHeight: 1.6 }}>
            {activePromo.message}
          </p>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {activePromo.actionText && activePromo.actionUrl && (
              <a href={activePromo.actionUrl} style={{
                background: color, color: '#fff', textDecoration: 'none',
                padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                transition: 'opacity 0.2s', display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {activePromo.actionText}
              </a>
            )}
            <button onClick={handleDismiss} style={{
              background: '#F3F4F6', color: '#374151', border: 'none',
              padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 15,
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
