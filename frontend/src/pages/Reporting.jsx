// frontend/src/pages/Reporting.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Filter, FileSpreadsheet, FileText, Search } from 'lucide-react';

const Reporting = () => {
  const [activeTab, setActiveTab] = useState('harian'); // 'harian' atau 'proyek'
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Data Pendukung untuk Filter
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  // --- FILTER STATE: LAPORAN HARIAN ---
  const [repUserId, setRepUserId] = useState('');
  const [repMonth, setRepMonth] = useState(new Date().getMonth() + 1);
  const [repYear, setRepYear] = useState(new Date().getFullYear());

  // --- FILTER STATE: LAPORAN PROYEK ---
  const [projTemplateId, setProjTemplateId] = useState('');
  const [projStatus, setProjStatus] = useState('');
  const [projStartDate, setProjStartDate] = useState('');
  const [projEndDate, setProjEndDate] = useState('');

  useEffect(() => {
    // Ambil data dropdown (Users dan Templates)
    const fetchDropdowns = async () => {
      try {
        if (currentUser.role !== 'USER') {
          const uRes = await axiosInstance.get('/users');
          setUsers(uRes.data);
        }
        const tRes = await axiosInstance.get('/templates');
        setTemplates(tRes.data);
      } catch (err) { console.error("Gagal load dropdown", err); }
    };
    fetchDropdowns();
  }, []);

  const handleFilter = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'harian') {
        const res = await axiosInstance.get('/analytics/reports', {
          params: { userId: repUserId, month: repMonth, year: repYear }
        });
        setData(res.data);
      } else {
        const res = await axiosInstance.get('/analytics/projects', {
          params: { templateId: projTemplateId, status: projStatus, startDate: projStartDate, endDate: projEndDate }
        });
        setData(res.data);
      }
    } catch (err) { alert('Gagal memuat data laporan'); }
    finally { setIsLoading(false); }
  };

  const handleExport = async (format) => {
    try {
      const endpoint = activeTab === 'harian' 
        ? `/analytics/export/reports/${format}` 
        : `/analytics/export/projects/${format}`;
      
      const params = activeTab === 'harian' 
        ? { userId: repUserId, month: repMonth, year: repYear }
        : { templateId: projTemplateId, status: projStatus, startDate: projStartDate, endDate: projEndDate };

      const response = await axiosInstance.get(endpoint, { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_${activeTab}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) { alert('Gagal mendownload file'); }
  };

  const styles = {
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
    tabBtn: (isActive) => ({ flex: 1, padding: '1rem', border: 'none', borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent', backgroundColor: isActive ? '#eff6ff' : 'white', fontWeight: 'bold', color: isActive ? '#1e40af' : '#6b7280', cursor: 'pointer' }),
    input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', marginRight: '0.5rem', marginBottom: '0.5rem' },
    btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' },
    btnSuccess: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' },
    btnDanger: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' },
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>Pusat Pelaporan & Analitik</h3>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '8px 8px 0 0', overflow: 'hidden', borderBottom: '1px solid #e5e7eb' }}>
        <button style={styles.tabBtn(activeTab === 'harian')} onClick={() => { setActiveTab('harian'); setData([]); }}>Laporan Harian</button>
        <button style={styles.tabBtn(activeTab === 'proyek')} onClick={() => { setActiveTab('proyek'); setData([]); }}>Laporan Proyek (EAV)</button>
      </div>

      {/* Filter Area */}
      <div style={{...styles.card, borderRadius: '0 0 8px 8px'}}>
        <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <strong style={{ marginRight: '1rem' }}><Filter size={18} /> Filter:</strong>
          
          {activeTab === 'harian' ? (
             <>
               {currentUser.role !== 'USER' && (
                 <select style={styles.input} value={repUserId} onChange={e => setRepUserId(e.target.value)}>
                   <option value="">Semua User</option>
                   {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                 </select>
               )}
               <select style={styles.input} value={repMonth} onChange={e => setRepMonth(e.target.value)}>
                 {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
               </select>
               <input type="number" style={styles.input} value={repYear} onChange={e => setRepYear(e.target.value)} placeholder="Tahun" />
             </>
          ) : (
             <>
               <select style={styles.input} value={projTemplateId} onChange={e => setProjTemplateId(e.target.value)}>
                 <option value="">Semua Template</option>
                 {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
               <select style={styles.input} value={projStatus} onChange={e => setProjStatus(e.target.value)}>
                 <option value="">Semua Status</option>
                 <option value="PENDING">PENDING</option>
                 <option value="ON_PROGRESS">ON PROGRESS</option>
                 <option value="DONE">DONE</option>
                 <option value="CANCEL">CANCEL</option>
               </select>
               <input type="date" style={styles.input} value={projStartDate} onChange={e => setProjStartDate(e.target.value)} title="Tanggal Mulai" />
               <input type="date" style={styles.input} value={projEndDate} onChange={e => setProjEndDate(e.target.value)} title="Tanggal Akhir" />
             </>
          )}
          
          <button type="submit" style={styles.btnPrimary}><Search size={16} /> Tampilkan Data</button>
        </form>
      </div>

      {/* Preview & Export Area */}
      {data.length > 0 && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>Pratinjau Data ({data.length} Baris)</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleExport('excel')} style={styles.btnSuccess}><FileSpreadsheet size={16} /> Export Excel</button>
              {/* Tombol PDF sekarang muncul untuk kedua tab (Harian & Proyek) */}
              <button onClick={() => handleExport('pdf')} style={styles.btnDanger}><FileText size={16} /> Export PDF</button>
            </div>
          </div>

          {/* Simple Preview List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '1rem' }}>
            {data.map((item, idx) => (
              <div key={item.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong>{idx + 1}. {activeTab === 'harian' ? new Date(item.date).toLocaleDateString() : item.template.name}</strong> - PIC: {item.user.name} 
                {activeTab === 'proyek' && <span style={{ float: 'right', fontWeight: 'bold' }}>Status: {item.status}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporting;