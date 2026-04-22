// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { User, Key, Save } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State Form Profil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // State Form Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/users/profile');
        setProfile(response.data);
        setName(response.data.name);
        setPhone(response.data.phone || '');
      } catch (err) {
        setError('Gagal memuat profil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Validasi Password Baru
    if (newPassword && newPassword !== confirmPassword) {
      return setError('Password baru dan konfirmasi password tidak cocok!');
    }
    if (newPassword && !oldPassword) {
      return setError('Harap masukkan password lama Anda untuk mengganti password.');
    }

    try {
      const payload = { name, phone };
      if (oldPassword && newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      const response = await axiosInstance.put('/users/profile', payload);
      setSuccess(response.data.message);
      
      // Kosongkan form password setelah berhasil
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');

      // Update LocalStorage agar nama di Header aplikasi ikut berubah seketika
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...currentUserData, name: response.data.user.name }));
      
      // Pemicu event untuk merefresh Header
      window.dispatchEvent(new Event('storage'));

    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil');
    }
  };

  const styles = {
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px', color: '#374151' },
    input: { width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
    inputDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' },
    btnPrimary: { backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }
  };

  if (isLoading) return <p>Memuat profil...</p>;

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <User size={24} /> Pengaturan Profil
      </h3>

      {error && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: '#059669', backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={handleUpdateProfile}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* BAGIAN DATA DIRI */}
          <div style={styles.card}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Data Diri</h4>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Lengkap</label>
              <input type="text" style={styles.input} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nomor WhatsApp</label>
              <input type="text" style={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Contoh: 081234..." />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email (Tidak dapat diubah)</label>
              <input type="text" style={{...styles.input, ...styles.inputDisabled}} value={profile?.email} disabled />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, ...styles.inputGroup }}>
                <label style={styles.label}>Role Akses</label>
                <input type="text" style={{...styles.input, ...styles.inputDisabled}} value={profile?.role} disabled />
              </div>
              <div style={{ flex: 1, ...styles.inputGroup }}>
                <label style={styles.label}>Divisi</label>
                <input type="text" style={{...styles.input, ...styles.inputDisabled}} value={profile?.division?.name || 'Tanpa Divisi'} disabled />
              </div>
            </div>
          </div>

          {/* BAGIAN GANTI PASSWORD */}
          <div style={styles.card}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} /> Keamanan & Password
            </h4>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>Kosongkan bagian ini jika Anda tidak ingin mengubah password.</p>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password Lama</label>
              <input type="password" style={styles.input} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Masukkan password saat ini..." />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password Baru</label>
              <input type="password" style={styles.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Masukkan password baru..." />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Konfirmasi Password Baru</label>
              <input type="password" style={styles.input} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru..." />
            </div>
          </div>
        </div>

        <button type="submit" style={styles.btnPrimary}>
          <Save size={18} /> Simpan Perubahan Profil
        </button>
      </form>
    </div>
  );
};

export default Profile;