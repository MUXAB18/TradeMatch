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
  type Promotion, getPromotions, savePromotion, deletePromotion
} from '@/lib/services/admin';
import { getAgencyProfile, AgencyDoc } from '@/lib/services/agencies';
import * as LucideIcons from 'lucide-react';
import { 
  LayoutDashboard, Users, HardHat, Building2, 
  Briefcase, ShieldCheck, BookOpen, Bell, 
  ClipboardList, Settings, LogOut, Network, ExternalLink, Download, MessageSquare, Megaphone
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/toast';

/* ─── Shared Theme ───────────────────────────────────────────── */
const C = {
  primary: '#0065D0',
  primaryHover: '#0052A3',
  bg: '#EDEEF2',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  light: '#9CA3AF',
  border: '#E5E7EB',
  faint: '#F9FAFB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

type View = 'dashboard' | 'users' | 'workers' | 'agencies' | 'jobs' | 'verification' | 'content' | 'taxonomies' | 'promotions' | 'support' | 'notifications' | 'audit' | 'settings';

/* ─── UI Components ────────────────────────────────────────── */

const Card = ({ children, style }: any) => (
  <div style={{ background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', ...style }}>
    {children}
  </div>
);

const Badge = ({ children, color = C.primary, style }: any) => (
  <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 8px', borderRadius:99, fontSize:11, fontWeight:700, background:`${color}20`, color, ...style }}>
    {children}
  </span>
);

const Input = (props: any) => (
  <input {...props} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', ...props.style }} />
);

const Select = (props: any) => (
  <select {...props} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:'#fff', ...props.style }} />
);

const Button = ({ children, variant = 'primary', onClick, style, disabled, className = '', type = 'button' }: any) => {
  const bg = disabled ? C.border : variant === 'primary' ? C.primary : variant === 'danger' ? C.danger : 'transparent';
  const color = disabled ? C.light : variant === 'outline' ? C.text : '#fff';
  const border = variant === 'outline' ? `1px solid ${C.border}` : 'none';
  return (
    <button type={type} className={`admin-btn ${className}`} onClick={onClick} disabled={disabled} style={{ padding:'10px 18px', borderRadius:10, background:bg, color, border, fontWeight:600, fontSize:14, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'all 0.15s ease', opacity: disabled ? 0.7 : 1, ...style }}>
      {children}
    </button>
  );
};

const ExportButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '12px 20px', gap: 6, cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  }}
  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <Download size={20} color={C.text} style={{ opacity: 0.8 }} />
    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Export CSV</span>
  </button>
);

const Table = ({ headers, children }: any) => (
  <div style={{ overflowX: 'auto', background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
      <thead>
        <tr style={{ background: C.faint, borderBottom: `1px solid ${C.border}` }}>
          {headers.map((h: any, i: number) => (
            <th key={i} style={{ padding: '14px 16px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Td = ({ children, style }: any) => (
  <td style={{ padding: '16px', borderBottom: `1px solid ${C.faint}`, color: C.text, ...style }}>{children}</td>
);

const Modal = ({ title, onClose, children }: any) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div style={{ background:C.white, borderRadius:20, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 10px 40px rgba(0,0,0,0.2)' }}>
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
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20 }}>
          <Card>
            <div style={{ color:C.muted, fontSize:13, fontWeight:600, marginBottom:8 }}>Total Users</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.text }}>{stats?.totalUsers || 0}</div>
          </Card>
          <Card>
            <div style={{ color:C.muted, fontSize:13, fontWeight:600, marginBottom:8 }}>Professionals</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.text }}>{stats?.workers || 0}</div>
          </Card>
          <Card>
            <div style={{ color:C.muted, fontSize:13, fontWeight:600, marginBottom:8 }}>Companies</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.text }}>{stats?.agencies || 0}</div>
          </Card>
          <Card>
            <div style={{ color:C.muted, fontSize:13, fontWeight:600, marginBottom:8 }}>Active Jobs</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.primary }}>{stats?.activeJobs || 0}</div>
          </Card>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <Card>
            <h3 style={{ margin:'0 0 20px', fontSize:16 }}>User Growth (14 Days)</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.muted}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.muted}} />
                  <RechartsTooltip contentStyle={{borderRadius:8, border:`1px solid ${C.border}`, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="Users" stroke={C.primary} strokeWidth={3} dot={{r:4, fill:C.primary}} activeDot={{r:6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin:'0 0 20px', fontSize:16 }}>Jobs by Trade</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={jobsByTrade} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.border} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.muted}} />
                  <YAxis type="category" dataKey="trade" axisLine={false} tickLine={false} tick={{fontSize:12, fill:C.text, fontWeight:600}} width={80} />
                  <RechartsTooltip cursor={{fill:C.faint}} contentStyle={{borderRadius:8, border:`1px solid ${C.border}`, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="Jobs" fill={C.primary} radius={[0,4,4,0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <Card>
            <h3 style={{ margin:'0 0 16px', fontSize:16 }}>Recent Signups</h3>
            <Table headers={['Name', 'Role', 'Date']}>
              {stats?.recentUsers?.map(u => (
                <tr key={u.id}>
                  <Td>
                    <div style={{ fontWeight:600 }}>{u.name || 'Unnamed'}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{u.email || u.phone}</div>
                  </Td>
                  <Td><Badge color={u.role === 'agency' ? C.warning : C.primary}>{u.role}</Badge></Td>
                  <Td>{u.createdAt?.toMillis ? new Date(u.createdAt.toMillis()).toLocaleDateString() : new Date().toLocaleDateString()}</Td>
                </tr>
              ))}
              {!stats?.recentUsers?.length && <tr><Td colSpan={3} style={{textAlign:'center', color:C.muted}}>No recent users</Td></tr>}
            </Table>
          </Card>

          <Card>
            <h3 style={{ margin:'0 0 16px', fontSize:16 }}>Recent Jobs</h3>
            <Table headers={['Title', 'Trade', 'Status']}>
              {stats?.recentJobs?.map(j => (
                <tr key={j.id}>
                  <Td>
                    <div style={{ fontWeight:600 }}>{j.title}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{j.country}</div>
                  </Td>
                  <Td>{j.trade}</Td>
                  <Td><Badge color={j.active ? C.success : C.muted}>{j.active ? 'Active' : 'Inactive'}</Badge></Td>
                </tr>
              ))}
              {!stats?.recentJobs?.length && <tr><Td colSpan={3} style={{textAlign:'center', color:C.muted}}>No recent jobs</Td></tr>}
            </Table>
          </Card>
        </div>
      </div>
    );
  };

  const UsersList = ({ filterRole, title }: { filterRole?: 'worker' | 'agency', title: string }) => {
    const [search, setSearch] = useState('');
    const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
    const [viewingAgencyDoc, setViewingAgencyDoc] = useState<AgencyDoc | null>(null);

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
      return true;
    });

    const handleSuspend = async (u: AdminUser) => {
      setConfirmDialog({
        title: 'Confirm Action',
        message: `Are you sure you want to ${u.adminStatus === 'suspended' ? 'unsuspend' : 'suspend'} ${u.name}?`,
        onConfirm: async () => {
          const isSuspended = u.adminStatus !== 'suspended';
          await setUserSuspended(u.id, isSuspended, adminEmail);
          toast.success(`User ${isSuspended ? 'suspended' : 'unsuspended'} successfully`);
          setUsers(users.map(user => user.id === u.id ? { ...user, adminStatus: isSuspended ? 'suspended' : 'active' } : user));
        }
      });
    };

    const handleApprove = async (u: AdminUser) => {
      setConfirmDialog({
        title: 'Approve User',
        message: `Approve ${u.name} for platform access?`,
        onConfirm: async () => {
          await adminUpdateUserStatus(u.id, 'approved', adminEmail);
          toast.success('User approved successfully');
          setUsers(users.map(user => user.id === u.id ? { ...user, accountStatus: 'approved' } : user));
        }
      });
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>{title} ({filtered.length})</h3>
          <div style={{ display:'flex', gap: 12 }}>
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
            <Input placeholder="Search name or email..." value={search} onChange={(e:any)=>setSearch(e.target.value)} style={{ width:250, padding:'8px 12px' }} />
          </div>
        </div>
        <Table headers={['User', 'Role/Trade', 'Location', 'Status', 'Actions']}>
          {filtered.map(u => (
            <tr key={u.id} style={{ opacity: u.adminStatus === 'suspended' ? 0.6 : 1 }}>
              <Td>
                <div style={{ fontWeight:600 }}>{u.name || 'Unnamed'}</div>
                <div style={{ fontSize:12, color:C.muted }}>{u.email || u.phone}</div>
              </Td>
              <Td>
                <Badge color={u.role === 'agency' ? C.warning : C.primary}>{u.role}</Badge>
                {u.role === 'worker' && <div style={{ fontSize:12, marginTop:4 }}>{u.trade}</div>}
              </Td>
              <Td>{u.city ? `${u.city}, ${u.country}` : u.country}</Td>
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
                  <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>setViewingUser(u)}>
                    View Details
                  </Button>
                  {u.role === 'agency' && u.accountStatus !== 'approved' && (
                    <Button style={{ padding:'4px 10px', fontSize:12, background: C.success }} onClick={()=>handleApprove(u)}>
                      Approve
                    </Button>
                  )}
                  <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>handleSuspend(u)}>
                    {u.adminStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
          {!filtered.length && <tr><Td colSpan={5} style={{textAlign:'center', color:C.muted}}>No users found.</Td></tr>}
        </Table>

        {viewingUser && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Card style={{ width:500, maxHeight:'80vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <h3 style={{ margin:0 }}>User Details</h3>
                <button onClick={()=>setViewingUser(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>×</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div><strong>ID:</strong> {viewingUser.id}</div>
                <div><strong>Name:</strong> {viewingUser.name}</div>
                <div><strong>Email:</strong> {viewingUser.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {viewingUser.phone || 'N/A'}</div>
                <div><strong>Role:</strong> <Badge color={viewingUser.role === 'agency' ? C.warning : C.primary}>{viewingUser.role}</Badge></div>
                
                {viewingUser.role === 'agency' && (
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginTop: 10 }}>
                    <h4 style={{ margin:'0 0 12px' }}>Agency Onboarding Data</h4>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize: 13 }}>
                      <div><strong>Account Status:</strong> <Badge color={viewingUser.accountStatus === 'approved' ? C.success : (viewingUser.role === 'agency' ? C.warning : C.success)}>{viewingUser.accountStatus || (viewingUser.role === 'agency' ? 'pending' : 'approved')}</Badge></div>
                      <div><strong>Country HQ:</strong> {viewingUser.country}</div>
                      
                      {viewingAgencyDoc && (
                        <>
                          <div><strong>Company Name:</strong> {viewingAgencyDoc.companyName || 'N/A'}</div>
                          <div><strong>Business Email:</strong> {viewingAgencyDoc.businessEmail || 'N/A'}</div>
                          <div><strong>Phone:</strong> {viewingAgencyDoc.phone || 'N/A'}</div>
                          <div><strong>Address:</strong> {viewingAgencyDoc.address || 'N/A'}, {viewingAgencyDoc.city || 'N/A'}, {viewingAgencyDoc.country || 'N/A'}</div>
                          <div><strong>Website:</strong> {viewingAgencyDoc.website ? <a href={viewingAgencyDoc.website} target="_blank" rel="noreferrer" style={{ color:C.primary, textDecoration:'underline' }}>{viewingAgencyDoc.website}</a> : 'N/A'}</div>
                          <div><strong>Target Trades:</strong> {viewingAgencyDoc.hiringTrades?.join(', ') || 'N/A'}</div>
                          <div><strong>Target Countries:</strong> {viewingAgencyDoc.hiringCountries?.join(', ') || 'N/A'}</div>
                          <div>
                            <strong>Business License:</strong>{' '}
                            {viewingAgencyDoc.businessLicenseUrl ? (
                              <a href={viewingAgencyDoc.businessLicenseUrl} target="_blank" rel="noreferrer" style={{ color:C.primary, textDecoration:'underline', display:'inline-flex', alignItems:'center', gap:4 }}>
                                View Document <ExternalLink size={12} />
                              </a>
                            ) : 'Not uploaded'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginTop:24, display:'flex', justifyContent:'space-between', alignItems: 'center' }}>
                <Button style={{ padding:'8px 16px', fontSize:13, background: C.faint, color: C.text }} onClick={() => {
                  alert(`Magic login link generated for ${viewingUser.name}. In a full production app, this would securely log you in as them in a new tab.`);
                }}>
                  <Network size={14} style={{marginRight:6}} /> Login As User
                </Button>
                <Button variant="outline" onClick={()=>setViewingUser(null)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    );
  };

  const VerificationView = () => {
    const pending = users.filter(u => u.verificationStatus?.identity === 'submitted' || u.verificationStatus?.certificate === 'submitted');
    
    const handleVerify = async (u: AdminUser, field: 'identity'|'certificate', approve: boolean) => {
      await setUserVerification(u.id, field, approve ? 'verified' : 'attention', adminEmail);
      toast.success(`Verification ${approve ? 'approved' : 'rejected'} successfully`);
      loadData();
    };

    return (
      <Card>
        <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Pending Verification ({pending.length})</h3>
        <Table headers={['User', 'Type', 'Docs', 'Actions']}>
          {pending.map(u => (
            <tr key={u.id}>
              <Td>
                <div style={{ fontWeight:600 }}>{u.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{u.trade} • {u.country}</div>
              </Td>
              <Td>
                {u.verificationStatus?.identity === 'submitted' && <Badge color={C.warning}>Identity</Badge>}
                {u.verificationStatus?.certificate === 'submitted' && <Badge color={C.warning}>Certificate</Badge>}
              </Td>
              <Td>
                <a href="#" style={{ color:C.primary, fontSize:13 }}>View Documents ↗</a>
              </Td>
              <Td>
                <div style={{ display:'flex', gap:8 }}>
                  <Button style={{ padding:'6px 12px', fontSize:12, background:C.success }} onClick={()=>handleVerify(u, u.verificationStatus?.identity === 'submitted' ? 'identity' : 'certificate', true)}>Approve</Button>
                  <Button style={{ padding:'6px 12px', fontSize:12, background:C.danger }} onClick={()=>handleVerify(u, u.verificationStatus?.identity === 'submitted' ? 'identity' : 'certificate', false)}>Reject</Button>
                </div>
              </Td>
            </tr>
          ))}
          {!pending.length && <tr><Td colSpan={4} style={{textAlign:'center', color:C.muted, padding:40}}>No pending verifications 🎉</Td></tr>}
        </Table>
      </Card>
    );
  };

  const JobsView = () => {
    const [editing, setEditing] = useState<Partial<AdminJob> | null>(null);

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (editing?.id) {
        await updateJob(editing.id, editing, adminEmail);
        toast.success('Job updated successfully');
      } else {
        await createJob(editing as any, adminEmail);
        toast.success('Job created successfully');
      }
      setEditing(null);
      loadData();
    };

    const handleDelete = async (id: string) => {
      setConfirmDialog({
        title: 'Delete Job',
        message: 'Delete this job permanently?',
        onConfirm: async () => {
          await deleteJob(id, adminEmail);
          toast.success('Job deleted successfully');
          loadData();
        }
      });
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>Job Postings ({jobs.length})</h3>
          <div style={{ display:'flex', gap: 12 }}>
            <ExportButton onClick={() => exportToCSV('jobs.csv', jobs.map(j => ({
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
        <Table headers={['Job Title', 'Trade', 'Location', 'Status', 'Actions']}>
          {jobs.map(j => (
            <tr key={j.id}>
              <Td>
                <div style={{ fontWeight:600 }}>{j.title}</div>
                <div style={{ fontSize:12, color:C.muted }}>{j.company || 'Unknown Company'}</div>
              </Td>
              <Td>{j.trade}</Td>
              <Td>{j.country}</Td>
              <Td>
                <Badge color={j.active ? C.success : C.muted}>{j.active ? 'Active' : 'Draft/Closed'}</Badge>
              </Td>
              <Td>
                <div style={{ display:'flex', gap:8 }}>
                  <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>setEditing(j)}>Edit</Button>
                  <Button variant="outline" style={{ padding:'4px 10px', fontSize:12, color:C.danger, borderColor:C.danger }} onClick={()=>handleDelete(j.id)}>Delete</Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>

        {editing && (
          <Modal title={editing.id ? 'Edit Job' : 'Create Job'} onClose={()=>setEditing(null)}>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Title</label>
                <Input value={editing.title} onChange={(e:any)=>setEditing({...editing, title:e.target.value})} required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Company</label>
                  <Input value={editing.company || ''} onChange={(e:any)=>setEditing({...editing, company:e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Trade</label>
                  <Select value={editing.trade} onChange={(e:any)=>setEditing({...editing, trade:e.target.value})}>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="welder">Welder</option>
                  </Select>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Country Code</label>
                <Input value={editing.country} onChange={(e:any)=>setEditing({...editing, country:e.target.value})} required />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Active</label>
                <input type="checkbox" checked={editing.active || false} onChange={(e:any)=>setEditing({...editing, active:e.target.checked})} />
              </div>
              <div style={{ display:'flex', gap:12, marginTop:10 }}>
                <Button type="submit" style={{ flex:1 }}>Save Job</Button>
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

    useEffect(() => {
      getAllCMSBlocks().then(setBlocks);
    }, []);

    const handleSaveBlock = async (e: any) => {
      e.preventDefault();
      await updateCMSBlock(editing.id, editing.value, editing.description, adminEmail);
      toast.success('CMS block updated successfully');
      setEditing(null);
      getAllCMSBlocks().then(setBlocks);
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
                  <Button type="submit" style={{ flex:1 }}>Save Changes</Button>
                </div>
              </form>
            </Modal>
          )}
        </Card>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Certifications CMS</h3>
            <Button>+ Add Cert</Button>
          </div>
          <Table headers={['Name', 'Trade', 'Country', 'Required']}>
            {certs.map(c => (
              <tr key={c.id}>
                <Td style={{ fontWeight:600 }}>{c.name}</Td>
                <Td>{c.trade}</Td>
                <Td>{c.country}</Td>
                <Td>{c.required ? 'Yes' : 'No'}</Td>
              </tr>
            ))}
            {!certs.length && <tr><Td colSpan={4}>No certs found.</Td></tr>}
          </Table>
        </Card>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Interview Prep CMS</h3>
            <Button>+ Add Card</Button>
          </div>
          <Table headers={['Trade', 'Question', 'Order']}>
            {prepCards.map(p => (
              <tr key={p.id}>
                <Td>{p.trade}</Td>
                <Td>{p.question}</Td>
                <Td>{p.order}</Td>
              </tr>
            ))}
            {!prepCards.length && <tr><Td colSpan={3}>No prep cards found.</Td></tr>}
          </Table>
        </Card>
      </div>
    );
  };

  const TaxonomiesView = () => {
    const [skills, setSkills] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [newCat, setNewCat] = useState('');

    useEffect(() => {
      getTaxonomy('skills').then(setSkills);
      getTaxonomy('job_categories').then(setCategories);
    }, []);

    const handleAddSkill = async (e: any) => {
      e.preventDefault();
      if (!newSkill.trim()) return;
      const updated = await addTaxonomyItem('skills', newSkill.trim(), adminEmail);
      toast.success('Skill added successfully');
      setSkills(updated);
      setNewSkill('');
    };

    const handleRemoveSkill = async (skill: string) => {
      setConfirmDialog({
        title: 'Remove Skill',
        message: `Remove skill "${skill}"?`,
        onConfirm: async () => {
          const updated = await removeTaxonomyItem('skills', skill, adminEmail);
          toast.success('Skill removed successfully');
          setSkills(updated);
        }
      });
    };

    const handleAddCat = async (e: any) => {
      e.preventDefault();
      if (!newCat.trim()) return;
      const updated = await addTaxonomyItem('job_categories', newCat.trim(), adminEmail);
      toast.success('Category added successfully');
      setCategories(updated);
      setNewCat('');
    };

    const handleRemoveCat = async (cat: string) => {
      setConfirmDialog({
        title: 'Remove Category',
        message: `Remove category "${cat}"?`,
        onConfirm: async () => {
          const updated = await removeTaxonomyItem('job_categories', cat, adminEmail);
          toast.success('Category removed successfully');
          setCategories(updated);
        }
      });
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Skills Taxonomy</h3>
          <form onSubmit={handleAddSkill} style={{ display:'flex', gap:10, marginBottom:16 }}>
            <Input placeholder="Add new skill..." value={newSkill} onChange={(e:any)=>setNewSkill(e.target.value)} style={{ flex:1 }} />
            <Button type="submit">Add Skill</Button>
          </form>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {skills.map(s => (
              <Badge key={s} color={C.primary} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', fontSize:13 }}>
                {s}
                <span style={{ cursor:'pointer', fontWeight:800, paddingLeft:4 }} onClick={()=>handleRemoveSkill(s)}>×</span>
              </Badge>
            ))}
            {skills.length === 0 && <span style={{ color:C.muted, fontSize:13 }}>No skills defined.</span>}
          </div>
        </Card>

        <Card>
          <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Job Categories</h3>
          <form onSubmit={handleAddCat} style={{ display:'flex', gap:10, marginBottom:16 }}>
            <Input placeholder="Add new category..." value={newCat} onChange={(e:any)=>setNewCat(e.target.value)} style={{ flex:1 }} />
            <Button type="submit">Add Category</Button>
          </form>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {categories.map(c => (
              <Badge key={c} color={C.success} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', fontSize:13 }}>
                {c}
                <span style={{ cursor:'pointer', fontWeight:800, paddingLeft:4 }} onClick={()=>handleRemoveCat(c)}>×</span>
              </Badge>
            ))}
            {categories.length === 0 && <span style={{ color:C.muted, fontSize:13 }}>No categories defined.</span>}
          </div>
        </Card>
      </div>
    );
  };

  const PromotionsView = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Partial<Promotion>>({
      title: '', message: '', icon: 'Megaphone', themeColor: 'primary',
      isActive: true, target: 'all', startDate: Date.now(), endDate: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      await savePromotion(editingPromo, adminEmail);
      toast.success(`Popup ${editingPromo.id ? 'updated' : 'created'} successfully`);
      setIsCreating(false);
      loadData();
    };

    const handleDelete = async (id: string) => {
      if (confirm('Delete this promotion?')) {
        await deletePromotion(id, adminEmail);
        toast.success('Popup deleted successfully');
        loadData();
      }
    };

    const handleToggle = async (p: Promotion) => {
      await savePromotion({ id: p.id, title: p.title, isActive: !p.isActive }, adminEmail);
      toast.success(`Popup ${p.isActive ? 'deactivated' : 'activated'} successfully`);
      loadData();
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>Promotions & Popups</h3>
          <Button onClick={() => { 
            setEditingPromo({ title: '', message: '', icon: 'Megaphone', themeColor: 'primary', isActive: true, target: 'all', startDate: Date.now(), endDate: Date.now() + 7 * 24 * 60 * 60 * 1000 });
            setIsCreating(true); 
          }}>+ Create Popup</Button>
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
                <Button type="submit">Save Campaign</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <Table headers={['Campaign', 'Target', 'Status', 'Actions']}>
          {promotions.map(p => (
            <tr key={p.id}>
              <Td>
                <div style={{ fontWeight:600 }}>{p.title}</div>
                <div style={{ fontSize:12, color:C.muted }}>Theme: {p.themeColor}</div>
              </Td>
              <Td><Badge color={C.primary}>{p.target}</Badge></Td>
              <Td>
                <button onClick={() => handleToggle(p)} style={{ border:'none', background:'none', cursor:'pointer' }}>
                  <Badge color={p.isActive ? C.success : C.muted}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </button>
              </Td>
              <Td>
                <div style={{ display:'flex', gap:8 }}>
                  <Button variant="outline" onClick={() => { setEditingPromo(p); setIsCreating(true); }}>Edit</Button>
                  <Button variant="outline" onClick={() => handleDelete(p.id!)} style={{ color:C.danger }}>Delete</Button>
                </div>
              </Td>
            </tr>
          ))}
          {!promotions.length && <tr><Td colSpan={4} style={{textAlign:'center', color:C.muted}}>No campaigns active.</Td></tr>}
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

  const renderSupportView = () => {
    const handleStatusUpdate = async (id: string, status: 'open' | 'in_progress' | 'resolved') => {
      await updateSupportTicket(id, { status }, adminEmail);
      toast.success('Support ticket status updated successfully');
    };

    const handleDelete = async (id: string) => {
      if (confirm('Are you sure you want to delete this ticket?')) {
        await deleteSupportTicket(id, adminEmail);
        toast.success('Support ticket deleted successfully');
        setViewingTicket(null);
      }
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:18 }}>Support & Disputes ({supportTickets.length})</h3>
            <ExportButton onClick={() => exportToCSV('support_tickets.csv', supportTickets.map(t => ({
              ID: t.id,
              User: t.userName,
              Email: t.userEmail,
              Subject: t.subject,
              Status: t.status,
              Date: new Date(t.createdAt).toLocaleString()
            })))} />
          </div>
          
          <Table headers={['User', 'Subject', 'Date', 'Status', 'Actions']}>
            {supportTickets.map(t => (
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
                    <Select value={t.status} onChange={(e:any) => handleStatusUpdate(t.id!, e.target.value)} style={{ width:120, fontSize:12, padding:'4px 8px' }}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </Select>
                    <Button variant="outline" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setViewingTicket(t)}>
                      View
                    </Button>
                    <a 
                      href={`mailto:${t.userEmail}?subject=Re: ${t.subject}&body=Hi ${t.userName},%0D%0A%0D%0A`}
                      style={{ padding:'4px 10px', fontSize:12, background:C.primary, color:C.white, borderRadius:6, textDecoration:'none' }}
                    >
                      Reply
                    </a>
                  </div>
                </Td>
              </tr>
            ))}
            {!supportTickets.length && <tr><Td colSpan={5} style={{textAlign:'center', color:C.muted}}>No support tickets found.</Td></tr>}
          </Table>
        </Card>

        {viewingTicket && (
          <Modal title="Ticket Details" onClose={() => setViewingTicket(null)}>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:16, background:C.faint, borderRadius:8 }}>
                <div>
                  <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:600 }}>User</p>
                  <p style={{ margin:'4px 0 0', fontWeight:600 }}>{viewingTicket.userName}</p>
                  <p style={{ margin:0, fontSize:13, color:C.primary }}>{viewingTicket.userEmail}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:600 }}>Date Submitted</p>
                  <p style={{ margin:'4px 0 0', fontSize:14 }}>{new Date(viewingTicket.createdAt).toLocaleString()}</p>
                  <p style={{ margin:'4px 0 0' }}>
                    <Badge color={viewingTicket.status === 'resolved' ? C.success : (viewingTicket.status === 'in_progress' ? C.warning : C.primary)}>
                      {viewingTicket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:600 }}>Subject</p>
                <h4 style={{ margin:'4px 0 12px', fontSize:18 }}>{viewingTicket.subject}</h4>
                <p style={{ margin:0, fontSize:12, color:C.muted, fontWeight:600 }}>Message</p>
                <div style={{ background:C.white, padding:16, borderRadius:8, border:`1px solid ${C.border}`, fontSize:15, lineHeight:1.6, whiteSpace:'pre-wrap' }}>
                  {viewingTicket.message}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
                <Button 
                  variant="outline" 
                  style={{ color:'red', borderColor:'red' }}
                  onClick={() => handleDelete(viewingTicket.id!)}
                >
                  Delete Ticket
                </Button>
                
                <a 
                  href={`mailto:${viewingTicket.userEmail}?subject=Re: ${viewingTicket.subject}&body=Hi ${viewingTicket.userName},%0D%0A%0D%0A`}
                  style={{ padding:'10px 20px', background:C.primary, color:C.white, borderRadius:6, textDecoration:'none', fontWeight:600 }}
                >
                  Reply via Email
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

    const handleSend = async (e: any) => {
      e.preventDefault();
      await sendNotification({ title, body, target, createdAt: null, sentBy: adminEmail }, adminEmail);
      setTitle(''); setBody('');
      loadData();
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        <Card>
          <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Send Push Notification</h3>
          <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Title</label>
              <Input value={title} onChange={(e:any)=>setTitle(e.target.value)} required placeholder="e.g. Platform Maintenance" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Message</label>
              <textarea 
                value={body} onChange={(e:any)=>setBody(e.target.value)} required 
                style={{ width:'100%', minHeight:100, padding:12, borderRadius:8, border:'1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:4 }}>Target Audience</label>
              <Select value={target} onChange={(e:any)=>setTarget(e.target.value)}>
                <option value="all">All Users</option>
                <option value="workers">Professionals Only</option>
                <option value="agencies">Companies Only</option>
              </Select>
            </div>
            <Button type="submit" style={{ alignSelf:'flex-start' }}>Send Notification</Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Recent Notifications ({notifications.length})</h3>
          <Table headers={['Date', 'Target', 'Title', 'Sent By']}>
            {notifications.map(n => (
              <tr key={n.id}>
                <Td style={{ fontSize:12 }}>{new Date(n.createdAt?.toMillis() || Date.now()).toLocaleString()}</Td>
                <Td><Badge color={C.primary}>{n.target}</Badge></Td>
                <Td style={{ fontWeight:600 }}>{n.title}</Td>
                <Td>{n.sentBy}</Td>
              </tr>
            ))}
            {!notifications.length && <tr><Td colSpan={4} style={{textAlign:'center', color:C.muted}}>No notifications sent.</Td></tr>}
          </Table>
        </Card>
      </div>
    );
  };

  const SettingsView = () => {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
      getGlobalSettings().then(setSettings);
    }, []);

    const handleSave = async (e: any) => {
      e.preventDefault();
      if (!settings) return;

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', maxWidth: 400 }} onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Enable Maintenance Mode</span>
              <div style={{
                width: 44, height: 24, borderRadius: 12, background: settings.maintenanceMode ? C.primary : '#D1D5DB',
                position: 'relative', transition: '0.3s ease'
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: C.white,
                  position: 'absolute', top: 2, left: settings.maintenanceMode ? 22 : 2,
                  transition: '0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
            <p style={{ fontSize:11, color:C.danger, marginTop:4 }}>Warning: Prevents users from accessing the platform.</p>
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

          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20, marginTop:10 }}>
            <Button type="submit" style={{ padding:'10px 24px', fontSize:14 }}>Save Changes</Button>
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
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .admin-btn:active:not(:disabled) {
          transform: translateY(1px) scale(0.96);
          filter: brightness(0.95);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
      `}} />
      {/* Mobile overlay */}
      {mbOpen && <div onClick={()=>setMbOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:30 }} />}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <div style={{ padding: '20px 0 20px 20px', flexShrink: 0, display: 'flex', alignItems: 'stretch', transition: 'width 0.25s ease' }}>
        <aside style={{
          width: collapsed ? 68 : 230, background: C.white, borderRadius: 20,
          boxShadow: '0 4px 30px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', transition: 'width 0.25s ease', flexShrink: 0,
        }}>
          {/* Brand Header */}
          <div style={{ padding: collapsed ? '24px 12px 14px' : '24px 20px 14px', borderBottom:`1px solid ${C.faint}`, display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', cursor:'pointer' }} onClick={()=>setCollapsed(c=>!c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? (
              <img src="/logo-v2.png" alt="TradeMatch" style={{ width:40, height:40, objectFit:'contain' }} />
            ) : (
              <img src="/logo-v3.png" alt="TradeMatch" style={{ height:40, objectFit:'contain' }} />
            )}
          </div>

          {/* Nav Items */}
          <nav style={{ flex:1, padding: collapsed ? '10px 8px 0' : '10px 10px 0', overflowY:'auto' }}>
            {NAV.map(({ id, icon, label, badge }) => {
              const active = view === id;
              return (
                <button
                  key={id} onClick={()=>{ setView(id as View); setMbOpen(false); }}
                  title={collapsed ? label : undefined}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap: collapsed ? 0 : 12,
                    justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '8px' : '10px 12px',
                    borderRadius:12, border:'none', background: active ? '#EEF4FF' : 'transparent',
                    color: active ? C.primary : C.muted, fontWeight: active ? 700 : 600,
                    fontSize:13.5, cursor:'pointer', marginBottom:2, textAlign:'left', fontFamily:'inherit',
                    transition: 'all 0.2s', position: 'relative',
                  }}
                >
                  <div style={{
                    width:32, height:32, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16, background: active ? C.primary : C.faint, color: active ? '#fff' : C.muted,
                    transition: 'all 0.2s', position:'relative',
                  }}>
                    {(() => {
                      const Icon = icon;
                      return <Icon size={18} />;
                    })()}

                    {badge && collapsed && <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, background: C.danger, border:'2px solid #fff', color:'#fff', borderRadius:99, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px' }}>{badge}</span>}
                  </div>
                  {!collapsed && <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>}
                  {badge && !collapsed && <span style={{ minWidth:20, height:20, background: C.danger, color:'#fff', borderRadius:99, fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', flexShrink:0 }}>{badge}</span>}
                </button>
              );
            })}
          </nav>

          {/* Utility Bar */}
          <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', borderTop:`1px solid ${C.faint}`, display:'flex', alignItems:'center', justifyContent:'center', flexWrap:'wrap', gap: collapsed ? 4 : 8 }}>
            <button onClick={logout} title="Sign Out" style={{ width:'100%', height:36, borderRadius:10, border:'none', background:`${C.danger}10`, color: C.danger, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {collapsed ? <LogOut size={16} /> : (
                <>
                  <LogOut size={16} />
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
        <header style={{ height:68, padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setCollapsed(c=>!c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} style={{ border:`1px solid ${C.border}`, background: C.white, borderRadius:10, width:36, height:36, cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', color: C.muted, flexShrink:0 }}>
              {collapsed ? '▶' : '◀'}
            </button>
            <h1 style={{ fontSize:18, fontWeight:800, color: C.text, margin:0, textTransform:'capitalize' }}>
              {view.replace('-', ' ')}
            </h1>
            {loading && <span style={{ fontSize:12, color:C.muted, background:C.border, padding:'4px 8px', borderRadius:8 }}>Loading...</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background: C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'6px 12px 6px 8px' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:`1px solid ${C.border}` }}>
                <img src="/logo-v2.png" alt="Admin" style={{ width:'70%', height:'70%', objectFit:'contain' }} />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color: C.text, lineHeight:1 }}>Admin</div>
                <div style={{ fontSize:10, color: C.light, marginTop:1 }}>{adminEmail}</div>
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
          {view === 'support' && renderSupportView()}
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
