'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AdminUser, AdminJob, AdminCert, AdminPrepCard, DashboardStats, AdminNotification, AuditEntry,
  getDashboardStats, getAllUsers, adminUpdateUser, setUserVerification, setUserSuspended, adminUpdateUserStatus,
  getAllJobs, createJob, updateJob, deleteJob, toggleJobActive,
  getAllCerts, createCert, updateCert, deleteCert,
  getAllPrepCards, createPrepCard, updatePrepCard, deletePrepCard,
  sendNotification, getNotifications, getAuditLog,
  getTaxonomy, addTaxonomyItem, removeTaxonomyItem, getAllCMSBlocks, updateCMSBlock,
  getGlobalSettings, updateGlobalSettings,  type GlobalSettings,
  type SupportTicket,
  getSupportTickets, updateSupportTicket, deleteSupportTicket,
  type Promotion, getPromotions, savePromotion, deletePromotion, deleteNotification,
  createCompanyUser
} from '@/lib/services/admin';
import { getAgencyProfile, AgencyDoc } from '@/lib/services/agencies';
import * as LucideIcons from 'lucide-react';
import { 
  LayoutDashboard, Users, HardHat, Building2, 
  Briefcase, ShieldCheck, BookOpen, Bell, 
  ClipboardList, Settings, LogOut, Network, ExternalLink, Download, MessageSquare, Megaphone, Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/toast';

/* ─── Shared Theme ───────────────────────────────────────────── */
const C = {
  primary: '#0064dc', // Requested bright blue
  primaryHover: '#0055b8',
  bg: '#F3F6F8', // Sleek, cool-toned light gray
  white: '#FFFFFF',
  text: '#0F172A', // Slate 900
  muted: '#64748B', // Slate 500
  light: '#CBD5E1', // Slate 300
  border: '#E2E8F0', // Slate 200
  faint: '#F8FAFC', // Slate 50
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

type View = 'dashboard' | 'users' | 'workers' | 'agencies' | 'jobs' | 'verification' | 'content' | 'taxonomies' | 'promotions' | 'support' | 'notifications' | 'audit' | 'settings';

/* ─── UI Components ────────────────────────────────────────── */

const Card = ({ children, style }: any) => (
  <div style={{ background: C.white, borderRadius: 24, padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: `1px solid rgba(0,0,0,0.02)`, ...style }}>
    {children}
  </div>
);

const Badge = ({ children, color = C.primary, style }: any) => (
  <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:`${color}15`, color, border: `1px solid ${color}30`, ...style }}>
    {children}
  </span>
);

const Input = (props: any) => (
  <input {...props} style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', ...props.style }} 
    onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}20`; }}
    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'; }}
  />
);

const Select = (props: any) => (
  <select {...props} style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:'#fff', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', ...props.style }} 
    onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}20`; }}
    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'; }}
  />
);

const BouncingDots = () => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
    <style>{`
      @keyframes admin-bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
      .admin-dot {
        width: 6px;
        height: 6px;
        background-color: currentColor;
        border-radius: 50%;
        animation: admin-bounce 1.4s infinite ease-in-out both;
      }
      .admin-dot:nth-child(2) { animation-delay: -0.32s; }
      .admin-dot:nth-child(3) { animation-delay: -0.16s; }
      .admin-dot:nth-child(4) { animation-delay: 0s; }
    `}</style>
    <div className="admin-dot" />
    <div className="admin-dot" />
    <div className="admin-dot" />
  </div>
);

const Button = ({ children, variant = 'primary', onClick, style, disabled, isLoading, className = '', type = 'button' }: any) => {
  const isDisabled = disabled || isLoading;
  const bg = isDisabled && !isLoading ? C.border : variant === 'primary' ? C.primary : variant === 'danger' ? C.danger : 'transparent';
  const color = isDisabled && !isLoading ? C.light : variant === 'outline' ? C.text : '#fff';
  const border = variant === 'outline' ? `1px solid ${C.border}` : 'none';
  return (
    <button type={type} className={`admin-btn ${className}`} onClick={onClick} disabled={isDisabled} style={{ position: 'relative', display:'flex', alignItems:'center', justifyContent:'center', padding:'12px 20px', borderRadius:12, background:bg, color, border, fontWeight:600, fontSize:14, cursor: isDisabled ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'all 0.2s ease', opacity: isDisabled ? 0.8 : 1, boxShadow: variant === 'primary' && !isDisabled ? `0 4px 14px ${C.primary}40` : 'none', ...style }}>
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
      </div>
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BouncingDots />
        </div>
      )}
    </button>
  );
};

const ExportButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '10px 18px', gap: 4, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  }}
  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <Download size={18} color={C.text} style={{ opacity: 0.8 }} />
    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Export CSV</span>
  </button>
);

const Table = ({ headers, children }: any) => (
  <div style={{ overflowX: 'auto', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
      <thead>
        <tr style={{ background: C.faint, borderBottom: `1px solid ${C.border}` }}>
          {headers.map((h: any, i: number) => (
            <th key={i} style={{ padding: '16px 20px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Td = ({ children, style }: any) => (
  <td className="admin-td" style={{ padding: '18px 20px', borderBottom: `1px solid ${C.faint}`, color: C.text, transition: 'background 0.2s', ...style }}>{children}</td>
);

const Modal = ({ title, onClose, children, maxWidth = 500 }: any) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div style={{ background:C.white, borderRadius:20, width:'100%', maxWidth, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 10px 40px rgba(0,0,0,0.2)' }}>
      <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.faint}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>{title}</h2>
        <button onClick={onClose} style={{ background:'transparent', border:'none', fontSize:20, cursor:'pointer', color:C.muted }}>×</button>
      </div>
      <div style={{ padding:24 }}>
        {children}
      </div>
    </div>
  </div>
);

/* ─── Main Admin Page ────────────────────────────────────────── */

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [email,  setEmail]    = useState('');
  const [pass,   setPass]     = useState('');
  const [err,    setErr]      = useState('');
  
  const [view,   setView]     = useState<View>('dashboard');
  const [ready,  setReady]    = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mbOpen, setMbOpen]   = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Global Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [certs, setCerts] = useState<AdminCert[]>([]);
  const [prepCards, setPrepCards] = useState<AdminPrepCard[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@tradematch.com';
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'tradematch@2026';

  useEffect(() => {
    setAuthed(sessionStorage.getItem('tm_admin') === '1');
    setReady(true);
  }, []);

  useEffect(() => {
    if (authed) {
      loadData();
    }
  }, [authed, view]);

  useEffect(() => {
    if (authed && view === 'support') {
      const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'), limit(100));
      const unsub = onSnapshot(q, (snap) => {
        setSupportTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)));
      }, (error) => {
        console.error('Real-time support ticket error:', error);
      });
      return () => unsub();
    }
  }, [authed, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [newStats, newUsers, newJobs] = await Promise.all([
        getDashboardStats(),
        getAllUsers(500),
        getAllJobs(200),
      ]);
      setStats(newStats);
      setUsers(newUsers);
      setJobs(newJobs);
      if (view === 'content') {
        setCerts(await getAllCerts());
        setPrepCards(await getAllPrepCards());
      }
      if (view === 'notifications') setNotifications(await getNotifications());
      if (view === 'promotions') setPromotions(await getPromotions());
      if (view === 'audit') setAuditLog(getAuditLog());
    } catch (e: any) {
      console.error(e);
      alert('Error loading data: ' + e.message);
    }
    setLoading(false);
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === adminEmail && pass === adminPass) {
      sessionStorage.setItem('tm_admin','1');
      setAuthed(true); setErr('');
    } else {
      setErr('Incorrect email or password.');
    }
  };

  const logout = () => { sessionStorage.removeItem('tm_admin'); setAuthed(false); setEmail(''); setPass(''); };

  if (!ready) return null;

  /* ─── Login Screen ─────────────────────────────────────────── */
  if (!authed) {
    return (
      <div style={{ display:'flex', height:'100vh', background: C.bg, alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
        <Card style={{ width:400, padding:40, textAlign:'center' }}>
          <div style={{ width:180, height:44, margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/logo-v3.png" alt="TradeMatch" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          </div>
          <h1 style={{ fontSize:24, fontWeight:800, margin:'0 0 8px', color: C.text }}>Admin Panel</h1>
          <p style={{ color: C.muted, margin:'0 0 32px', fontSize:14 }}>Sign in to manage TradeMatch</p>
          
          <form onSubmit={login} style={{ display:'flex', flexDirection:'column', gap:16, textAlign:'left' }}>
            {err && <div style={{ background:`${C.danger}15`, color:C.danger, padding:12, borderRadius:8, fontSize:13, fontWeight:600 }}>{err}</div>}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, marginBottom:6 }}>Email Address</label>
              <Input type="email" required value={email} onChange={(e:any)=>setEmail(e.target.value)} placeholder="admin@tradematch.com" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.muted, marginBottom:6 }}>Password</label>
              <Input type="password" required value={pass} onChange={(e:any)=>setPass(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" style={{ marginTop:8, padding:14 }}>Sign In</Button>
          </form>
        </Card>
      </div>
    );
  }

  const NAV = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'All Users' },
    { id: 'workers', icon: HardHat, label: 'Professionals' },
    { id: 'agencies', icon: Building2, label: 'Companies' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs', badge: jobs.length || undefined },
    { id: 'verification', icon: ShieldCheck, label: 'Verification', badge: stats?.pendingVerification || undefined },
    { id: 'content', icon: BookOpen, label: 'CMS / Content' },
    { id: 'promotions', icon: Megaphone, label: 'Promotions' },
    { id: 'taxonomies', icon: Network, label: 'Taxonomies' },
    { id: 'support', icon: MessageSquare, label: 'Support & Disputes' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'audit', icon: ClipboardList, label: 'Audit Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  /* ─── Utils ─────────────────────────────────────────────────── */
  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date ? cell.toLocaleString() : String(cell);
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ─── Views ─────────────────────────────────────────────────── */

  const DashboardView = () => {
    const userGrowth = useMemo(() => {
      const counts: Record<string, number> = {};
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        counts[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
      }
      users.forEach(u => {
        const date = u.createdAt?.toMillis ? new Date(u.createdAt.toMillis()) : (u as any).createdAt ? new Date((u as any).createdAt) : new Date();
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (counts[key] !== undefined) {
          counts[key]++;
        }
      });
      return Object.entries(counts).map(([date, count]) => ({ date, Users: count }));
    }, [users]);

    const jobsByTrade = useMemo(() => {
      const counts: Record<string, number> = {};
      jobs.forEach(j => {
        const trade = j.trade || 'Other';
        counts[trade] = (counts[trade] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([trade, count]) => ({ trade, Jobs: count }))
        .sort((a,b) => b.Jobs - a.Jobs)
        .slice(0, 7);
    }, [jobs]);

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
        {/* Welcome Header & Quick Actions */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <h2 style={{ fontSize:28, fontWeight:800, margin:'0 0 6px', color:C.text, letterSpacing: -0.5 }}>Welcome back, Admin 👋</h2>
            <p style={{ margin:0, color:C.muted, fontSize:15 }}>Here's what's happening on TradeMatch today.</p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <Button onClick={()=>setView('users')} variant="outline" style={{ display:'flex', alignItems:'center', gap:8, background:C.white }}><Users size={16}/> View Users</Button>
            <Button onClick={()=>setView('jobs')} style={{ display:'flex', alignItems:'center', gap:8 }}><Briefcase size={16}/> Manage Jobs</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:24 }}>
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ color:C.muted, fontSize:14, fontWeight:700, marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>Total Users <div style={{background:`${C.primary}15`, padding:8, borderRadius:12}}><Users size={18} color={C.primary}/></div></div>
            <div style={{ fontSize:40, fontWeight:800, color:C.text, letterSpacing: -1 }}>{stats?.totalUsers || 0}</div>
            <div style={{ fontSize:13, color:C.success, fontWeight:700, marginTop:12, display:'flex', alignItems:'center', gap:4 }}>↗ +12.5% <span style={{color:C.muted, fontWeight:500}}>vs last month</span></div>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:`${C.primary}06`, borderRadius:'50%' }} />
          </Card>
          
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ color:C.muted, fontSize:14, fontWeight:700, marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>Professionals <div style={{background:`${C.primary}15`, padding:8, borderRadius:12}}><HardHat size={18} color={C.primary}/></div></div>
            <div style={{ fontSize:40, fontWeight:800, color:C.text, letterSpacing: -1 }}>{stats?.workers || 0}</div>
            <div style={{ fontSize:13, color:C.success, fontWeight:700, marginTop:12, display:'flex', alignItems:'center', gap:4 }}>↗ +8.2% <span style={{color:C.muted, fontWeight:500}}>vs last month</span></div>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:`${C.primary}06`, borderRadius:'50%' }} />
          </Card>
          
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ color:C.muted, fontSize:14, fontWeight:700, marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>Companies <div style={{background:`${C.primary}15`, padding:8, borderRadius:12}}><Building2 size={18} color={C.primary}/></div></div>
            <div style={{ fontSize:40, fontWeight:800, color:C.text, letterSpacing: -1 }}>{stats?.agencies || 0}</div>
            <div style={{ fontSize:13, color:C.success, fontWeight:700, marginTop:12, display:'flex', alignItems:'center', gap:4 }}>↗ +15.1% <span style={{color:C.muted, fontWeight:500}}>vs last month</span></div>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:`${C.primary}06`, borderRadius:'50%' }} />
          </Card>
          
          <Card style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${C.primary}, #083375)`, border: 'none', boxShadow: `0 12px 32px ${C.primary}40` }}>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:700, marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>Active Jobs <div style={{background:`rgba(255,255,255,0.15)`, padding:8, borderRadius:12}}><Briefcase size={18} color="#fff"/></div></div>
            <div style={{ fontSize:40, fontWeight:800, color:'#fff', letterSpacing: -1 }}>{stats?.activeJobs || 0}</div>
            <div style={{ fontSize:13, color:'#fff', fontWeight:700, marginTop:12, display:'flex', alignItems:'center', gap:4 }}>↗ +24.8% <span style={{color:'rgba(255,255,255,0.7)', fontWeight:500}}>new postings</span></div>
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:`rgba(255,255,255,0.06)`, borderRadius:'50%' }} />
            <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, background:`rgba(255,255,255,0.04)`, borderRadius:'50%' }} />
          </Card>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
          <Card style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text }}>User Growth</h3>
                <p style={{ margin:'4px 0 0', fontSize:13, color:C.muted }}>New signups over the last 14 days</p>
              </div>
              <Badge color={C.primary}>Last 14 Days</Badge>
            </div>
            <div style={{ width: '100%', height: 260, flex:1 }}>
              <ResponsiveContainer>
                <LineChart data={userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.muted}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.muted}} />
                  <RechartsTooltip contentStyle={{borderRadius:16, border:'none', boxShadow:'0 8px 30px rgba(0,0,0,0.12)', padding:'12px 16px', fontWeight:600}} itemStyle={{color:C.primary}} />
                  <Line type="monotone" dataKey="Users" stroke={C.primary} strokeWidth={4} dot={{r:5, fill:C.white, stroke:C.primary, strokeWidth:2}} activeDot={{r:8, strokeWidth:0, fill:C.primary}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text }}>Jobs by Trade</h3>
                <p style={{ margin:'4px 0 0', fontSize:13, color:C.muted }}>Distribution of active job postings</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 260, flex:1 }}>
              <ResponsiveContainer>
                <BarChart data={jobsByTrade} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.muted}} />
                  <YAxis type="category" dataKey="trade" axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.text, fontWeight:600}} width={90} />
                  <RechartsTooltip cursor={{fill:C.faint}} contentStyle={{borderRadius:16, border:'none', boxShadow:'0 8px 30px rgba(0,0,0,0.12)', padding:'12px 16px', fontWeight:600}} itemStyle={{color:C.primary}} />
                  <Bar dataKey="Jobs" fill={C.primary} radius={[0,6,6,0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
          <Card>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Recent Signups</h3>
              <Button variant="outline" onClick={()=>setView('users')} style={{ padding:'6px 14px', fontSize:12 }}>View All</Button>
            </div>
            <Table headers={['User Details', 'Role', 'Date']}>
              {stats?.recentUsers?.map(u => (
                <tr key={u.id}>
                  <Td>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:C.faint, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:C.primary }}>
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{u.name || 'Unnamed User'}</div>
                        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{u.email || u.phone}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge color={u.role === 'agency' ? C.warning : C.primary}>{u.role}</Badge></Td>
                  <Td style={{ color: C.muted, fontSize: 13, fontWeight:500 }}>{u.createdAt?.toMillis ? new Date(u.createdAt.toMillis()).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : new Date().toLocaleDateString('en-US', {month:'short', day:'numeric'})}</Td>
                </tr>
              ))}
              {!stats?.recentUsers?.length && <tr><Td colSpan={3} style={{textAlign:'center', color:C.muted, padding:30}}>No recent users</Td></tr>}
            </Table>


          </Card>

          <Card>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Recent Jobs</h3>
              <Button variant="outline" onClick={()=>setView('jobs')} style={{ padding:'6px 14px', fontSize:12 }}>Manage Jobs</Button>
            </div>
            <Table headers={['Position', 'Trade', 'Status']}>
              {stats?.recentJobs?.map(j => (
                <tr key={j.id}>
                  <Td>
                    <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{j.title}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                      <Building2 size={10} /> {j.company || j.country}
                    </div>
                  </Td>
                  <Td><span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{j.trade}</span></Td>
                  <Td><Badge color={j.active ? C.success : C.muted}>{j.active ? 'Active' : 'Closed'}</Badge></Td>
                </tr>
              ))}
              {!stats?.recentJobs?.length && <tr><Td colSpan={3} style={{textAlign:'center', color:C.muted, padding:30}}>No recent jobs</Td></tr>}
            </Table>
          </Card>
        </div>
      </div>
    );
  };

  const UsersList = ({ filterRole, title }: { filterRole?: 'worker' | 'agency', title: string }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
    const [viewingAgencyDoc, setViewingAgencyDoc] = useState<AgencyDoc | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isRegisteringCompany, setIsRegisteringCompany] = useState(false);
    const [newCompany, setNewCompany] = useState<any>({ companyName: '', email: '', password: '', country: '', address: '', city: '', website: '', targetTrades: '', targetCountries: '', businessLicenseFile: null });
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    useEffect(() => {
      if (viewingUser?.role === 'agency') {
        getAgencyProfile(viewingUser.id).then(setViewingAgencyDoc);
      } else {
        setViewingAgencyDoc(null);
      }
    }, [viewingUser]);

    const filtered = users.filter(u => {
      if (filterRole && u.role !== filterRole) return false;
      if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
      
      const computedStatus = u.adminStatus === 'suspended' ? 'suspended' : (u.role === 'agency' && u.accountStatus !== 'approved' ? 'pending' : 'active');
      if (statusFilter !== 'all' && computedStatus !== statusFilter) return false;
      
      return true;
    });

    const handleSuspend = async (u: AdminUser) => {
      setConfirmDialog({
        title: 'Confirm Action',
        message: `Are you sure you want to ${u.adminStatus === 'suspended' ? 'unsuspend' : 'suspend'} ${u.name}?`,
        onConfirm: async () => {
          setConfirmDialog(null);
          setUpdatingId(u.id);
          try {
            const isSuspended = u.adminStatus !== 'suspended';
            await setUserSuspended(u.id, isSuspended, adminEmail);
            toast.success(`User ${isSuspended ? 'suspended' : 'unsuspended'} successfully`);
            const nextStatus = isSuspended ? 'suspended' : 'active';
            setUsers(users.map(user => user.id === u.id ? { ...user, adminStatus: nextStatus } : user));
            if (viewingUser?.id === u.id) setViewingUser({ ...u, adminStatus: nextStatus });
          } finally {
            setUpdatingId(null);
          }
        }
      });
    };

    const handleRegisterCompany = async (e: any) => {
      e.preventDefault();
      setIsSavingCompany(true);
      try {
        const uid = await createCompanyUser(newCompany, adminEmail);
        toast.success('Company registered successfully!');
        setIsRegisteringCompany(false);
        setNewCompany({ companyName: '', email: '', password: '', country: '', address: '', city: '', website: '', targetTrades: '', targetCountries: '', businessLicenseFile: null });
        // Refresh users list
        const updatedUsers = await getAllUsers();
        setUsers(updatedUsers);
      } catch (err: any) {
        toast.error(err.message || 'Failed to register company');
      } finally {
        setIsSavingCompany(false);
      }
    };

    const handleApprove = async (u: AdminUser) => {
      setConfirmDialog({
        title: 'Approve User',
        message: `Approve ${u.name} for platform access?`,
        onConfirm: async () => {
          setConfirmDialog(null);
          setUpdatingId(u.id);
          try {
            await adminUpdateUserStatus(u.id, 'approved', adminEmail);
            toast.success('User approved successfully');
            setUsers(users.map(user => user.id === u.id ? { ...user, accountStatus: 'approved' } : user));
            if (viewingUser?.id === u.id) setViewingUser({ ...u, accountStatus: 'approved' });
          } finally {
            setUpdatingId(null);
          }
        }
      });
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ margin:0, fontSize:18 }}>{title} ({filtered.length})</h3>
          {filterRole === 'agency' && (
            <Button onClick={() => setIsRegisteringCompany(true)}>+ Register Company</Button>
          )}
          <div style={{ display:'flex', gap: 12, flexWrap: 'wrap' }}>
            <Select value={statusFilter} onChange={(e:any) => setStatusFilter(e.target.value)} style={{ width: 160, padding: '8px 12px' }}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              {filterRole !== 'worker' && <option value="pending">Pending Approval</option>}
              <option value="suspended">Suspended</option>
            </Select>
            <Input placeholder="Search name or email..." value={search} onChange={(e:any)=>setSearch(e.target.value)} style={{ width:250, padding:'8px 12px' }} />
            <ExportButton onClick={() => exportToCSV('users.csv', filtered.map(u => ({
                ID: u.id,
                Name: u.name,
                Email: u.email,
                Phone: u.phone,
                Role: u.role,
                Trade: u.trade,
                Status: u.accountStatus,
                AdminStatus: u.adminStatus,
                Location: u.city ? `${u.city}, ${u.country}` : u.country
            })))} />
          </div>
        </div>
        <Table headers={['User', 'Role/Trade', 'Location', 'Status', 'Actions']}>
          {filtered.map(u => (
            <tr key={u.id} style={{ opacity: updatingId === u.id ? 0.5 : (u.adminStatus === 'suspended' ? 0.7 : 1), transition: 'opacity 0.2s' }}>
              <Td>
                <div style={{ fontWeight:700, fontSize: 14 }}>{u.name || 'Unnamed'}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop: 2 }}>{u.email || u.phone}</div>
              </Td>
              <Td>
                <Badge color={u.role === 'agency' ? C.warning : C.primary} style={{ textTransform: 'capitalize' }}>{u.role}</Badge>
                {u.role === 'worker' && <div style={{ fontSize:12, marginTop:4, color: C.muted, fontWeight: 500 }}>{u.trade}</div>}
              </Td>
              <Td>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                  {u.city ? `${u.city}, ${u.country}` : u.country}
                </div>
              </Td>
              <Td>
                {u.adminStatus === 'suspended' ? (
                  <Badge color={C.danger}>Suspended</Badge>
                ) : u.role === 'agency' && u.accountStatus !== 'approved' ? (
                  <Badge color={C.warning}>Pending Approval</Badge>
                ) : (
                  <Badge color={C.success}>Active</Badge>
                )}
              </Td>
              <Td>
                <div style={{ display:'flex', gap:8 }}>
                  <Button variant="outline" style={{ padding:'6px 12px', fontSize:12 }} onClick={()=>setViewingUser(u)}>
                    View Details
                  </Button>
                  {u.role === 'agency' && u.accountStatus !== 'approved' && (
                    <Button style={{ padding:'6px 12px', fontSize:12, background: C.success }} onClick={()=>handleApprove(u)} isLoading={updatingId === u.id}>
                      Approve
                    </Button>
                  )}
                  <Button variant="outline" style={{ padding:'6px 12px', fontSize:12, color: u.adminStatus === 'suspended' ? C.success : C.danger, borderColor: u.adminStatus === 'suspended' ? `${C.success}30` : `${C.danger}30` }} onClick={()=>handleSuspend(u)} isLoading={updatingId === u.id}>
                    {u.adminStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={5} style={{textAlign:'center', color:C.muted, padding: 32}}>No users found matching your criteria.</Td></tr>}
        </Table>

        {viewingUser && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
            <Card style={{ width:650, maxHeight:'85vh', overflowY:'auto', padding: 0, display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: `1px solid ${C.faint}` }}>
              <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems: 'center', background: C.faint, position: 'sticky', top: 0, zIndex: 10 }}>
                <div>
                  <h3 style={{ margin:0, fontSize:20, fontWeight: 800, color: C.text }}>{viewingUser.name || 'User Profile'}</h3>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>ID: {viewingUser.id}</div>
                </div>
                <button onClick={()=>setViewingUser(null)} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', color: C.muted, padding: 4 }}>×</button>
              </div>
              
              <div style={{ padding: 32, display:'flex', flexDirection:'column', gap:24 }}>
                
                {/* Core Profile Info */}
                <div>
                  <h4 style={{ margin:'0 0 12px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5, color: C.muted }}>Core Profile</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: C.faint, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Email Address</span><strong style={{ fontSize: 14 }}>{viewingUser.email || 'N/A'}</strong></div>
                    <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Phone Number</span><strong style={{ fontSize: 14 }}>{viewingUser.phone || 'N/A'}</strong></div>
                    <div>
                      <span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>Role / Type</span>
                      <Badge color={viewingUser.role === 'agency' ? C.warning : C.primary} style={{ textTransform: 'capitalize' }}>{viewingUser.role}</Badge>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>System Status</span>
                      {viewingUser.adminStatus === 'suspended' ? (
                        <Badge color={C.danger}>Suspended</Badge>
                      ) : viewingUser.role === 'agency' && viewingUser.accountStatus !== 'approved' ? (
                        <Badge color={C.warning}>Pending Approval</Badge>
                      ) : (
                        <Badge color={C.success}>Active</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Agency Specific Info */}
                {viewingUser.role === 'agency' && (
                  <div>
                    <h4 style={{ margin:'0 0 12px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5, color: C.muted }}>Agency Onboarding Data</h4>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Country HQ</span><strong style={{ fontSize: 14 }}>{viewingUser.country || 'N/A'}</strong></div>
                        
                        {viewingAgencyDoc ? (
                          <>
                            <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Company Name</span><strong style={{ fontSize: 14 }}>{viewingAgencyDoc.companyName || 'N/A'}</strong></div>
                            <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Business Email</span><strong style={{ fontSize: 14 }}>{viewingAgencyDoc.businessEmail || 'N/A'}</strong></div>
                            <div style={{ gridColumn: '1 / -1' }}><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Address</span><strong style={{ fontSize: 14 }}>{viewingAgencyDoc.address || 'N/A'}, {viewingAgencyDoc.city || 'N/A'}, {viewingAgencyDoc.country || 'N/A'}</strong></div>
                            <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Website</span><strong>{viewingAgencyDoc.website ? <a href={viewingAgencyDoc.website} target="_blank" rel="noreferrer" style={{ color:C.primary, textDecoration:'underline' }}>{viewingAgencyDoc.website}</a> : 'N/A'}</strong></div>
                            <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Target Trades</span><strong style={{ fontSize: 14 }}>{viewingAgencyDoc.hiringTrades?.join(', ') || 'N/A'}</strong></div>
                            <div><span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 2 }}>Target Countries</span><strong style={{ fontSize: 14 }}>{viewingAgencyDoc.hiringCountries?.join(', ') || 'N/A'}</strong></div>
                            
                            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                              <span style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 8 }}>Business License</span>
                              {viewingAgencyDoc.businessLicenseUrl ? (
                                <a href={viewingAgencyDoc.businessLicenseUrl} target="_blank" rel="noreferrer" style={{ color:C.primary, display:'inline-flex', alignItems:'center', gap:8, padding: '10px 16px', background: `${C.primary}10`, borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                  <LucideIcons.FileText size={18} /> View Document <ExternalLink size={14} />
                                </a>
                              ) : (
                                <span style={{ color: C.danger, fontSize: 14, fontWeight: 600 }}>Not uploaded</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div style={{ gridColumn: '1 / -1', padding: 20, textAlign: 'center', color: C.muted, background: C.faint, borderRadius: 8 }}>
                            Agency profile data has not been completed yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div style={{ display:'flex', justifyContent:'flex-end', gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 24, marginTop: 8 }}>
                  <Button style={{ padding:'10px 16px', fontSize:14, background: C.faint, color: C.text }} onClick={() => {
                    alert(`Magic login link generated for ${viewingUser.name}. In a full production app, this would securely log you in as them in a new tab.`);
                  }}>
                    <Network size={16} style={{marginRight:6}} /> Login As User
                  </Button>
                  
                  {viewingUser.role === 'agency' && viewingUser.accountStatus !== 'approved' && (
                    <Button style={{ padding:'10px 16px', fontSize:14, background: C.success }} onClick={() => handleApprove(viewingUser)} isLoading={updatingId === viewingUser.id}>
                      <LucideIcons.CheckCircle size={16} style={{marginRight:6}} /> Approve Agency
                    </Button>
                  )}
                  
                  <Button style={{ padding:'10px 16px', fontSize:14, background: viewingUser.adminStatus === 'suspended' ? C.success : C.danger }} onClick={() => handleSuspend(viewingUser)} isLoading={updatingId === viewingUser.id}>
                    {viewingUser.adminStatus === 'suspended' ? <LucideIcons.ShieldCheck size={16} style={{marginRight:6}} /> : <LucideIcons.ShieldAlert size={16} style={{marginRight:6}} />}
                    {viewingUser.adminStatus === 'suspended' ? 'Unsuspend Account' : 'Suspend Account'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {isRegisteringCompany && (
          <Modal title="Register New Company" onClose={() => setIsRegisteringCompany(false)} maxWidth={700}>
            <form onSubmit={handleRegisterCompany} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">Company Name</label>
                  <Input value={newCompany.companyName} onChange={(e:any)=>setNewCompany({...newCompany, companyName:e.target.value})} required placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">Business Email</label>
                  <Input type="email" value={newCompany.email} onChange={(e:any)=>setNewCompany({...newCompany, email:e.target.value})} required placeholder="admin@acme.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">Password</label>
                  <Input type="password" value={newCompany.password} onChange={(e:any)=>setNewCompany({...newCompany, password:e.target.value})} required minLength={6} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">Website</label>
                  <Input value={newCompany.website} onChange={(e:any)=>setNewCompany({...newCompany, website:e.target.value})} placeholder="https://acme.com" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1 text-gray-700">Country HQ</label>
                  <Input value={newCompany.country} onChange={(e:any)=>setNewCompany({...newCompany, country:e.target.value})} required placeholder="e.g. UAE" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1 text-gray-700">City</label>
                  <Input value={newCompany.city} onChange={(e:any)=>setNewCompany({...newCompany, city:e.target.value})} required placeholder="e.g. Dubai" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1 text-gray-700">Full Address</label>
                  <Input value={newCompany.address} onChange={(e:any)=>setNewCompany({...newCompany, address:e.target.value})} placeholder="123 Main St" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">Target Trades (comma separated)</label>
                  <Input value={newCompany.targetTrades} onChange={(e:any)=>setNewCompany({...newCompany, targetTrades:e.target.value})} placeholder="e.g. electrician, plumber" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">Target Countries (comma separated)</label>
                  <Input value={newCompany.targetCountries} onChange={(e:any)=>setNewCompany({...newCompany, targetCountries:e.target.value})} placeholder="e.g. UAE, Saudi Arabia" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-700">Business License Upload</label>
                <input 
                  type="file" 
                  accept="application/pdf,image/*" 
                  onChange={(e:any)=>setNewCompany({...newCompany, businessLicenseFile: e.target.files[0]})} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsRegisteringCompany(false)} className="flex-1 py-3 border-gray-300">Cancel</Button>
                <Button type="submit" isLoading={isSavingCompany} className="flex-1 py-3 text-white" style={{ background: '#0064DC' }}>Create Agency Account</Button>
              </div>
            </form>
          </Modal>
        )}

      </Card>
    );
  };

    const VerificationView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
    const [reviewUser, setReviewUser] = useState<AdminUser | null>(null);

    const filteredUsers = users.filter(u => {
      // Filter by search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }
      
      // Filter by verification status based on active tab
      const idStatus = u.verificationStatus?.identity;
      const certStatus = u.verificationStatus?.certificate;
      
      if (tab === 'pending') {
        return idStatus === 'submitted' || certStatus === 'submitted';
      }
      if (tab === 'verified') {
        return idStatus === 'verified' && certStatus === 'verified';
      }
      if (tab === 'rejected') {
        return idStatus === 'rejected' || certStatus === 'rejected';
      }
      return false;
    });

    const handleVerify = async (user: AdminUser, type: 'identity' | 'certificate', approved: boolean) => {
      try {
        const status = approved ? 'verified' : 'rejected';
        const docRef = doc(db, 'users', user.id);
        await updateDoc(docRef, {
          [`verificationStatus.${type}`]: status
        });

        // Optionally send a notification
        await addDoc(collection(db, 'notifications'), {
          userId: user.id,
          title: 'Verification Update',
          message: `Your ${type} verification has been ${status}.`,
          type: 'system',
          read: false,
          createdAt: serverTimestamp()
        });

        alert(`Successfully ${status} ${type} for ${user.name}`);
      } catch (err: any) {
        alert('Failed to update verification: ' + err.message);
      }
    };

    return (
      <Card>
        {reviewUser ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-[#E8EAF0] pb-6">
               <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#0064DC] text-3xl font-bold shadow-inner">
                     {reviewUser.name?.charAt(0) || reviewUser.email?.charAt(0) || '?'}
                  </div>
                  <div>
                     <div className="text-2xl font-bold text-[#1D1D1F]">{reviewUser.name || 'Unknown User'}</div>
                     <div className="text-[#6B7280]">{reviewUser.email}</div>
                     <div className="text-[#0064DC] font-medium capitalize mt-1">{reviewUser.role} • {reviewUser.trade}</div>
                  </div>
               </div>
               <Button variant="outline" onClick={() => setReviewUser(null)} className="shadow-sm hover:shadow-md transition-all">
                  <LucideIcons.ArrowLeft size={18} className="mr-2" /> Back to Verifications
               </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Identity Verification Card */}
              <div className="bg-white border border-[#E8EAF0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-[#F8FAFC] px-6 py-4 font-bold text-[#1D1D1F] border-b border-[#E8EAF0] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <LucideIcons.UserCheck size={20} className="text-[#0064DC]" /> Identity Document
                  </div>
                  {reviewUser.verificationStatus?.identity && reviewUser.verificationStatus.identity !== 'unverified' && (
                    <Badge color={reviewUser.verificationStatus.identity === 'verified' ? C.success : reviewUser.verificationStatus.identity === 'submitted' ? C.warning : C.danger}>
                      Status: {reviewUser.verificationStatus.identity}
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  {reviewUser.verificationStatus?.identity === 'unverified' ? (
                    <div className="text-[#6B7280] flex flex-col items-center justify-center py-10">
                      <LucideIcons.FileQuestion size={48} className="opacity-20 mb-3" />
                      <p>No document submitted yet.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-end mb-4">
                         <a href="#" className="text-[#0064DC] text-sm font-semibold flex items-center hover:underline">
                           <LucideIcons.ExternalLink size={16} className="mr-1" /> View Original Document
                         </a>
                      </div>
                      <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-8 shadow-inner flex flex-col items-center justify-center h-56 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-16 bg-gradient-to-r from-[#0064DC] to-[#3B82F6] opacity-10"></div>
                        <LucideIcons.IdCard size={64} className="text-[#0064DC] mb-4 z-10" strokeWidth={1} />
                        <div className="text-xl font-bold text-[#1E293B] z-10">Government Identity Card</div>
                        <div className="text-sm text-[#475569] z-10 font-mono mt-2 bg-white px-3 py-1 rounded-md border border-[#E2E8F0]">ID: {reviewUser.id.substring(0, 10).toUpperCase()}</div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                        <Button className="flex-1 shadow-sm hover:shadow-md transition-all py-3" style={{ background: C.success }} onClick={() => handleVerify(reviewUser, 'identity', true)}>
                          <LucideIcons.CheckCircle size={18} className="mr-2" /> Approve Identity
                        </Button>
                        <Button className="flex-1 shadow-sm hover:shadow-md transition-all py-3" style={{ background: C.danger }} onClick={() => handleVerify(reviewUser, 'identity', false)}>
                          <LucideIcons.XCircle size={18} className="mr-2" /> Reject Identity
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Verification Card */}
              <div className="bg-white border border-[#E8EAF0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-[#FEFCE8] px-6 py-4 font-bold text-[#1D1D1F] border-b border-[#FEF08A] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <LucideIcons.Award size={20} className="text-[#EAB308]" /> Professional Certificate
                  </div>
                  {reviewUser.verificationStatus?.certificate && reviewUser.verificationStatus.certificate !== 'unverified' && (
                    <Badge color={reviewUser.verificationStatus.certificate === 'verified' ? C.success : reviewUser.verificationStatus.certificate === 'submitted' ? C.warning : C.danger}>
                      Status: {reviewUser.verificationStatus.certificate}
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  {reviewUser.verificationStatus?.certificate === 'unverified' ? (
                    <div className="text-[#6B7280] flex flex-col items-center justify-center py-10">
                      <LucideIcons.FileQuestion size={48} className="opacity-20 mb-3" />
                      <p>No certificate submitted yet.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-end mb-4">
                         <a href="#" className="text-[#0064DC] text-sm font-semibold flex items-center hover:underline">
                           <LucideIcons.ExternalLink size={16} className="mr-1" /> View Original Certificate
                         </a>
                      </div>
                      <div className="bg-[#FAF9F6] border-2 border-dashed border-[#D1D5DB] rounded-xl p-8 flex flex-col items-center justify-center h-56 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 border-[12px] border-[#F59E0B] rounded-full opacity-10"></div>
                        <LucideIcons.BadgeCheck size={64} className="text-[#F59E0B] mb-4 z-10" strokeWidth={1} />
                        <div className="text-xl font-bold text-[#1E293B] z-10">Trade Certificate</div>
                        <div className="text-md text-[#475569] z-10 mt-2 capitalize font-medium">{reviewUser.trade || 'General'} Specialization</div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                        <Button className="flex-1 shadow-sm hover:shadow-md transition-all py-3" style={{ background: C.success }} onClick={() => handleVerify(reviewUser, 'certificate', true)}>
                          <LucideIcons.CheckCircle size={18} className="mr-2" /> Approve Certificate
                        </Button>
                        <Button className="flex-1 shadow-sm hover:shadow-md transition-all py-3" style={{ background: C.danger }} onClick={() => handleVerify(reviewUser, 'certificate', false)}>
                          <LucideIcons.XCircle size={18} className="mr-2" /> Reject Certificate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1D1D1F]">Verification Center</h2>
                <p className="text-sm text-[#6B7280] mt-1">Review identity and professional certificates</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <LucideIcons.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <Input 
                    placeholder="Search users..." 
                    value={searchTerm} 
                    onChange={(e: any) => setSearchTerm(e.target.value)} 
                    className="pl-10 w-full sm:w-[250px]"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
                <Select value={tab} onChange={(e: any) => setTab(e.target.value)} className="w-full sm:w-auto">
                  <option value="pending">Pending Review</option>
                  <option value="verified">Verified Users</option>
                  <option value="rejected">Rejected / Needs Attention</option>
                </Select>
              </div>
            </div>
            
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-[#6B7280] border border-dashed border-[#E8EAF0] rounded-2xl">
                <LucideIcons.ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
                <div className="font-semibold text-base text-[#1D1D1F]">No {tab} verifications</div>
                <div className="text-sm mt-1">
                  {tab === 'pending' ? 'All caught up! Excellent work. 🎉' : 'Try adjusting your search filters.'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table headers={['User', 'Role', 'Status', 'Actions']}>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#0064DC] font-bold shrink-0 shadow-sm border border-[#E8EAF0]">
                            {u.name?.charAt(0) || u.email?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate text-[#1D1D1F]">{u.name || 'Unknown User'}</div>
                            <div className="text-xs text-[#6B7280] truncate">{u.email}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge color={C.text} style={{ background: C.faint, border: `1px solid ${C.border}`, textTransform: 'capitalize' }}>
                          {u.role || 'Worker'}
                        </Badge>
                        <div className="text-xs text-[#6B7280] mt-1 capitalize whitespace-nowrap">
                          {u.trade || 'N/A'} • {u.country || 'N/A'}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col gap-1 items-start">
                          {u.verificationStatus?.identity && (
                            <Badge color={
                              u.verificationStatus.identity === 'verified' ? C.success :
                              u.verificationStatus.identity === 'submitted' ? C.warning : C.danger
                            }>
                              ID: {u.verificationStatus.identity}
                            </Badge>
                          )}
                          {u.verificationStatus?.certificate && (
                            <Badge color={
                              u.verificationStatus.certificate === 'verified' ? C.success :
                              u.verificationStatus.certificate === 'submitted' ? C.warning : C.danger
                            }>
                              Cert: {u.verificationStatus.certificate}
                            </Badge>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <Button variant="outline" className="px-4 py-2 text-sm whitespace-nowrap shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border-[#E8EAF0]" onClick={() => setReviewUser(u)}>
                          Review Documents <LucideIcons.ArrowRight size={14} className="ml-2" />
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </Table>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };
  const JobsView = () => {
    const [editing, setEditing] = useState<Partial<AdminJob> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isSaving, setIsSaving] = useState(false);

    const filteredJobs = jobs.filter(j => {
      if (statusFilter === 'active' && !j.active) return false;
      if (statusFilter === 'draft' && j.active) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return j.title.toLowerCase().includes(query) || (j.company && j.company.toLowerCase().includes(query)) || (j.trade?.toLowerCase().includes(query) ?? false);
      }
      return true;
    });

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        if (editing?.id) {
          await updateJob(editing.id, editing, adminEmail);
          toast.success('Job updated successfully');
        } else {
          await createJob(editing as any, adminEmail);
          toast.success('Job created successfully');
        }
        setEditing(null);
        loadData();
      } finally {
        setIsSaving(false);
      }
    };

    const handleDelete = async (id: string) => {
      setConfirmDialog({
        title: 'Delete Job',
        message: 'Delete this job permanently? This action cannot be undone.',
        onConfirm: async () => {
          await deleteJob(id, adminEmail);
          toast.success('Job deleted successfully');
          loadData();
        }
      });
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight: 700, color: C.text }}>Job Postings ({filteredJobs.length})</h3>
          <div style={{ display:'flex', gap: 12 }}>
            <ExportButton onClick={() => exportToCSV('jobs.csv', filteredJobs.map(j => ({
                ID: j.id,
                Title: j.title,
                Trade: j.trade,
                Company: j.company,
                Country: j.country,
                Status: j.active ? 'Active' : 'Inactive',
                CreatedAt: j.postedAt ? new Date((j.postedAt as any).seconds * 1000).toLocaleString() : ''
            })))} />
            <Button onClick={()=>setEditing({ title:'', trade:'electrician', country:'', requiredSkills:[], requiredCerts:[], company:'' })}>+ Create Job</Button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: 12, color: C.muted }}><LucideIcons.Search size={16} /></div>
            <Input 
              placeholder="Search jobs by title, company, or trade..." 
              value={searchTerm} 
              onChange={(e: any) => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: 40 }} 
            />
          </div>
          <Select value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Drafts / Inactive</option>
          </Select>
        </div>

        {filteredJobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 16 }}>
            <LucideIcons.Briefcase size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, fontSize: 16, color: C.text }}>No jobs found</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your search or filters.</div>
          </div>
        ) : (
          <Table headers={['Job Title', 'Trade', 'Location', 'Status', 'Actions']}>
            {filteredJobs.map(j => (
              <tr key={j.id}>
                <Td>
                  <div style={{ fontWeight:600 }}>{j.title}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{j.company || 'Unknown Company'}</div>
                </Td>
                <Td><Badge color={C.text} style={{ background: C.faint, border: `1px solid ${C.border}` }}>{j.trade}</Badge></Td>
                <Td>{j.country}</Td>
                <Td>
                  <Badge color={j.active ? C.success : C.muted}>{j.active ? 'Active' : 'Draft/Closed'}</Badge>
                </Td>
                <Td>
                  <div style={{ display:'flex', gap:8 }}>
                    <Button variant="outline" style={{ padding:'6px 12px', fontSize:12 }} onClick={()=>setEditing(j)}>Edit</Button>
                    <Button variant="outline" style={{ padding:'6px 12px', fontSize:12, color:C.danger, borderColor:C.danger }} onClick={()=>handleDelete(j.id)}>Delete</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}

        {editing && (
          <Modal title={editing.id ? 'Edit Job' : 'Create Job'} onClose={()=>setEditing(null)}>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16, maxHeight: '80vh', overflowY: 'auto', paddingRight: 8 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Job Title</label>
                <Input value={editing.title} onChange={(e:any)=>setEditing({...editing, title:e.target.value})} placeholder="e.g. Senior Master Plumber" required />
              </div>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Registered Company</label>
                  <Select 
                    value={editing.postedBy || ''} 
                    onChange={(e:any)=>{
                      const companyId = e.target.value;
                      if (!companyId) {
                        setEditing({...editing, postedBy: '', company: ''});
                        return;
                      }
                      const agency = users.find(u => u.id === companyId);
                      setEditing({...editing, postedBy: companyId, company: agency ? agency.name : editing.company});
                    }}
                  >
                    <option value="">-- Select Company --</option>
                    {users.filter(u => u.role === 'agency').map(agency => (
                      <option key={agency.id} value={agency.id}>{agency.name} ({agency.email})</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Trade Category</label>
                  <Select value={editing.trade} onChange={(e:any)=>setEditing({...editing, trade:e.target.value})}>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="welder">Welder</option>
                    <option value="general">General Laborer</option>
                    <option value="manager">Manager</option>
                  </Select>
                </div>
              </div>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Location</label>
                  <Input value={editing.country} onChange={(e:any)=>setEditing({...editing, country:e.target.value})} placeholder="e.g. New York, NY" required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Salary Details</label>
                  <Input value={editing.salary || ''} onChange={(e:any)=>setEditing({...editing, salary:e.target.value})} placeholder="e.g. $85k - $110k / year" />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Job Type</label>
                  <Select value={editing.jobType || 'Full Time'} onChange={(e:any)=>setEditing({...editing, jobType:e.target.value})}>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </Select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Required Skills (comma separated)</label>
                  <Input 
                    value={(editing.requiredSkills || []).join(', ')} 
                    onChange={(e:any) => {
                      const skills = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                      setEditing({...editing, requiredSkills: skills});
                    }} 
                    placeholder="e.g. OSHA 30, Blueprint Reading" 
                  />
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Job Description</label>
                <textarea 
                  value={editing.description || ''} 
                  onChange={(e:any)=>setEditing({...editing, description:e.target.value})} 
                  placeholder="Describe the job role, responsibilities, and requirements in detail..."
                  style={{ 
                    width: '100%', 
                    minHeight: 120, 
                    padding: '12px 16px', 
                    borderRadius: 12, 
                    border: `1px solid ${C.border}`,
                    background: C.faint,
                    color: C.text,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }} 
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input type="checkbox" id="active-checkbox" checked={editing.active || false} onChange={(e:any)=>setEditing({...editing, active:e.target.checked})} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor="active-checkbox" style={{ fontSize:14, fontWeight:600, cursor: 'pointer' }}>Active (Visible to users)</label>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:20 }}>
                <Button type="button" variant="outline" onClick={() => setEditing(null)} style={{ flex: 1 }}>Cancel</Button>
                <Button type="submit" isLoading={isSaving} style={{ flex: 1 }}>Save Job</Button>
              </div>
            </form>
          </Modal>
        )}
      </Card>
    );
  };

  const CMSView = () => {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // New states for Certs and Prep Cards
    const [editingCert, setEditingCert] = useState<any>(null);
    const [editingPrepCard, setEditingPrepCard] = useState<any>(null);

    useEffect(() => {
      getAllCMSBlocks().then(setBlocks);
    }, []);

    const handleSaveBlock = async (e: any) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        await updateCMSBlock(editing.id, editing.value, editing.description, adminEmail);
        toast.success('CMS block updated successfully');
        setEditing(null);
        getAllCMSBlocks().then(setBlocks);
      } finally {
        setIsSaving(false);
      }
    };

    const handleSaveCert = async (e: any) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        if (editingCert.id) {
          await updateCert(editingCert.id, editingCert, adminEmail);
          toast.success('Certification updated');
        } else {
          await createCert(editingCert, adminEmail);
          toast.success('Certification created');
        }
        setEditingCert(null);
        getAllCerts().then(setCerts);
      } catch (err: any) {
        toast.error(err.message || 'Failed to save cert');
      } finally {
        setIsSaving(false);
      }
    };

    const handleDeleteCert = async (id: string) => {
      setConfirmDialog({
        title: 'Delete Certification',
        message: 'Are you sure you want to delete this certification?',
        onConfirm: async () => {
          setConfirmDialog(null);
          try {
            await deleteCert(id, adminEmail);
            toast.success('Certification deleted');
            getAllCerts().then(setCerts);
          } catch {
            toast.error('Failed to delete cert');
          }
        }
      });
    };

    const handleSavePrepCard = async (e: any) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        if (editingPrepCard.id) {
          await updatePrepCard(editingPrepCard.id, editingPrepCard, adminEmail);
          toast.success('Prep Card updated');
        } else {
          await createPrepCard(editingPrepCard, adminEmail);
          toast.success('Prep Card created');
        }
        setEditingPrepCard(null);
        getAllPrepCards().then(setPrepCards);
      } catch (err: any) {
        toast.error(err.message || 'Failed to save prep card');
      } finally {
        setIsSaving(false);
      }
    };

    const handleDeletePrepCard = async (id: string) => {
      setConfirmDialog({
        title: 'Delete Prep Card',
        message: 'Are you sure you want to delete this prep card?',
        onConfirm: async () => {
          setConfirmDialog(null);
          try {
            await deletePrepCard(id, adminEmail);
            toast.success('Prep Card deleted');
            getAllPrepCards().then(setPrepCards);
          } catch {
            toast.error('Failed to delete prep card');
          }
        }
      });
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Static Content Blocks</h3>
          </div>
          <Table headers={['Block ID', 'Type', 'Description', 'Last Updated', 'Actions']}>
            {blocks.map(b => (
              <tr key={b.id}>
                <Td style={{ fontWeight:600 }}>{b.id}</Td>
                <Td>{b.type}</Td>
                <Td>{b.description}</Td>
                <Td>{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : 'N/A'}</Td>
                <Td>
                  <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setEditing(b)}>Edit</Button>
                </Td>
              </tr>
            ))}
            {!blocks.length && <tr><Td colSpan={5} style={{ color:C.muted }}>No CMS blocks found.</Td></tr>}
          </Table>

          {editing && (
            <Modal title={`Edit ${editing.id}`} onClose={() => setEditing(null)}>
              <form onSubmit={handleSaveBlock} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Content</label>
                  {editing.type === 'html' || editing.type === 'text' ? (
                    <textarea 
                      value={typeof editing.value === 'string' ? editing.value : JSON.stringify(editing.value, null, 2)}
                      onChange={(e:any) => setEditing({...editing, value: e.target.value})}
                      style={{ width:'100%', minHeight:200, padding:12, borderRadius:8, border:'1px solid #ccc' }}
                      required
                    />
                  ) : (
                    <textarea 
                      value={typeof editing.value === 'string' ? editing.value : JSON.stringify(editing.value, null, 2)}
                      onChange={(e:any) => {
                        try {
                          setEditing({...editing, value: JSON.parse(e.target.value)});
                        } catch (err) {
                          setEditing({...editing, value: e.target.value});
                        }
                      }}
                      style={{ width:'100%', minHeight:200, padding:12, borderRadius:8, border:'1px solid #ccc', fontFamily:'monospace' }}
                      required
                    />
                  )}
                  <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>
                    {editing.type === 'json' ? 'Please provide valid JSON.' : 'Supports plain text or HTML.'}
                  </p>
                </div>
                <div style={{ display:'flex', gap:12, marginTop:10 }}>
                  <Button type="submit" isLoading={isSaving} style={{ flex:1 }}>Save Changes</Button>
                </div>
              </form>
            </Modal>
          )}
        </Card>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Certifications CMS</h3>
            <Button onClick={() => setEditingCert({ name: '', trade: '', country: '', required: false })}>+ Add Cert</Button>
          </div>
          <Table headers={['Name', 'Trade', 'Country', 'Required', 'Actions']}>
            {certs.map(c => (
              <tr key={c.id}>
                <Td style={{ fontWeight:600 }}>{c.name}</Td>
                <Td>{c.trade}</Td>
                <Td>{c.country}</Td>
                <Td>{c.required ? 'Yes' : 'No'}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setEditingCert(c)}>Edit</Button>
                    <Button variant="danger" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => handleDeleteCert(c.id)}>Delete</Button>
                  </div>
                </Td>
              </tr>
            ))}
            {!certs.length && <tr><Td colSpan={5}>No certs found.</Td></tr>}
          </Table>

          {editingCert && (
            <Modal title={editingCert.id ? 'Edit Certification' : 'New Certification'} onClose={() => setEditingCert(null)}>
              <form onSubmit={handleSaveCert} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Name</label>
                  <Input value={editingCert.name} onChange={(e:any)=>setEditingCert({...editingCert, name:e.target.value})} required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Trade</label>
                  <Input value={editingCert.trade} onChange={(e:any)=>setEditingCert({...editingCert, trade:e.target.value})} required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Country</label>
                  <Input value={editingCert.country} onChange={(e:any)=>setEditingCert({...editingCert, country:e.target.value})} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="cert-req" checked={editingCert.required} onChange={(e:any)=>setEditingCert({...editingCert, required:e.target.checked})} />
                  <label htmlFor="cert-req" style={{ fontSize:14, cursor:'pointer' }}>Required</label>
                </div>
                <div style={{ display:'flex', gap:12, marginTop:10 }}>
                  <Button type="button" variant="outline" onClick={() => setEditingCert(null)} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" isLoading={isSaving} style={{ flex: 1 }}>Save</Button>
                </div>
              </form>
            </Modal>
          )}
        </Card>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Interview Prep CMS</h3>
            <Button onClick={() => setEditingPrepCard({ trade: '', question: '', answer: '', order: 1 })}>+ Add Card</Button>
          </div>
          <Table headers={['Trade', 'Question', 'Order', 'Actions']}>
            {prepCards.map(p => (
              <tr key={p.id}>
                <Td>{p.trade}</Td>
                <Td>{p.question}</Td>
                <Td>{p.order}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setEditingPrepCard(p)}>Edit</Button>
                    <Button variant="danger" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => handleDeletePrepCard(p.id)}>Delete</Button>
                  </div>
                </Td>
              </tr>
            ))}
            {!prepCards.length && <tr><Td colSpan={4}>No prep cards found.</Td></tr>}
          </Table>

          {editingPrepCard && (
            <Modal title={editingPrepCard.id ? 'Edit Prep Card' : 'New Prep Card'} onClose={() => setEditingPrepCard(null)}>
              <form onSubmit={handleSavePrepCard} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Trade</label>
                  <Input value={editingPrepCard.trade} onChange={(e:any)=>setEditingPrepCard({...editingPrepCard, trade:e.target.value})} required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Question</label>
                  <Input value={editingPrepCard.question} onChange={(e:any)=>setEditingPrepCard({...editingPrepCard, question:e.target.value})} required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Answer</label>
                  <textarea 
                    value={editingPrepCard.answer} 
                    onChange={(e:any)=>setEditingPrepCard({...editingPrepCard, answer:e.target.value})}
                    style={{ width:'100%', minHeight:100, padding:12, borderRadius:8, border:'1px solid #ccc', fontSize: 14, fontFamily:'inherit' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Order</label>
                  <Input type="number" value={editingPrepCard.order} onChange={(e:any)=>setEditingPrepCard({...editingPrepCard, order:Number(e.target.value)})} required />
                </div>
                <div style={{ display:'flex', gap:12, marginTop:10 }}>
                  <Button type="button" variant="outline" onClick={() => setEditingPrepCard(null)} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" isLoading={isSaving} style={{ flex: 1 }}>Save</Button>
                </div>
              </form>
            </Modal>
          )}
        </Card>
      </div>
    );
  };
  const TaxonomiesView = () => {
    const [skills, setSkills] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [newCat, setNewCat] = useState('');
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [isAddingCat, setIsAddingCat] = useState(false);
    const [searchSkill, setSearchSkill] = useState('');
    const [searchCat, setSearchCat] = useState('');

    useEffect(() => {
      getTaxonomy('skills').then(setSkills);
      getTaxonomy('job_categories').then(setCategories);
    }, []);

    const handleAddSkill = async (e: any) => {
      e.preventDefault();
      if (!newSkill.trim()) return;
      setIsAddingSkill(true);
      try {
        const updated = await addTaxonomyItem('skills', newSkill.trim(), adminEmail);
        toast.success('Skill added successfully');
        setSkills(updated);
        setNewSkill('');
      } catch {
        toast.error('Failed to add skill');
      } finally {
        setIsAddingSkill(false);
      }
    };

    const handleRemoveSkill = async (skill: string) => {
      setConfirmDialog({
        title: 'Remove Skill',
        message: `Remove skill "${skill}"?`,
        onConfirm: async () => {
          setConfirmDialog(null);
          const updated = await removeTaxonomyItem('skills', skill, adminEmail);
          toast.success('Skill removed successfully');
          setSkills(updated);
        }
      });
    };

    const handleAddCat = async (e: any) => {
      e.preventDefault();
      if (!newCat.trim()) return;
      setIsAddingCat(true);
      try {
        const updated = await addTaxonomyItem('job_categories', newCat.trim(), adminEmail);
        toast.success('Category added successfully');
        setCategories(updated);
        setNewCat('');
      } catch {
        toast.error('Failed to add category');
      } finally {
        setIsAddingCat(false);
      }
    };

    const handleRemoveCat = async (cat: string) => {
      setConfirmDialog({
        title: 'Remove Category',
        message: `Remove category "${cat}"?`,
        onConfirm: async () => {
          setConfirmDialog(null);
          const updated = await removeTaxonomyItem('job_categories', cat, adminEmail);
          toast.success('Category removed successfully');
          setCategories(updated);
        }
      });
    };

    const loadDummyData = async (type: 'skills' | 'job_categories') => {
      const dummySkills = ['Plumbing', 'Electrical', 'Carpentry', 'HVAC', 'Painting', 'Roofing', 'Masonry', 'Landscaping', 'Cleaning', 'Handyman', 'Drywall', 'Flooring', 'Tile Setting', 'Welding', 'Locksmith'];
      const dummyCats = ['Residential Repair', 'Commercial Construction', 'Emergency Services', 'Routine Maintenance', 'Remodeling & Renovation', 'New Installations', 'Inspections & Audits', 'Exterior Work', 'Interior Finishing'];
      
      const itemsToAdd = type === 'skills' ? dummySkills : dummyCats;
      let current = type === 'skills' ? skills : categories;
      
      const setFn = type === 'skills' ? setIsAddingSkill : setIsAddingCat;
      setFn(true);
      try {
        for (const item of itemsToAdd) {
          if (!current.includes(item)) {
            current = await addTaxonomyItem(type, item, adminEmail);
          }
        }
        if (type === 'skills') setSkills(current);
        else setCategories(current);
        toast.success(`Loaded dummy ${type === 'skills' ? 'skills' : 'categories'}!`);
      } finally {
        setFn(false);
      }
    };

    const filteredSkills = skills.filter(s => s.toLowerCase().includes(searchSkill.toLowerCase()));
    const filteredCats = categories.filter(c => c.toLowerCase().includes(searchCat.toLowerCase()));

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20, flexWrap: 'wrap', gap: 16 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Skills Taxonomy ({skills.length})</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <Input 
                placeholder="Search skills..." 
                value={searchSkill} 
                onChange={(e:any)=>setSearchSkill(e.target.value)} 
                style={{ width: 220 }} 
              />
              <Button variant="outline" onClick={() => loadDummyData('skills')} isLoading={isAddingSkill}>
                Load Templates
              </Button>
            </div>
          </div>
          <form onSubmit={handleAddSkill} style={{ display:'flex', gap:10, marginBottom:16 }}>
            <Input placeholder="Add new skill... (e.g. Plumbing)" value={newSkill} onChange={(e:any)=>setNewSkill(e.target.value)} style={{ flex:1 }} />
            <Button type="submit" isLoading={isAddingSkill}>Add Skill</Button>
          </form>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, minHeight: 60, alignContent: 'flex-start', background: C.faint, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
            {filteredSkills.map(s => (
              <Badge key={s} color={C.primary} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', fontSize:13, background: C.white, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {s}
                <span style={{ cursor:'pointer', fontWeight:800, paddingLeft:4, opacity: 0.5, transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.opacity='1'} onMouseLeave={(e)=>e.currentTarget.style.opacity='0.5'} onClick={()=>handleRemoveSkill(s)}>×</span>
              </Badge>
            ))}
            {filteredSkills.length === 0 && <span style={{ color:C.muted, fontSize:13, padding: 8 }}>{searchSkill ? 'No skills match your search.' : 'No skills defined.'}</span>}
          </div>
        </Card>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20, flexWrap: 'wrap', gap: 16 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Job Categories ({categories.length})</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <Input 
                placeholder="Search categories..." 
                value={searchCat} 
                onChange={(e:any)=>setSearchCat(e.target.value)} 
                style={{ width: 220 }} 
              />
              <Button variant="outline" onClick={() => loadDummyData('job_categories')} isLoading={isAddingCat}>
                Load Templates
              </Button>
            </div>
          </div>
          <form onSubmit={handleAddCat} style={{ display:'flex', gap:10, marginBottom:16 }}>
            <Input placeholder="Add new category... (e.g. Residential Repair)" value={newCat} onChange={(e:any)=>setNewCat(e.target.value)} style={{ flex:1 }} />
            <Button type="submit" isLoading={isAddingCat}>Add Category</Button>
          </form>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, minHeight: 60, alignContent: 'flex-start', background: C.faint, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
            {filteredCats.map(c => (
              <Badge key={c} color={C.success} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', fontSize:13, background: C.white, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {c}
                <span style={{ cursor:'pointer', fontWeight:800, paddingLeft:4, opacity: 0.5, transition: '0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.opacity='1'} onMouseLeave={(e)=>e.currentTarget.style.opacity='0.5'} onClick={()=>handleRemoveCat(c)}>×</span>
              </Badge>
            ))}
            {filteredCats.length === 0 && <span style={{ color:C.muted, fontSize:13, padding: 8 }}>{searchCat ? 'No categories match your search.' : 'No categories defined.'}</span>}
          </div>
        </Card>
      </div>
    );
  };

  const PromotionsView = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Partial<Promotion>>({
      title: '', message: '', icon: 'Megaphone', themeColor: 'primary',
      isActive: true, target: 'all', startDate: Date.now(), endDate: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        await savePromotion(editingPromo, adminEmail);
        toast.success(`Popup ${editingPromo.id ? 'updated' : 'created'} successfully`);
        setIsCreating(false);
        loadData();
      } finally {
        setIsSaving(false);
      }
    };

    const handleDelete = async (id: string) => {
      setConfirmDialog({
        title: 'Delete Promotion',
        message: 'Are you sure you want to delete this promotional popup? This action cannot be undone.',
        onConfirm: async () => {
          setConfirmDialog(null);
          await deletePromotion(id, adminEmail);
          toast.success('Popup deleted successfully');
          loadData();
        }
      });
    };

    const handleToggle = async (p: Promotion) => {
      await savePromotion({ id: p.id, title: p.title, isActive: !p.isActive }, adminEmail);
      toast.success(`Popup ${p.isActive ? 'deactivated' : 'activated'} successfully`);
      loadData();
    };

    const loadDemoCampaigns = async () => {
      setIsGenerating(true);
      const demoData: Array<Partial<import('@/lib/services/admin').Promotion>> = [
        { title: 'Welcome Bonus!', message: 'Complete your first job this week to earn a $50 bonus.', icon: 'Gift', themeColor: 'success', target: 'workers', isActive: true },
        { title: 'System Maintenance', message: 'The platform will be down for scheduled maintenance this Sunday from 2 AM to 4 AM EST.', icon: 'Wrench', themeColor: 'warning', target: 'all', isActive: true },
        { title: 'New Feature Alert', message: 'You can now bulk-invite workers to your job sites directly from the dashboard.', icon: 'Zap', themeColor: 'primary', target: 'agencies', isActive: false },
        { title: 'Urgent Action Required', message: 'Please update your billing information to avoid service interruption.', icon: 'AlertTriangle', themeColor: 'danger', target: 'all', isActive: true }
      ];

      try {
        for (const d of demoData) {
          await savePromotion({ ...d, startDate: Date.now(), endDate: Date.now() + 14 * 24 * 60 * 60 * 1000 }, adminEmail);
        }
        toast.success('Loaded dummy campaigns successfully!');
        loadData();
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20, flexWrap: 'wrap', gap: 16 }}>
          <h3 style={{ margin:0, fontSize:18 }}>Promotions & Popups</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="outline" onClick={loadDemoCampaigns} isLoading={isGenerating}>Load Demo Campaigns</Button>
            <Button onClick={() => { 
              setEditingPromo({ title: '', message: '', icon: 'Megaphone', themeColor: 'primary', isActive: true, target: 'all', startDate: Date.now(), endDate: Date.now() + 7 * 24 * 60 * 60 * 1000 });
              setIsCreating(true); 
            }}>+ Create Popup</Button>
          </div>
        </div>

        {isCreating && (
          <div style={{ background:C.faint, padding:20, borderRadius:12, marginBottom:20 }}>
            <h4 style={{ margin:'0 0 16px' }}>{editingPromo.id ? 'Edit' : 'Create'} Popup Campaign</h4>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Title</label>
                <Input value={editingPromo.title} onChange={(e:any)=>setEditingPromo({...editingPromo, title:e.target.value})} required />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Message</label>
                <textarea value={editingPromo.message} onChange={(e:any)=>setEditingPromo({...editingPromo, message:e.target.value})} required style={{ width:'100%', minHeight:80, padding:12, borderRadius:8, border:'1px solid #ccc' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Theme Color</label>
                  <Select value={editingPromo.themeColor} onChange={(e:any)=>setEditingPromo({...editingPromo, themeColor:e.target.value})}>
                    <option value="primary">Primary (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Orange)</option>
                    <option value="danger">Danger (Red)</option>
                  </Select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Icon Name (Lucide React)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Input 
                      value={editingPromo.icon} 
                      onChange={(e:any)=> {
                        // Convert to PascalCase (e.g. "rocket" -> "Rocket", "shield-check" -> "ShieldCheck")
                        const val = e.target.value;
                        const pascal = val.split('-').map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
                        setEditingPromo({...editingPromo, icon: pascal})
                      }}
                      placeholder="e.g. Megaphone, Rocket, Trophy" 
                      style={{ flex: 1 }}
                    />
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {editingPromo.icon && (LucideIcons as any)[editingPromo.icon] ? (
                        (() => {
                          const IconComp = (LucideIcons as any)[editingPromo.icon];
                          return <IconComp size={20} color="#16A34A" />;
                        })()
                      ) : (
                        <LucideIcons.AlertCircle size={20} color="#DC2626" />
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                    {editingPromo.icon && !(LucideIcons as any)[editingPromo.icon] && (
                      <span style={{ color: '#DC2626', display: 'block', marginBottom: 2 }}>Invalid icon name. Will use Megaphone.</span>
                    )}
                    Type any <a href="https://lucide.dev/icons" target="_blank" style={{color: '#2563EB'}}>Lucide icon</a> name (e.g. Sparkles, Zap, Heart).
                  </div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Action Button Text (Optional)</label>
                  <Input value={editingPromo.actionText || ''} onChange={(e:any)=>setEditingPromo({...editingPromo, actionText:e.target.value})} placeholder="e.g. Learn More" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Action Button URL (Optional)</label>
                  <Input value={editingPromo.actionUrl || ''} onChange={(e:any)=>setEditingPromo({...editingPromo, actionUrl:e.target.value})} placeholder="https://" />
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Target Audience</label>
                <Select value={editingPromo.target} onChange={(e:any)=>setEditingPromo({...editingPromo, target:e.target.value as any})}>
                  <option value="all">All Users</option>
                  <option value="workers">Professionals Only</option>
                  <option value="agencies">Companies Only</option>
                </Select>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <Button type="submit" isLoading={isSaving}>Save Campaign</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <Table headers={['Campaign', 'Target', 'Status', 'Actions']}>
          {promotions.map(p => (
            <tr key={p.id}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: p.themeColor === 'primary' ? `${C.primary}15` : p.themeColor === 'success' ? `${C.success}15` : p.themeColor === 'warning' ? '#FEF3C7' : `${C.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.icon && (LucideIcons as any)[p.icon] ? (
                      (() => {
                        const IconComp = (LucideIcons as any)[p.icon];
                        const color = p.themeColor === 'primary' ? C.primary : p.themeColor === 'success' ? C.success : p.themeColor === 'warning' ? '#D97706' : C.danger;
                        return <IconComp size={20} color={color} />;
                      })()
                    ) : (
                      <LucideIcons.Megaphone size={20} color={C.primary} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize: 15 }}>{p.title}</div>
                    <div style={{ fontSize:13, color:C.muted, marginTop: 2 }}>Theme: <span style={{ textTransform: 'capitalize' }}>{p.themeColor}</span></div>
                  </div>
                </div>
              </Td>
              <Td><Badge color={C.faint} style={{ color: C.text, border: `1px solid ${C.border}` }}>{p.target === 'all' ? 'All Users' : p.target === 'workers' ? 'Professionals' : 'Companies'}</Badge></Td>
              <Td>
                <button onClick={() => handleToggle(p)} style={{ border:'none', background:'none', cursor:'pointer', padding: 0 }}>
                  <Badge color={p.isActive ? C.success : C.muted}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </button>
              </Td>
              <Td>
                <div style={{ display:'flex', gap:8 }}>
                  <Button variant="outline" onClick={() => { setEditingPromo(p); setIsCreating(true); }}>Edit</Button>
                  <Button variant="outline" onClick={() => handleDelete(p.id!)} style={{ color:C.danger, borderColor: `${C.danger}30`, background: `${C.danger}05` }}>Delete</Button>
                </div>
              </Td>
            </tr>
          ))}
          {!promotions.length && <tr><Td colSpan={4} style={{textAlign:'center', color:C.muted, padding: 32}}>No campaigns active. Create one to get started!</Td></tr>}
        </Table>
      </Card>
    );
  };

  const AuditView = () => (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:18 }}>Audit Logs (Session)</h3>
        <ExportButton onClick={() => exportToCSV('audit_logs.csv', auditLog.map(a => ({
          ID: a.id,
          Timestamp: new Date(a.timestamp).toLocaleString(),
          Action: a.action,
          Target: a.target,
          Admin: a.admin
        })))} />
      </div>
      <Table headers={['Timestamp', 'Action', 'Target', 'Admin']}>
        {auditLog.map(a => (
          <tr key={a.id}>
            <Td style={{ fontSize:12 }}>{new Date(a.timestamp).toLocaleString()}</Td>
            <Td><Badge color={C.primary}>{a.action}</Badge></Td>
            <Td>{a.target}</Td>
            <Td>{a.admin}</Td>
          </tr>
        ))}
        {!auditLog.length && <tr><Td colSpan={4} style={{textAlign:'center', color:C.muted}}>No logs yet in this session.</Td></tr>}
      </Table>
    </Card>
  );

  const SupportView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, status: 'open' | 'in_progress' | 'resolved') => {
      setUpdatingId(id);
      try {
        await updateSupportTicket(id, { status }, adminEmail);
        toast.success('Support ticket status updated');
      } catch (e) {
        toast.error('Failed to update status');
      } finally {
        setUpdatingId(null);
      }
    };

    const handleDelete = async (id: string) => {
      setConfirmDialog({
        title: 'Delete Ticket',
        message: 'Are you sure you want to permanently delete this support ticket?',
        onConfirm: async () => {
          setConfirmDialog(null);
          await deleteSupportTicket(id, adminEmail);
          toast.success('Support ticket deleted successfully');
          setViewingTicket(null);
        }
      });
    };

    const filteredTickets = supportTickets.filter(t => {
      const matchesSearch = t.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20, flexWrap: 'wrap', gap: 16 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Support & Disputes ({filteredTickets.length})</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Input 
                placeholder="Search by name, email, subject..." 
                value={searchQuery} 
                onChange={(e:any) => setSearchQuery(e.target.value)} 
                style={{ width: 250 }} 
              />
              <Select value={statusFilter} onChange={(e:any) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Select>
              <ExportButton onClick={() => exportToCSV('support_tickets.csv', filteredTickets.map(t => ({
                ID: t.id,
                User: t.userName,
                Email: t.userEmail,
                Subject: t.subject,
                Status: t.status,
                Date: new Date(t.createdAt).toLocaleString()
              })))} />
            </div>
          </div>
          
          <Table headers={['User', 'Subject', 'Date', 'Status', 'Actions']}>
            {filteredTickets.map(t => (
              <tr key={t.id}>
                <Td>
                  <div style={{ fontWeight:600 }}>{t.userName}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{t.userEmail}</div>
                </Td>
                <Td>
                  <div style={{ fontWeight:600 }}>{t.subject}</div>
                  <div style={{ fontSize:12, color:C.muted, maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.message}</div>
                </Td>
                <Td style={{ fontSize:12 }}>{new Date(t.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Badge color={t.status === 'resolved' ? C.success : (t.status === 'in_progress' ? C.warning : C.primary)}>
                    {t.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </Td>
                <Td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Select 
                      value={t.status} 
                      onChange={(e:any) => handleStatusUpdate(t.id!, e.target.value)} 
                      disabled={updatingId === t.id}
                      style={{ width:110, fontSize:12, padding:'6px 8px', opacity: updatingId === t.id ? 0.6 : 1 }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </Select>
                    <Button variant="outline" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => setViewingTicket(t)}>
                      View
                    </Button>
                    <a 
                      href={`mailto:${t.userEmail}?subject=Re: ${t.subject}&body=Hi ${t.userName},%0D%0A%0D%0A`}
                      style={{ padding:'6px 12px', fontSize:12, background:C.primary, color:C.white, borderRadius:6, textDecoration:'none', fontWeight: 600, display: 'inline-block' }}
                    >
                      Reply
                    </a>
                  </div>
                </Td>
              </tr>
            ))}
            {!filteredTickets.length && <tr><Td colSpan={5} style={{textAlign:'center', color:C.muted}}>No support tickets found matching your criteria.</Td></tr>}
          </Table>
        </Card>

        {viewingTicket && (
          <Modal title="Ticket Details" onClose={() => setViewingTicket(null)}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:20, background:C.faint, borderRadius:12, border: `1px solid ${C.border}` }}>
                <div>
                  <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:700, textTransform: 'uppercase' }}>Customer</p>
                  <p style={{ margin:'6px 0 0', fontWeight:600, fontSize: 16 }}>{viewingTicket.userName}</p>
                  <p style={{ margin:0, fontSize:13, color:C.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageSquare size={12} /> {viewingTicket.userEmail}
                  </p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:700, textTransform: 'uppercase' }}>Ticket Info</p>
                  <p style={{ margin:'6px 0 0', fontSize:14 }}>{new Date(viewingTicket.createdAt).toLocaleString()}</p>
                  <p style={{ margin:'6px 0 0' }}>
                    <Badge color={viewingTicket.status === 'resolved' ? C.success : (viewingTicket.status === 'in_progress' ? C.warning : C.primary)}>
                      {viewingTicket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:700, textTransform: 'uppercase' }}>Subject</p>
                <h4 style={{ margin:'6px 0 16px', fontSize:20 }}>{viewingTicket.subject}</h4>
                <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:700, textTransform: 'uppercase', marginBottom: 8 }}>Message</p>
                <div style={{ background:C.white, padding:20, borderRadius:12, border:`1px solid ${C.border}`, fontSize:15, lineHeight:1.6, whiteSpace:'pre-wrap', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.02)' }}>
                  {viewingTicket.message}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginTop:8, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                <Button 
                  variant="outline" 
                  style={{ color:C.danger, borderColor:C.danger }}
                  onClick={() => handleDelete(viewingTicket.id!)}
                >
                  Delete Ticket
                </Button>
                
                <a 
                  href={`mailto:${viewingTicket.userEmail}?subject=Re: ${viewingTicket.subject}&body=Hi ${viewingTicket.userName},%0D%0A%0D%0A`}
                  style={{ padding:'12px 24px', background:C.primary, color:C.white, borderRadius:12, textDecoration:'none', fontWeight:600, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: `0 4px 14px ${C.primary}40` }}
                >
                  <MessageSquare size={16} /> Reply via Email
                </a>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  const NotificationsView = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [target, setTarget] = useState<'all'|'workers'|'agencies'>('all');
    const [priority, setPriority] = useState<'normal'|'high'>('normal');
    const [actionUrl, setActionUrl] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleSend = async (e: any) => {
      e.preventDefault();
      
      const doSend = async () => {
        setIsSending(true);
        try {
          await sendNotification({ title, body, target, priority, actionUrl: actionUrl ?? '', createdAt: null, sentBy: adminEmail }, adminEmail);
          toast.success('Push notification sent successfully');
          setTitle(''); setBody(''); setActionUrl(''); setPriority('normal'); setTarget('all');
          loadData();
        } catch (error) {
          toast.error('Failed to send notification');
        } finally {
          setIsSending(false);
        }
      };

      if (target === 'all') {
        setConfirmDialog({
          title: 'Broadcast Notification',
          message: 'Are you sure you want to send this push notification to EVERY user on the platform?',
          onConfirm: () => {
            setConfirmDialog(null);
            doSend();
          }
        });
      } else {
        doSend();
      }
    };

    const handleDelete = async (id: string) => {
      setDeletingId(id);
      try {
        await deleteNotification(id, adminEmail);
        toast.success('Notification deleted');
        loadData();
      } catch (e) {
        toast.error('Failed to delete notification');
      } finally {
        setDeletingId(null);
      }
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Send Push Notification</h3>
          <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 2 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Title</label>
                <Input value={title} onChange={(e:any)=>setTitle(e.target.value)} required placeholder="e.g. Platform Maintenance" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Priority</label>
                <Select value={priority} onChange={(e:any)=>setPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High (Urgent)</option>
                </Select>
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Message</label>
              <textarea 
                value={body} onChange={(e:any)=>setBody(e.target.value)} required placeholder="Keep it concise and clear..."
                style={{ width:'100%', minHeight:100, padding:16, borderRadius:12, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', resize: 'vertical' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}20`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'; }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Target Audience</label>
                <Select value={target} onChange={(e:any)=>setTarget(e.target.value)}>
                  <option value="all">All Users</option>
                  <option value="workers">Professionals Only</option>
                  <option value="agencies">Companies Only</option>
                </Select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Action URL (Optional)</label>
                <Input value={actionUrl} onChange={(e:any)=>setActionUrl(e.target.value)} placeholder="e.g. /profile or https://..." />
              </div>
            </div>
            <Button type="submit" isLoading={isSending} style={{ alignSelf:'flex-start', padding: '14px 24px' }}>Send Notification</Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Recent Notifications ({notifications.length})</h3>
          <Table headers={['Date', 'Target', 'Priority', 'Title', 'Sent By', 'Action']}>
            {notifications.map(n => (
              <tr key={n.id}>
                <Td style={{ fontSize:12 }}>{new Date(n.createdAt?.toMillis() || Date.now()).toLocaleString()}</Td>
                <Td><Badge color={C.primary}>{n.target}</Badge></Td>
                <Td>
                  {n.priority === 'high' ? <Badge color={C.danger}>High</Badge> : <span style={{fontSize:12, color:C.muted}}>Normal</span>}
                </Td>
                <Td>
                  <div style={{ fontWeight:600 }}>{n.title}</div>
                  {n.actionUrl && <div style={{ fontSize:11, color:C.primary, marginTop:2, display: 'flex', alignItems: 'center', gap: 2 }}><ExternalLink size={10} /> {n.actionUrl}</div>}
                </Td>
                <Td>{n.sentBy}</Td>
                <Td>
                  <button 
                    onClick={() => handleDelete(n.id!)}
                    disabled={deletingId === n.id}
                    style={{ background:'none', border:'none', color:C.danger, cursor:'pointer', padding:6, borderRadius:6, opacity: deletingId === n.id ? 0.5 : 1 }}
                    title="Delete Notification"
                  >
                    {deletingId === n.id ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                  </button>
                </Td>
              </tr>
            ))}
            {!notifications.length && <tr><Td colSpan={6} style={{textAlign:'center', color:C.muted}}>No notifications sent.</Td></tr>}
          </Table>
        </Card>
      </div>
    );
  };

  const SettingsView = () => {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      getGlobalSettings().then(setSettings);
    }, []);

    const handleSave = async (e: any) => {
      e.preventDefault();
      if (!settings) return;
      setIsSaving(true);
      try {

      const oldSettings = await getGlobalSettings();
      await updateGlobalSettings(settings, adminEmail);
      toast.success('Platform settings saved successfully');

      // If maintenance mode was just turned OFF, auto-delete maintenance popups
      if (oldSettings?.maintenanceMode && !settings.maintenanceMode) {
        const promos = await getPromotions();
        const maintenancePromos = promos.filter(p => p.title.toLowerCase().includes('maintenance'));
        for (const mp of maintenancePromos) {
          if (mp.id) await deletePromotion(mp.id, adminEmail);
        }
        if (maintenancePromos.length > 0) {
          toast.success(`${maintenancePromos.length} maintenance popup(s) automatically removed`);
        }
      }
      } finally {
        setIsSaving(false);
      }
    };

    if (!settings) return <div style={{ color:C.muted }}>Loading settings...</div>;

    return (
      <Card>
        <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Global Platform Settings</h3>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Support Email</label>
            <Input type="email" value={settings.supportEmail} onChange={(e:any)=>setSettings({...settings, supportEmail: e.target.value})} required />
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Where users can reach support.</p>
          </div>

          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Platform Fee (%)</label>
            <Input type="number" min={0} max={100} value={settings.platformFee} onChange={(e:any)=>setSettings({...settings, platformFee: Number(e.target.value)})} required />
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Default fee for transactions.</p>
          </div>

          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Announcement Banner (Optional)</label>
            <Input type="text" value={settings.announcementBanner} onChange={(e:any)=>setSettings({...settings, announcementBanner: e.target.value})} placeholder="e.g. Welcome to the new dashboard!" />
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Displayed at the top of the app if set.</p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', maxWidth: 400 }} onClick={() => setSettings({...settings, disableNewRegistrations: !settings.disableNewRegistrations})}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Disable New Registrations</span>
              <div style={{
                width: 44, height: 24, borderRadius: 12, background: settings.disableNewRegistrations ? C.warning : '#D1D5DB',
                position: 'relative', transition: '0.3s ease'
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: C.white,
                  position: 'absolute', top: 2, left: settings.disableNewRegistrations ? 22 : 2,
                  transition: '0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Block new users from signing up (useful for private betas).</p>
          </div>

          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Minimum Required App Version</label>
            <Input type="text" value={settings.forceAppUpdateVersion || ''} onChange={(e:any)=>setSettings({...settings, forceAppUpdateVersion: e.target.value})} placeholder="e.g. 1.2.0" />
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Force users below this version to update the app.</p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', maxWidth: 400 }} onClick={() => setSettings({...settings, enableBetaFeatures: !settings.enableBetaFeatures})}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Enable Beta Features</span>
              <div style={{
                width: 44, height: 24, borderRadius: 12, background: settings.enableBetaFeatures ? C.primary : '#D1D5DB',
                position: 'relative', transition: '0.3s ease'
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: C.white,
                  position: 'absolute', top: 2, left: settings.enableBetaFeatures ? 22 : 2,
                  transition: '0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
            <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Turn on experimental features globally.</p>
          </div>

          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', maxWidth: 400 }} onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.danger }}>Enable Maintenance Mode</span>
              <div style={{
                width: 44, height: 24, borderRadius: 12, background: settings.maintenanceMode ? C.danger : '#D1D5DB',
                position: 'relative', transition: '0.3s ease'
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: C.white,
                  position: 'absolute', top: 2, left: settings.maintenanceMode ? 22 : 2,
                  transition: '0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
            <p style={{ fontSize:11, color:C.danger, marginTop:4 }}>Warning: Prevents users from accessing the platform entirely.</p>
          </div>

          {settings.maintenanceMode && (
            <div style={{ background: C.faint, padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Maintenance Message</label>
                <textarea 
                  value={settings.maintenanceMessage || ''} 
                  onChange={(e:any)=>setSettings({...settings, maintenanceMessage: e.target.value})} 
                  placeholder="e.g. We are currently upgrading our servers..." 
                  style={{ width:'100%', minHeight:60, padding:10, borderRadius:8, border:`1px solid ${C.border}` }}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Estimated End Time</label>
                <input 
                  type="datetime-local" 
                  value={settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                  onChange={(e:any)=>setSettings({...settings, maintenanceEndTime: new Date(e.target.value).getTime()})} 
                  style={{ padding:10, borderRadius:8, border:`1px solid ${C.border}`, width: '100%' }}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <Button type="button" variant="outline" onClick={async () => {
                  if (!settings.maintenanceMessage || !settings.maintenanceEndTime) return alert('Please enter message and end time first.');
                  await savePromotion({
                    title: 'Scheduled Maintenance Notice',
                    message: `Maintenance scheduled: ${settings.maintenanceMessage}. Expected end: ${new Date(settings.maintenanceEndTime).toLocaleString()}`,
                    icon: 'AlertCircle', themeColor: 'warning', isActive: true, target: 'all',
                    startDate: Date.now(), endDate: settings.maintenanceEndTime
                  }, adminEmail);
                  alert('Notification Popup scheduled and activated globally!');
                }}>
                  <Megaphone size={14} style={{ marginRight: 6 }} /> Broadcast Notification Popup
                </Button>
              </div>
            </div>
          )}

          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20, marginTop:10, display: 'flex', gap: 12 }}>
            <Button type="submit" isLoading={isSaving} style={{ padding:'10px 24px', fontSize:14 }}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={async () => {
              try {
                // Seed Promotions
                await savePromotion({ title: 'Summer Safety Gear Sale', message: 'Get 20% off all high-visibility vests!', icon: 'HardHat', themeColor: 'primary', isActive: true, target: 'all', startDate: Date.now(), endDate: Date.now() + 7 * 86400000 }, adminEmail);
                await savePromotion({ title: 'Urgent: Complete Your Profile', message: 'Professionals with 100% complete profiles get hired 3x faster.', icon: 'ShieldCheck', themeColor: 'warning', isActive: true, target: 'workers' as const, startDate: Date.now() - 86400000, endDate: Date.now() + 30 * 86400000 }, adminEmail);
                
                // Seed Taxonomies
                await addTaxonomyItem('jobTitles', 'General Laborer', adminEmail);
                await addTaxonomyItem('jobTitles', 'Electrician', adminEmail);
                await addTaxonomyItem('skills', 'OSHA 10', adminEmail);
                await addTaxonomyItem('skills', 'Forklift Operation', adminEmail);
                
                // Seed Jobs
                await createJob({ title: 'Senior Site Manager', company: 'BuildCo Enterprises', location: 'New York, NY', type: 'full-time', salary: '$90k - $120k', description: 'Looking for an experienced site manager...', requirements: ['5+ years experience', 'OSHA 30'], status: 'active', postedAt: Date.now(), applicants: 12, matchScore: 95 }, adminEmail);
                await createJob({ title: 'Licensed Plumber', company: 'Pipes & Co', location: 'Chicago, IL', type: 'contract', salary: '$45/hr', description: 'Need a plumber for a 6-month commercial project.', requirements: ['State License', 'Commercial experience'], status: 'active', postedAt: Date.now() - 86400000, applicants: 3, matchScore: 82 }, adminEmail);

                toast.success('Dummy data seeded successfully!');
              } catch (e: any) {
                toast.error('Failed to seed data: ' + e.message);
              }
            }} style={{ padding:'10px 24px', fontSize:14 }}>Seed Dummy Data</Button>
          </div>
        </form>
      </Card>
    );
  };

  /* ─── Main Render ─────────────────────────────────────────────── */
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg, fontFamily:'inherit' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .admin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .admin-btn:active:not(:disabled) {
          transform: translateY(1px) scale(0.97);
          filter: brightness(0.95);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        tbody tr:hover .admin-td {
          background: #F8FAFC;
        }
      `}} />
      {/* Mobile overlay */}
      {mbOpen && <div onClick={()=>setMbOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:30 }} />}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <div style={{ padding: '24px 0 24px 24px', flexShrink: 0, display: 'flex', alignItems: 'stretch', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <aside style={{
          width: collapsed ? 72 : 260, background: C.white, borderRadius: 28,
          boxShadow: '0 8px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0,
          border: `1px solid rgba(0,0,0,0.02)`
        }}>
          {/* Brand Header */}
          <div style={{ padding: collapsed ? '28px 12px 20px' : '32px 24px 24px', display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', cursor:'pointer' }} onClick={()=>setCollapsed(c=>!c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? (
              <img src="/logo-v2.png" alt="TradeMatch" style={{ width:40, height:40, objectFit:'contain' }} />
            ) : (
              <img src="/logo-v3.png" alt="TradeMatch" style={{ height:44, objectFit:'contain' }} />
            )}
          </div>

          {/* Nav Items */}
          <nav style={{ flex:1, padding: collapsed ? '10px 8px 0' : '10px 16px 0', overflowY:'auto' }}>
            {NAV.map(({ id, icon, label, badge }) => {
              const active = view === id;
              return (
                <button
                  key={id} onClick={()=>{ setView(id as View); setMbOpen(false); }}
                  title={collapsed ? label : undefined}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap: collapsed ? 0 : 14,
                    justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px' : '12px 16px',
                    borderRadius:16, border:'none', background: active ? '#F1F5F9' : 'transparent',
                    color: active ? C.primary : C.muted, fontWeight: active ? 700 : 600,
                    fontSize:14, cursor:'pointer', marginBottom:4, textAlign:'left', fontFamily:'inherit',
                    transition: 'all 0.2s', position: 'relative',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.faint; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18, background: active ? C.primary : 'transparent', color: active ? '#fff' : C.muted,
                    transition: 'all 0.2s', position:'relative', boxShadow: active ? `0 4px 12px ${C.primary}30` : 'none'
                  }}>
                    {(() => {
                      const Icon = icon;
                      return <Icon size={20} />;
                    })()}

                    {badge && collapsed && <span style={{ position:'absolute', top:-4, right:-4, minWidth:18, height:18, background: C.danger, border:'2px solid #fff', color:'#fff', borderRadius:99, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }}>{badge}</span>}
                  </div>
                  {!collapsed && <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:0.2 }}>{label}</span>}
                  {badge && !collapsed && <span style={{ minWidth:22, height:22, background: C.danger, color:'#fff', borderRadius:99, fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 6px', flexShrink:0, boxShadow:'0 2px 8px rgba(239, 68, 68, 0.4)' }}>{badge}</span>}
                </button>
              );
            })}
          </nav>

          {/* Utility Bar */}
          <div style={{ padding: collapsed ? '16px 8px' : '16px', display:'flex', alignItems:'center', justifyContent:'center', flexWrap:'wrap', gap: collapsed ? 4 : 8 }}>
            <button onClick={logout} title="Sign Out" style={{ width:'100%', height:44, borderRadius:14, border:'none', background:`${C.danger}10`, color: C.danger, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${C.danger}20`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${C.danger}10`; }}
            >
              {collapsed ? <LogOut size={18} /> : (
                <>
                  <LogOut size={18} />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* Top bar */}
        <header style={{ height:88, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexShrink:0, position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={()=>setCollapsed(c=>!c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} style={{ border:`1px solid ${C.border}`, background: C.white, borderRadius:12, width:40, height:40, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color: C.muted, flexShrink:0, boxShadow:'0 2px 6px rgba(0,0,0,0.02)', transition:'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.faint; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.muted; }}
            >
              {collapsed ? '▶' : '◀'}
            </button>
            <h1 style={{ fontSize:24, fontWeight:800, color: C.text, margin:0, textTransform:'capitalize', letterSpacing: -0.5 }}>
              {view.replace('-', ' ')}
            </h1>
            {loading && <span style={{ fontSize:12, fontWeight: 700, color:C.primary, background:`${C.primary}15`, padding:'4px 10px', borderRadius:99, marginLeft: 8 }}>Syncing...</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button style={{ width:44, height:44, borderRadius:99, background:C.white, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.text, boxShadow:'0 2px 8px rgba(0,0,0,0.03)', transition:'all 0.2s', position:'relative' }} onClick={() => setView('notifications')}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
            >
              <Bell size={20} />
              {notifications.length > 0 && <div style={{ position:'absolute', top:10, right:12, width:8, height:8, borderRadius:'50%', background:C.danger, border:'2px solid #fff' }} />}
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:12, background: C.white, border:`1px solid ${C.border}`, borderRadius:99, padding:'6px 16px 6px 6px', boxShadow:'0 2px 10px rgba(0,0,0,0.03)', cursor:'pointer' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:C.faint, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src="/logo-v2.png" alt="Admin" style={{ width:'60%', height:'60%', objectFit:'contain' }} />
              </div>
              <div style={{ paddingRight: 4 }}>
                <div style={{ fontSize:14, fontWeight:700, color: C.text, lineHeight:1.2 }}>Admin Portal</div>
                <div style={{ fontSize:11, color: C.muted, marginTop:2, fontWeight:500 }}>{adminEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main style={{ flex:1, overflowY:'auto', padding:'0 24px 24px' }}>
          {view === 'dashboard' && <DashboardView />}
          {view === 'users' && <UsersList title="All Users" />}
          {view === 'workers' && <UsersList filterRole="worker" title="Professionals" />}
          {view === 'agencies' && <UsersList filterRole="agency" title="Companies" />}
          {view === 'jobs' && <JobsView />}
          {view === 'verification' && <VerificationView />}
          {view === 'content' && <CMSView />}
          {view === 'promotions' && <PromotionsView />}
          {view === 'taxonomies' && <TaxonomiesView />}
          {view === 'audit' && <AuditView />}
          {view === 'support' && <SupportView />}
          {view === 'notifications' && <NotificationsView />}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modern Premium Confirm Modal */}
      {confirmDialog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <Card style={{ width:400, padding:32, textAlign:'center', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)', border:`1px solid ${C.faint}` }}>
            <h3 style={{ margin:'0 0 12px', fontSize:20, fontWeight:800, color:C.text }}>{confirmDialog.title}</h3>
            <p style={{ margin:'0 0 32px', color:C.muted, fontSize:15, lineHeight:1.5 }}>{confirmDialog.message}</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <Button variant="outline" onClick={() => setConfirmDialog(null)} style={{ flex:1, padding:14, fontSize:15, borderRadius:12 }}>Cancel</Button>
              <Button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} style={{ flex:1, padding:14, fontSize:15, borderRadius:12, background: C.primary }}>Confirm</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
