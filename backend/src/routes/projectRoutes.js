// backend/src/routes/projectRoutes.js
const express = require('express');
const { createProject, getProjects, updateProject, deleteProject, updateProjectStatus } = require('../controllers/projectController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.post('/', createProject);
router.get('/', getProjects);

// Rute CRUD Baru
router.put('/:id', updateProject);      // Rute Edit Data Proyek
router.delete('/:id', deleteProject);   // Rute Hapus Proyek

// Rute khusus untuk update status & log
router.put('/:id/status', updateProjectStatus); 

module.exports = router;