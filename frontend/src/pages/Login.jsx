// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Login = () => {
  // State untuk menyimpan input form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk UI feedback
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh saat form disubmit
    setError('');
    setIsLoading(true);

    try {
      // Menembak API Login yang kita buat di Step 4
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });

      // Jika berhasil, simpan Token dan Data User ke Local Storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Arahkan user ke halaman Dashboard
      navigate('/dashboard');
    } catch (err) {
      // Tangkap pesan error dari backend (misal: "Password salah!")
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login server');
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI/UX Styling Sederhana (Inline) ---
  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' },
    card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    title: { textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937', fontFamily: 'sans-serif' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#4b5563', fontSize: '14px', fontFamily: 'sans-serif' },
    input: { width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    error: { color: '#dc2626', fontSize: '14px', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sistem Kinerja & Proyek</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Masukkan email Anda"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Masukkan password Anda"
            />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;