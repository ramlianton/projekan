// backend/src/routes/analyticsRoutes.js
const express = require('express');
const { 
  getDashboardStats, getFilteredReports, getFilteredProjects, 
  exportExcelReports, exportExcelProjects, exportPDFReports,
  exportPDFProjects // <--- IMPORT FUNGSI BARU DI SINI
} = require('../controllers/analyticsController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(verifyToken);

router.get('/stats', getDashboardStats);

router.get('/reports', getFilteredReports);
router.get('/projects', getFilteredProjects);

router.get('/export/reports/excel', exportExcelReports);
router.get('/export/reports/pdf', exportPDFReports);
router.get('/export/projects/excel', exportExcelProjects);
router.get('/export/projects/pdf', exportPDFProjects); // <--- TAMBAHKAN RUTE BARU INI

module.exports = router;