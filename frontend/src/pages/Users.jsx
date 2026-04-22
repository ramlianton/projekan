// frontend/src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Users as UsersIcon, UserPlus, Edit, Trash2, X, Save } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State Form
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [divisionId, setDivisionId] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, divRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/divisions')
      ]);
      setUsers(usersRes.data);
      setDivisions(divRes.data);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- SUBMIT: CREATE ATAU UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name, email, phone, role, 
        divisionId: divisionId ? parseInt(divisionId) : null
      };

      // Hanya kirim password jika diisi (berguna untuk mode edit)
      if (password) {
        payload.password = password;
      }

      if (editId) {
        await axiosInstance.put(`/users/${editId}`, payload);
        alert('Data pegawai berhasil diperbarui!');
      } else {
        await axiosInstance.post('/auth/register', payload);
        alert('Pegawai baru berhasil didaftarkan!');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses data pegawai');
    }
  };

  // --- HANDLER EDIT & DELETE ---
  const handleEdit = (u) => {
    setEditId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setDivisionId(u.division ? u.division.id : '');
    setPassword(''); // Kosongkan password saat mulai edit
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus pegawai ini? Tindakan ini tidak bisa dibatalkan.')) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus pegawai');
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName(''); setEmail(''); setPassword(''); setPhone(''); setRole('USER'); setDivisionId('');
    setError('');
  };

  if (currentUser.role !== 'ADMIN') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Akses Ditolak. Khusus Admin.</div>;
  }

  const styles = {
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' },
    inputGroup: { marginBottom: '1rem', flex: '1 1 calc(50% - 1rem)' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px', color: '#374151' },
    input: { width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
    btnPrimary: { backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
    btnWarning: { backgroundColor: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { backgroundColor: '#f9fafb', padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '1rem', borderBottom: '1px solid #e5e7eb' },
    actionBtn: { padding: '0.4rem', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem', color: 'white' }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <UsersIcon size={24} /> Manajemen Pegawai
      </h3>

      {/* FORM TAMBAH / EDIT USER */}
      <div style={{ ...styles.card, border: editId ? '2px solid #f59e0b' : '1px solid transparent' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0 }}>{editId ? 'Edit Data Pegawai' : 'Daftarkan Pegawai Baru'}</h4>
          {editId && (
            <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <X size={18} /> Batal Edit
            </button>
          )}
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Lengkap</label>
              <input type="text" style={styles.input} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email (Username)</label>
              <input type="email" style={styles.input} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nomor WhatsApp (Awalan 08/62)</label>
              <input type="text" style={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password {editId && <span style={{color:'gray', fontSize:'12px'}}>(Kosongkan jika tidak ingin mengubah)</span>}</label>
              <input type="password" style={styles.input} value={password} onChange={e => setPassword(e.target.value)} required={!editId} placeholder={editId ? "Ketik password baru..." : ""} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role (Hak Akses)</label>
              <select style={styles.input} value={role} onChange={e => setRole(e.target.value)}>
                <option value="USER">Staff Biasa (USER)</option>
                <option value="LEADER">Ketua Divisi (LEADER)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pilih Divisi</label>
              <select style={styles.input} value={divisionId} onChange={e => setDivisionId(e.target.value)}>
                <option value="">-- Tanpa Divisi --</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" style={editId ? styles.btnWarning : styles.btnPrimary}>
            {editId ? <><Save size={18} /> Simpan Perubahan</> : <><UserPlus size={18} /> Daftarkan</>}
          </button>
        </form>
      </div>

      {/* TABEL DATA USER */}
      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>Daftar Pegawai</h4>
        {isLoading ? <p>Memuat...</p> : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>No. WA</th>
                <th style={styles.th}>Role / Divisi</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={styles.td}><strong>{u.name}</strong></td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.phone || '-'}</td>
                  <td style={styles.td}>
                    <span style={{ backgroundColor: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'LEADER' ? '#fef3c7' : '#dbeafe', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>
                      {u.role}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {u.division ? u.division.name : '-'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {/* Cegah admin menghapus dirinya sendiri */}
                    <button onClick={() => handleEdit(u)} style={{ ...styles.actionBtn, backgroundColor: '#f59e0b' }} title="Edit"><Edit size={16} /></button>
                    {currentUser.id !== u.id && (
                      <button onClick={() => handleDelete(u.id)} style={{ ...styles.actionBtn, backgroundColor: '#ef4444' }} title="Hapus"><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;