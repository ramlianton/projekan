// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FileText, FolderKanban, Activity, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0, totalProjects: 0, recentReports: [], recentProjects: [], chartData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/analytics/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Gagal memuat statistik', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
    statBox: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    iconWrapper: (color, bg) => ({ backgroundColor: bg, color: color, padding: '1.25rem', borderRadius: '12px', display: 'flex' }),
    title: { color: '#6b7280', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' },
    number: { fontSize: '2.5rem', fontWeight: '900', color: '#1f2937', margin: 0, lineHeight: 1 },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.75rem' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px dashed #e5e7eb' },
    badge: (status) => ({ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: status === 'DONE' ? '#d1fae5' : '#fef3c7', color: status === 'DONE' ? '#065f46' : '#92400e' })
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Activity className="animate-spin" size={32} color="#3b82f6" /> Memuat Dasbor...</div>;

  return (
    <div>
      {/* KARTU STATISTIK UTAMA */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.statBox}>
            <div style={styles.iconWrapper('#2563eb', '#dbeafe')}><FileText size={36} /></div>
            <div>
              <div style={styles.title}>Total Laporan Harian</div>
              <div style={styles.number}>{stats.totalReports}</div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.statBox}>
            <div style={styles.iconWrapper('#10b981', '#d1fae5')}><FolderKanban size={36} /></div>
            <div>
              <div style={styles.title}>Total Proyek Aktif</div>
              <div style={styles.number}>{stats.totalProjects}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AREA GRAFIK KINERJA */}
      <div style={{ ...styles.card, marginBottom: '2rem' }}>
        <h3 style={styles.sectionTitle}><Activity size={20} color="#8b5cf6" /> Tren Laporan (7 Hari Terakhir)</h3>
        <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
          <ResponsiveContainer>
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Jumlah Laporan" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FEED AKTIVITAS TERBARU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Laporan Terbaru */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}><Clock size={20} color="#3b82f6" /> Laporan Harian Terbaru</h3>
          {stats.recentReports.length === 0 ? <p style={{color: '#9ca3af', textAlign:'center'}}>Belum ada aktivitas</p> : (
            stats.recentReports.map((rep) => (
              <div key={rep.id} style={styles.listItem}>
                <div>
                  <strong style={{ display: 'block', color: '#1f2937' }}>{rep.user.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{rep.notes ? rep.notes.substring(0, 40) + '...' : 'Tanpa catatan'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'right' }}>
                  {new Date(rep.date).toLocaleDateString('id-ID')}<br/>
                  <span style={{ color: rep.isSentToWa ? '#10b981' : '#ef4444' }}>{rep.isSentToWa ? 'WA Terkirim' : 'WA Gagal'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Proyek Terbaru */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}><CheckCircle size={20} color="#10b981" /> Update Proyek Terbaru</h3>
          {stats.recentProjects.length === 0 ? <p style={{color: '#9ca3af', textAlign:'center'}}>Belum ada aktivitas</p> : (
            stats.recentProjects.map((proj) => (
              <div key={proj.id} style={styles.listItem}>
                <div>
                  <strong style={{ display: 'block', color: '#1f2937' }}>{proj.template.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>PIC: {proj.user.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={styles.badge(proj.status)}>{proj.status.replace('_', ' ')}</span><br/>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(proj.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;