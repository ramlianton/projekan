// frontend/src/pages/Projects.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Plus, Database, Settings, Clock, CheckCircle, FilePlus2, Save, Search, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- FILTER, SEARCH, & PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  // Toggles Form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // --- STATE: ADMIN TEMPLATE BUILDER ---
  const [templateName, setTemplateName] = useState('');
  const [templateFields, setTemplateFields] = useState([{ fieldName: '', fieldType: 'text' }]);

  // --- STATE: USER PROJECT ENTRY / EDIT ---
  const [editId, setEditId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [dynamicValues, setDynamicValues] = useState({});
  const [initialNote, setInitialNote] = useState('');

  // --- STATE: UPDATE STATUS PROYEK ---
  const [updatingProjectId, setUpdatingProjectId] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, templatesRes] = await Promise.all([
        axiosInstance.get('/projects', { 
          params: { search: searchTerm, status: filterStatus, templateId: filterTemplate, page, limit: 10 } 
        }),
        axiosInstance.get('/templates')
      ]);
      
      // PERBAIKAN: Membaca struktur data pagination
      setProjects(projectsRes.data.data);
      setTotalPages(projectsRes.data.meta.totalPages);
      setTotalData(projectsRes.data.meta.total);
      
      setTemplates(templatesRes.data);
    } catch (err) { console.error('Gagal mengambil data:', err); } 
    finally { setIsLoading(false); }
  };

  // Reset page ke 1 setiap kali filter diubah
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus, filterTemplate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStatus, filterTemplate, page]); // Fetch ulang jika page berubah

  // ==========================================
  // LOGIKA ADMIN: BUAT TEMPLATE
  // ==========================================
  const handleAddField = () => setTemplateFields([...templateFields, { fieldName: '', fieldType: 'text' }]);
  const handleRemoveField = (index) => setTemplateFields(templateFields.filter((_, i) => i !== index));
  const handleFieldChange = (index, key, value) => {
    const newFields = [...templateFields];
    newFields[index][key] = value;
    setTemplateFields(newFields);
  };

  const submitTemplate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/templates', { name: templateName, fields: templateFields });
      setTemplateName(''); setTemplateFields([{ fieldName: '', fieldType: 'text' }]);
      setShowTemplateForm(false); fetchData(); alert('Template berhasil dibuat!');
    } catch (err) { setError(err.response?.data?.message || 'Gagal membuat template'); }
  };

  // ==========================================
  // LOGIKA USER: BUAT / EDIT PROYEK
  // ==========================================
  const handleTemplateSelect = (e) => {
    setSelectedTemplateId(e.target.value);
    setDynamicValues({});
  };

  const handleDynamicInputChange = (fieldId, value) => {
    setDynamicValues({ ...dynamicValues, [fieldId]: value });
  };

  const submitProject = async (e) => {
    e.preventDefault();
    try {
      const valuesArray = Object.keys(dynamicValues).map(key => ({ fieldId: parseInt(key), value: dynamicValues[key] }));
      
      if (editId) {
        await axiosInstance.put(`/projects/${editId}`, { values: valuesArray });
        alert('Data proyek berhasil diperbarui!');
      } else {
        await axiosInstance.post('/projects', { templateId: selectedTemplateId, values: valuesArray, note: initialNote });
        alert('Proyek berhasil disubmit!');
      }
      resetForm(); fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan proyek'); }
  };

  const handleEdit = (project) => {
    setEditId(project.id);
    setSelectedTemplateId(project.templateId);
    const vals = {};
    project.values.forEach(v => { vals[v.fieldId] = v.field.fieldType === 'date' && v.value ? new Date(v.value).toISOString().split('T')[0] : v.value; });
    setDynamicValues(vals);
    setShowProjectForm(true); setShowTemplateForm(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus proyek ini? Semua data EAV dan Log akan hilang permanen.')) {
      try {
        await axiosInstance.delete(`/projects/${id}`);
        fetchData();
      } catch (err) { alert('Gagal menghapus proyek'); }
    }
  };

  const resetForm = () => {
    setShowProjectForm(false); setEditId(null); setSelectedTemplateId(''); setDynamicValues({}); setInitialNote('');
  };

  const submitUpdate = async (e, projectId) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/projects/${projectId}/status`, { status: updateStatus, note: updateNote });
      setUpdatingProjectId(null); setUpdateStatus(''); setUpdateNote(''); fetchData();
    } catch (err) { alert('Gagal update status proyek'); }
  };

  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    btnAdmin: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#4f46e5', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    btnDanger: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' },
    btnWarning: { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' },
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
    input: { width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    pageBtn: { padding: '0.5rem 1rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
    badge: (status) => ({
      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px',
      backgroundColor: status === 'DONE' ? '#d1fae5' : status === 'CANCEL' ? '#fee2e2' : status === 'ON_PROGRESS' ? '#fef3c7' : '#e0e7ff',
      color: status === 'DONE' ? '#065f46' : status === 'CANCEL' ? '#991b1b' : status === 'ON_PROGRESS' ? '#92400e' : '#3730a3'
    })
  };

  const activeTemplate = templates.find(t => t.id === parseInt(selectedTemplateId));

  return (
    <div>
      <div style={styles.header}>
        <h3 style={{ margin: 0, color: '#1f2937' }}>Manajemen Proyek (EAV)</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'ADMIN' && (
            <button style={styles.btnAdmin} onClick={() => { setShowTemplateForm(!showTemplateForm); resetForm(); }}>
              <Settings size={18} /> {showTemplateForm ? 'Tutup Builder' : 'Buat Template'}
            </button>
          )}
          <button style={styles.btnPrimary} onClick={() => showProjectForm ? resetForm() : setShowProjectForm(true)}>
            {showProjectForm ? <><X size={18} /> Batal</> : <><FilePlus2 size={18} /> Input Proyek</>}
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      {!showProjectForm && !showTemplateForm && (
        <div style={{ ...styles.card, display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
            <input type="text" placeholder="Cari nama PIC atau isi data proyek..." style={{ ...styles.input, paddingLeft: '2.5rem', marginBottom: 0 }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select style={{ ...styles.input, width: 'auto', marginBottom: 0 }} value={filterTemplate} onChange={e => setFilterTemplate(e.target.value)}>
            <option value="">Semua Template</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select style={{ ...styles.input, width: 'auto', marginBottom: 0 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="ON_PROGRESS">ON PROGRESS</option>
            <option value="DONE">DONE</option>
            <option value="CANCEL">CANCEL</option>
          </select>
        </div>
      )}

      {/* FORM: TEMPLATE BUILDER (ADMIN) */}
      {showTemplateForm && user.role === 'ADMIN' && (
        <div style={{...styles.card, border: '2px dashed #4f46e5'}}>
          <h4 style={{ marginTop: 0, color: '#4f46e5' }}>Template Builder (EAV)</h4>
          <form onSubmit={submitTemplate}>
            <input type="text" style={styles.input} placeholder="Nama Template (Misal: Instalasi Jaringan)" value={templateName} onChange={e => setTemplateName(e.target.value)} required />
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
              <label style={styles.label}>Definisi Kolom Dinamis</label>
              {templateFields.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <input type="text" style={{...styles.input, marginBottom: 0, flex: 2}} placeholder="Nama Kolom" value={field.fieldName} onChange={e => handleFieldChange(index, 'fieldName', e.target.value)} required />
                  <select style={{...styles.input, marginBottom: 0, flex: 1}} value={field.fieldType} onChange={e => handleFieldChange(index, 'fieldType', e.target.value)}>
                    <option value="text">Teks Pendek</option><option value="number">Angka</option><option value="date">Tanggal</option>
                  </select>
                  {templateFields.length > 1 && <button type="button" style={styles.btnDanger} onClick={() => handleRemoveField(index)}><X size={18} /></button>}
                </div>
              ))}
              <button type="button" onClick={handleAddField} style={{ padding: '0.5rem', cursor: 'pointer' }}>+ Tambah Kolom</button>
            </div>
            <button type="submit" style={styles.btnAdmin}>Simpan Template</button>
          </form>
        </div>
      )}

      {/* FORM: BUAT / EDIT PROYEK (USER) */}
      {showProjectForm && (
        <div style={{...styles.card, border: editId ? '2px solid #f59e0b' : '2px solid #2563eb'}}>
          <h4 style={{ marginTop: 0 }}>{editId ? 'Edit Data Proyek' : 'Input Proyek Baru'}</h4>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <form onSubmit={submitProject}>
            <label style={styles.label}>1. Pilih Template</label>
            <select style={styles.input} value={selectedTemplateId} onChange={handleTemplateSelect} required disabled={editId !== null}>
              <option value="">-- Pilih Template Proyek --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            {activeTemplate && (
              <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
                <h5 style={{ marginTop: 0, color: '#166534' }}>2. Isi Data Spesifik: {activeTemplate.name}</h5>
                {activeTemplate.fields.map(field => (
                  <div key={field.id} style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>{field.fieldName}</label>
                    <input type={field.fieldType} style={{...styles.input, marginBottom: 0}} value={dynamicValues[field.id] || ''} onChange={(e) => handleDynamicInputChange(field.id, e.target.value)} required />
                  </div>
                ))}
              </div>
            )}

            {activeTemplate && !editId && (
              <>
                <label style={styles.label}>3. Catatan Awal (Opsional)</label>
                <textarea style={styles.input} rows="2" placeholder="Catatan awal..." value={initialNote} onChange={e => setInitialNote(e.target.value)}></textarea>
              </>
            )}

            {activeTemplate && <button type="submit" style={{...styles.btnPrimary, backgroundColor: editId ? '#f59e0b' : '#2563eb'}}>{editId ? 'Simpan Perubahan EAV' : 'Simpan Proyek'}</button>}
          </form>
        </div>
      )}

      {/* GRID DAFTAR PROYEK */}
      {isLoading ? <p>Memuat proyek...</p> : (
        <div>
          <div style={styles.grid}>
            {projects.length === 0 ? <p style={{ color: '#6b7280' }}>Data tidak ditemukan.</p> : null}
            
            {projects.map((project) => (
              <div key={project.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={styles.badge(project.status)}>
                      {project.status === 'DONE' ? <CheckCircle size={12}/> : project.status === 'PENDING' ? <Clock size={12}/> : null} {project.status.replace('_', ' ')}
                    </span>
                    <h4 style={{ margin: '0.5rem 0 0 0' }}>Proyek #{project.id}</h4>
                    <small style={{ color: '#6b7280' }}>Tipe: {project.template?.name}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {(user.role === 'ADMIN' || user.id === project.userId) && (
                      <>
                        <button onClick={() => handleEdit(project)} style={styles.btnWarning} title="Edit Data"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(project.id)} style={styles.btnDanger} title="Hapus Proyek"><Trash2 size={16}/></button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>PIC: <strong>{project.user?.name}</strong></p>
                  {project.values.map(val => (
                    <div key={val.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px dashed #d1d5db', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#4b5563' }}>{val.field.fieldName}</span>
                      <strong style={{ textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%' }}>
                        {val.field.fieldType === 'date' && val.value ? new Date(val.value).toLocaleDateString('id-ID') : val.value}
                      </strong>
                    </div>
                  ))}
                </div>

                {updatingProjectId === project.id ? (
                  <form onSubmit={(e) => submitUpdate(e, project.id)} style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '6px' }}>
                    <select style={{...styles.input, padding: '0.5rem'}} value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} required>
                      <option value="">Ubah Status</option><option value="PENDING">PENDING</option><option value="ON_PROGRESS">ON PROGRESS</option><option value="DONE">DONE</option><option value="CANCEL">CANCEL</option>
                    </select>
                    <input type="text" style={{...styles.input, padding: '0.5rem'}} placeholder="Catatan progress..." value={updateNote} onChange={e => setUpdateNote(e.target.value)} required />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{...styles.btnPrimary, padding: '0.5rem', flex: 1}}><Save size={14}/> Simpan</button>
                      <button type="button" onClick={() => setUpdatingProjectId(null)} style={{ padding: '0.5rem', flex: 1, cursor: 'pointer' }}>Batal</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => { setUpdatingProjectId(project.id); setUpdateStatus(project.status); }} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#374151' }}>
                    + Update Progress & Status
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* KONTROL PAGINATION UNTUK GRID PROYEK */}
          {projects.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Menampilkan total <strong>{totalData}</strong> data</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button style={{ ...styles.pageBtn, opacity: page === 1 ? 0.5 : 1 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16}/> Prev</button>
                <span style={{ margin: '0 0.5rem', fontWeight: 'bold' }}>Halaman {page} dari {totalPages || 1}</span>
                <button style={{ ...styles.pageBtn, opacity: page === totalPages || totalPages === 0 ? 0.5 : 1 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next <ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;