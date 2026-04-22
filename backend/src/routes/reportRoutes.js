// backend/src/routes/reportRoutes.js
const express = require('express');
const { createReport, getReports, updateReport, deleteReport } = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);

router.post('/', createReport);
router.get('/', getReports);
router.put('/:id', updateReport);    // RUTE EDIT
router.delete('/:id', deleteReport); // RUTE DELETE

module.exports = router;