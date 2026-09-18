'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AdminUser, AdminJob, AdminCert, AdminPrepCard, DashboardStats, AdminNotification, AuditEntry,
  getDashboardStats, getAllUsers, adminUpdateUser, setUserVerification, setUserSuspended, adminUpdateUserStatus,
  getAllJobs, createJob, updateJob, deleteJob, toggleJobActive,
  getAllCerts, createCert, updateCert, deleteCert,
  getAllPrepCards, createPrepCard, updatePrepCard, deletePrepCard,
  sendNotification, getNotifications, getAuditLog,
  getTaxonomy, addTaxonomyItem, removeTaxonomyItem, getAllCMSBlocks, updateCMSBlock
} from '@/lib/services/admin';
import { getAgencyProfile, AgencyDoc } from '@/lib/services/agencies';
import { 
  LayoutDashboard, Users, HardHat, Building2, 
  Briefcase, ShieldCheck, BookOpen, Bell, 
  ClipboardList, Settings, LogOut, Network, ExternalLink
} from 'lucide-react';

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

type View = 'dashboard' | 'users' | 'workers' | 'agencies' | 'jobs' | 'verification' | 'content' | 'taxonomies' | 'notifications' | 'audit' | 'settings';

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

const Button = ({ children, variant = 'primary', onClick, style, disabled }: any) => {
  const bg = disabled ? C.border : variant === 'primary' ? C.primary : variant === 'danger' ? C.danger : 'transparent';
  const color = disabled ? C.light : variant === 'outline' ? C.text : '#fff';
  const border = variant === 'outline' ? `1px solid ${C.border}` : 'none';
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding:'10px 18px', borderRadius:10, background:bg, color, border, fontWeight:600, fontSize:14, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'opacity 0.2s', opacity: disabled ? 0.7 : 1, ...style }}>
      {children}
    </button>
  );
};

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

  // Global Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [certs, setCerts] = useState<AdminCert[]>([]);
  const [prepCards, setPrepCards] = useState<AdminPrepCard[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
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

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === 'dashboard') setStats(await getDashboardStats());
      if (['users', 'workers', 'agencies', 'verification'].includes(view)) {
        if (!users.length) setUsers(await getAllUsers(500)); // load once, cache in memory for MVP
      }
      if (view === 'jobs') setJobs(await getAllJobs(200));
      if (view === 'content') {
        setCerts(await getAllCerts());
        setPrepCards(await getAllPrepCards());
      }
      if (view === 'notifications') setNotifications(await getNotifications());
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
            <img src="/LOGIN.png" alt="TradeMatch" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
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
    { id: 'taxonomies', icon: Network, label: 'Taxonomies' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'audit', icon: ClipboardList, label: 'Audit Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  /* ─── Views ─────────────────────────────────────────────────── */

  const DashboardView = () => (
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
          <h3 style={{ margin:'0 0 16px', fontSize:16 }}>Recent Signups</h3>
          <Table headers={['Name', 'Role', 'Date']}>
            {stats?.recentUsers?.map(u => (
              <tr key={u.id}>
                <Td>
                  <div style={{ fontWeight:600 }}>{u.name || 'Unnamed'}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{u.email || u.phone}</div>
                </Td>
                <Td><Badge color={u.role === 'agency' ? C.warning : C.primary}>{u.role}</Badge></Td>
                <Td>{new Date(u.createdAt?.toMillis() || Date.now()).toLocaleDateString()}</Td>
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
      if (confirm(`Are you sure you want to ${u.adminStatus === 'suspended' ? 'unsuspend' : 'suspend'} ${u.name}?`)) {
        await setUserSuspended(u.id, u.adminStatus !== 'suspended', adminEmail);
        loadData(); // reload
      }
    };

    const handleApprove = async (u: AdminUser) => {
      if (confirm(`Approve ${u.name} for platform access?`)) {
        await adminUpdateUserStatus(u.id, 'approved', adminEmail);
        loadData();
      }
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>{title} ({filtered.length})</h3>
          <Input placeholder="Search name or email..." value={search} onChange={(e:any)=>setSearch(e.target.value)} style={{ width:250, padding:'8px 12px' }} />
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
              <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end' }}>
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
      if (editing?.id) await updateJob(editing.id, editing, adminEmail);
      else await createJob(editing as any, adminEmail);
      setEditing(null);
      loadData();
    };

    const handleDelete = async (id: string) => {
      if (confirm('Delete this job permanently?')) {
        await deleteJob(id, adminEmail);
        loadData();
      }
    };

    return (
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>Job Postings ({jobs.length})</h3>
          <Button onClick={()=>setEditing({ title:'', trade:'electrician', country:'', requiredSkills:[], requiredCerts:[], company:'' })}>+ Create Job</Button>
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
      setSkills(updated);
      setNewSkill('');
    };

    const handleRemoveSkill = async (skill: string) => {
      if (!confirm(`Remove skill "${skill}"?`)) return;
      const updated = await removeTaxonomyItem('skills', skill, adminEmail);
      setSkills(updated);
    };

    const handleAddCat = async (e: any) => {
      e.preventDefault();
      if (!newCat.trim()) return;
      const updated = await addTaxonomyItem('job_categories', newCat.trim(), adminEmail);
      setCategories(updated);
      setNewCat('');
    };

    const handleRemoveCat = async (cat: string) => {
      if (!confirm(`Remove category "${cat}"?`)) return;
      const updated = await removeTaxonomyItem('job_categories', cat, adminEmail);
      setCategories(updated);
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

  const AuditView = () => (
    <Card>
      <h3 style={{ margin:'0 0 20px', fontSize:18 }}>Audit Logs (Session)</h3>
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

  /* ─── Main Render ─────────────────────────────────────────────── */
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg, fontFamily:'inherit' }}>
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
              <img src="/LOGIN.png" alt="TradeMatch" style={{ height:40, objectFit:'contain' }} />
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
          {view === 'taxonomies' && <TaxonomiesView />}
          {view === 'audit' && <AuditView />}
          {['notifications', 'settings'].includes(view) && (
            <div style={{ textAlign:'center', color:C.muted, marginTop:100 }}>
              <div style={{ fontSize:40, marginBottom:16 }}>🚧</div>
              <h3>Under Construction</h3>
              <p>This module will be connected to Firestore in the next release.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
