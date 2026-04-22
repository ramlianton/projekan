// backend/src/routes/userRoutes.js
const express = require('express');
const { getUsers, updateUser, deleteUser, getProfile, updateProfile } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);

// --- RUTE PROFIL SENDIRI (Semua Role Bisa Akses) ---
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// --- RUTE MANAJEMEN USER (Khusus ADMIN) ---
router.get('/', authorizeRoles('ADMIN'), getUsers);
router.put('/:id', authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), deleteUser);

module.exports = router;