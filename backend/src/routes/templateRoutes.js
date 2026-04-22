// backend/src/routes/templateRoutes.js
const express = require('express');
const { createTemplate, getTemplates } = require('../controllers/templateController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.post('/', authorizeRoles('ADMIN'), createTemplate); // Hanya Admin yang bisa buat template
router.get('/', getTemplates);

module.exports = router;