// frontend/src/pages/Divisions.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Network, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null); // State untuk melacak ID yang sedang diedit
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchDivisions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/divisions');
      setDivisions(response.data);
    } catch (err) {
      console.error('Gagal mengambil divisi', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  // --- SUBMIT: CREATE ATAU UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        // Mode Update
        await axiosInstance.put(`/divisions/${editId}`, { name });
        alert('Divisi berhasil diperbarui!');
      } else {
        // Mode Create
        await axiosInstance.post('/divisions', { name });
        alert('Divisi berhasil ditambahkan!');
      }
      resetForm();
      fetchDivisions();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses divisi');
    }
  };

  // --- HANDLER EDIT & DELETE ---
  const handleEdit = (div) => {
    setEditId(div.id);
    setName(div.name);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus divisi ini? Pastikan tidak ada pegawai yang terikat dengan divisi ini.')) {
      try {
        await axiosInstance.delete(`/divisions/${id}`);
        fetchDivisions();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus divisi');
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setError('');
  };

  if (user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>
        <h2>Akses Ditolak</h2>
        <p>Halaman ini hanya dapat diakses oleh Administrator.</p>
      </div>
    );
  }

  const styles = {
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' },
    input: { width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '1rem' },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    btnWarning: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { backgroundColor: '#f9fafb', padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '1rem', borderBottom: '1px solid #e5e7eb' },
    actionBtn: { padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem', color: 'white' }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Network size={24} /> Manajemen Divisi
      </h3>

      {/* FORM TAMBAH / EDIT DIVISI */}
      <div style={{ ...styles.card, border: editId ? '2px solid #f59e0b' : '1px solid transparent' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0 }}>{editId ? 'Edit Divisi' : 'Tambah Divisi Baru'}</h4>
          {editId && (
            <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <X size={18} /> Batal Edit
            </button>
          )}
        </div>
        
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              style={styles.input} 
              placeholder="Nama Divisi (Misal: IT, HRD, Marketing)" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" style={editId ? styles.btnWarning : styles.btnPrimary}>
            {editId ? <><Save size={18} /> Simpan</> : <><Plus size={18} /> Tambah</>}
          </button>
        </form>
      </div>

      {/* TABEL DIVISI */}
      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>Daftar Divisi</h4>
        {isLoading ? <p>Memuat...</p> : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nama Divisi</th>
                <th style={styles.th}>Tanggal Dibuat</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {divisions.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Belum ada data divisi</td></tr>
              ) : (
                divisions.map((div) => (
                  <tr key={div.id}>
                    <td style={styles.td}>#{div.id}</td>
                    <td style={styles.td}><strong>{div.name}</strong></td>
                    <td style={styles.td}>{new Date(div.createdAt).toLocaleDateString('id-ID')}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(div)} style={{ ...styles.actionBtn, backgroundColor: '#f59e0b' }} title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(div.id)} style={{ ...styles.actionBtn, backgroundColor: '#ef4444' }} title="Hapus"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Divisions;