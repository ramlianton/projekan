const express = require('express');
const { createDivision, getDivisions, updateDivision, deleteDivision } = require('../controllers/divisionController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute di bawah ini butuh token valid
router.use(verifyToken);

router.post('/', authorizeRoles('ADMIN'), createDivision);
router.get('/', getDivisions);

// --- RUTE BARU (Khusus ADMIN) ---
router.put('/:id', authorizeRoles('ADMIN'), updateDivision);
router.delete('/:id', authorizeRoles('ADMIN'), deleteDivision);

module.exports = router;