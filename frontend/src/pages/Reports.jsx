// frontend/src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Trash2, Search, Edit, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // --- FILTER, SEARCH, & PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // --- FORM STATE ---
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState([{ description: '', durationHours: '' }]);
  const [viewReport, setViewReport] = useState(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Panggil API dengan format pagination backend yang baru
      const response = await axiosInstance.get('/reports', {
        params: { search: searchTerm, date: filterDate, page, limit: 10 }
      });
      // Struktur respons sekarang di dalam { data: [...], meta: {...} }
      setReports(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotalData(response.data.meta.total);
    } catch (err) {
      console.error('Gagal mengambil laporan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page ke 1 setiap kali user mengetik pencarian baru
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterDate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchReports(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterDate, page]); // Fetch ulang jika page berubah

  // --- HANDLER TASKS & SUBMIT ---
  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };
  const addTask = () => setTasks([...tasks, { description: '', durationHours: '' }]);
  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (tasks.length === 0 || !tasks[0].description) return setError('Minimal isi satu pekerjaan!');

    try {
      const payload = { date, notes, tasks: tasks.map(t => ({ ...t, durationHours: parseFloat(t.durationHours) || 0 })) };
      if (editId) {
        await axiosInstance.put(`/reports/${editId}`, payload);
        alert('Laporan berhasil diperbarui!');
      } else {
        await axiosInstance.post('/reports', payload);
        alert('Laporan berhasil dibuat!');
      }
      resetForm(); fetchReports();
    } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan laporan'); }
  };

  const handleEdit = (report) => {
    setEditId(report.id); setDate(report.date.split('T')[0]); setNotes(report.notes || '');
    setTasks(report.tasks.length > 0 ? report.tasks : [{ description: '', durationHours: '' }]);
    setShowForm(true); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus laporan ini?')) {
      try {
        await axiosInstance.delete(`/reports/${id}`); fetchReports();
      } catch (err) { alert('Gagal menghapus laporan'); }
    }
  };

  const resetForm = () => {
    setShowForm(false); setEditId(null); setDate(new Date().toISOString().split('T')[0]); setNotes(''); setTasks([{ description: '', durationHours: '' }]);
  };

  const styles = {
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { backgroundColor: '#f9fafb', padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '1rem', borderBottom: '1px solid #e5e7eb' },
    actionBtn: { padding: '0.4rem', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem' },
    pageBtn: { padding: '0.5rem 1rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#1f2937' }}>Data Laporan Harian</h3>
        <button style={styles.btnPrimary} onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? <><X size={18} /> Batal</> : <><Plus size={18} /> Buat Laporan</>}
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      {!showForm && (
        <div style={{ ...styles.card, display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
            <input type="text" placeholder="Cari berdasarkan nama, catatan, atau pekerjaan..." style={{ ...styles.input, paddingLeft: '2.5rem', marginBottom: 0 }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div><input type="date" style={{ ...styles.input, marginBottom: 0 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} title="Filter Tanggal" /></div>
          {(searchTerm || filterDate) && <button onClick={() => { setSearchTerm(''); setFilterDate(''); }} style={{ padding: '0.5rem', cursor: 'pointer' }}>Reset Filter</button>}
        </div>
      )}

      {/* FORM BUAT / EDIT LAPORAN ... (Sama seperti sebelumnya) */}
      {showForm && (
        <div style={{ ...styles.card, border: '2px solid #2563eb' }}>
          <h4 style={{ marginTop: 0 }}>{editId ? 'Edit Laporan' : 'Laporan Baru'}</h4>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Tanggal</label><input type="date" style={styles.input} value={date} onChange={(e) => setDate(e.target.value)} required disabled={editId} /></div>
            <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Daftar Pekerjaan</label>
              {tasks.map((task, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <input type="text" style={{...styles.input, flex: 3}} placeholder="Deskripsi pekerjaan" value={task.description} onChange={(e) => handleTaskChange(index, 'description', e.target.value)} required />
                  <input type="number" style={{...styles.input, flex: 1}} placeholder="Durasi (Jam)" value={task.durationHours} onChange={(e) => handleTaskChange(index, 'durationHours', e.target.value)} />
                  <button type="button" onClick={() => removeTask(index)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.5rem' }}><Trash2 size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addTask} style={{ padding: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>+ Tambah Pekerjaan</button>
            </div>
            <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Catatan</label><textarea style={styles.input} rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
            <button type="submit" style={styles.btnPrimary}>{editId ? 'Simpan Perubahan' : 'Kirim Laporan'}</button>
          </form>
        </div>
      )}

      {/* TABEL DATA */}
      <div style={styles.card}>
        {isLoading ? <p>Memuat data...</p> : (
          <>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Tanggal</th><th style={styles.th}>Nama / Divisi</th><th style={styles.th}>Preview Pekerjaan</th><th style={styles.th}>Aksi</th></tr></thead>
              <tbody>
                {reports.length === 0 ? (<tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Data tidak ditemukan</td></tr>) : (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td style={styles.td}>{new Date(report.date).toLocaleDateString('id-ID')}</td>
                      <td style={styles.td}><strong>{report.user.name}</strong></td>
                      <td style={styles.td}>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                          {report.tasks.slice(0, 2).map(t => <li key={t.id}>{t.description}</li>)}
                          {report.tasks.length > 2 && <li style={{color: 'gray'}}>+{report.tasks.length - 2} tugas lainnya...</li>}
                        </ul>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => setViewReport(report)} style={{...styles.actionBtn, backgroundColor: '#10b981', color: 'white'}} title="Lihat Detail"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(report)} style={{...styles.actionBtn, backgroundColor: '#f59e0b', color: 'white'}} title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(report.id)} style={{...styles.actionBtn, backgroundColor: '#ef4444', color: 'white'}} title="Hapus"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* KONTROL PAGINATION */}
            {reports.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Menampilkan total <strong>{totalData}</strong> data</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button style={{ ...styles.pageBtn, opacity: page === 1 ? 0.5 : 1 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16}/> Prev</button>
                  <span style={{ margin: '0 0.5rem', fontWeight: 'bold' }}>Halaman {page} dari {totalPages || 1}</span>
                  <button style={{ ...styles.pageBtn, opacity: page === totalPages || totalPages === 0 ? 0.5 : 1 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next <ChevronRight size={16}/></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL VIEW DETAIL ... (Sama seperti sebelumnya) */}
      {viewReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Detail Laporan Harian</h3>
            <p><strong>Tanggal:</strong> {new Date(viewReport.date).toLocaleDateString('id-ID')}</p>
            <p><strong>PIC:</strong> {viewReport.user.name}</p>
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>Daftar Pekerjaan:</strong>
              <ol style={{ paddingLeft: '1.2rem' }}>{viewReport.tasks.map(t => <li key={t.id}>{t.description} {t.durationHours ? `(${t.durationHours} Jam)` : ''}</li>)}</ol>
            </div>
            <p><strong>Catatan:</strong> {viewReport.notes || '-'}</p>
            <button onClick={() => setViewReport(null)} style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;