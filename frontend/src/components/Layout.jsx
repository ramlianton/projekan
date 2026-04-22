// frontend/src/components/Layout.jsx
import React from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderKanban, BarChart, Network, Users, LogOut, User } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data user dari local storage untuk menampilkan nama dan role
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- UI/UX Styling Sederhana (Inline) ---
  // --- UI/UX Styling Sederhana (Inline) ---
const styles = {
  container: { 
    display: 'flex', 
    height: '100vh', 
    backgroundColor: '#f3f4f6', 
    fontFamily: 'sans-serif' 
  },

  sidebar: { 
    width: '260px', 
    backgroundColor: '#1f2937', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column' 
  },

  // 🔥 UPDATED LOGO STYLE
  logo: { 
  padding: '1.2rem 1.5rem',
  borderBottom: '1px solid #374151',

  display: 'flex',
  alignItems: 'center',
  gap: '-10px',

  height: '40px',        // 🔥 kunci tinggi background
  overflow: 'hidden',     // 🔥 cegah logo bikin container membesar
},

  logoImg: {
  width: '110px',
  height: '110px',
  objectFit: 'contain',
  flexShrink: 0, // 🔥 biar gak ngecil
  marginLeft: '-45px'
},

  logoText: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    letterSpacing: '2px',
    color: '#e5e7eb',
    textShadow: '1px 1px 2px black',
    textTransform: 'uppercase'
  },

  nav: { 
    flex: 1, 
    padding: '1rem 0', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.5rem' 
  },

  link: (isActive) => ({ 
    display: 'flex', 
    alignItems: 'center', 
    padding: '0.75rem 1.5rem', 
    color: isActive ? '#60a5fa' : '#d1d5db', 
    textDecoration: 'none', 
    gap: '12px', 
    backgroundColor: isActive ? '#374151' : 'transparent',
    borderRight: isActive ? '4px solid #60a5fa' : '4px solid transparent',
    transition: 'all 0.2s'
  }),

  logoutBtn: { 
    padding: '1rem', 
    borderTop: '1px solid #374151', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    color: '#f87171', 
    backgroundColor: 'transparent', 
    border: 'none', 
    width: '100%', 
    fontSize: '1rem', 
    transition: 'background 0.2s' 
  },

  main: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '2rem' 
  },

  header: { 
    marginBottom: '2rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: '1rem 2rem', 
    borderRadius: '8px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
  },

  headerTitle: { 
    margin: 0, 
    color: '#111827' 
  },

  userInfo: { 
    fontSize: '0.9rem', 
    color: '#4b5563', 
    backgroundColor: '#f3f4f6', 
    padding: '0.5rem 1rem', 
    borderRadius: '9999px' 
  },

  logoHighlight: {
  color: '#60a5fa',
  textShadow: '0 0 6px rgba(96,165,250,0.6)'
    },
    logoTextContainer: {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: '1.1'
},

logoSubText: {
  fontSize: '0.7rem',
  color: '#9ca3af',
  letterSpacing: '1px'
}
};

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
  <img src="/favicon.svg" alt="logo" style={styles.logoImg} />

  <div style={styles.logoTextContainer}>
    <span style={styles.logoText}>
      PROJEK<span style={styles.logoHighlight}>AN</span>
    </span>
    <span style={styles.logoSubText}>
      Manajemen Proyek PT.Alfatih Utama Akses
    </span>
  </div>
</div>
        <nav style={styles.nav}>
          {/* MENU UMUM (Semua Role Bisa Lihat) */}
          <Link to="/dashboard" style={styles.link(location.pathname === '/dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/reports" style={styles.link(location.pathname === '/reports')}>
            <FileText size={20} /> Laporan Harian
          </Link>
          <Link to="/projects" style={styles.link(location.pathname === '/projects')}>
            <FolderKanban size={20} /> Manajemen Proyek
          </Link>
          <Link to="/reporting" style={styles.link(location.pathname === '/reporting')}>
            <BarChart size={20} /> Pusat Pelaporan
          </Link>
          <Link to="/profile" style={styles.link(location.pathname === '/profile')}>
            <User size={20} /> Profil Saya
          </Link>

          {/* MENU KHUSUS ADMIN (Hanya muncul jika role == ADMIN) */}
          {user.role === 'ADMIN' && (
            <>
              <div style={{ marginTop: '1rem', padding: '0 1.5rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Admin Area
              </div>
              <Link to="/divisions" style={styles.link(location.pathname === '/divisions')}>
                <Network size={20} /> Divisi
              </Link>
              <Link to="/users" style={styles.link(location.pathname === '/users')}>
                <Users size={20} /> Pegawai
              </Link>
            </>
          )}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <div style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>Sistem Manajemen</h2>
          <div style={styles.userInfo}>
            Halo, <strong>{user.name}</strong> ({user.role})
          </div>
        </header>
        
        {/* Outlet adalah tempat di mana komponen halaman (seperti Dashboard) akan dirender */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;