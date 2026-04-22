// backend/src/controllers/analyticsController.js
const prisma = require('../config/prisma');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

// --- 1. AMBIL STATISTIK DASBOR (UPGRADED) ---
const getDashboardStats = async (req, res) => {
  try {
    const { role, id, divisionId } = req.user;
    let reportCond = {}, projectCond = {};

    if (role === 'USER') { 
      reportCond.userId = id; projectCond.userId = id; 
    } else if (role === 'LEADER') { 
      reportCond.user = { divisionId }; projectCond.divisionId = divisionId; 
    }

    // 1. Total Angka
    const totalReports = await prisma.dailyReport.count({ where: reportCond });
    const totalProjects = await prisma.projectEntry.count({ where: projectCond });

    // 2. Ambil 5 Laporan Terbaru
    const recentReports = await prisma.dailyReport.findMany({
      where: reportCond,
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
      take: 5
    });

    // 3. Ambil 5 Proyek Terbaru
    const recentProjects = await prisma.projectEntry.findMany({
      where: projectCond,
      include: { 
        user: { select: { name: true } },
        template: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 4. Data Grafik (7 Hari Terakhir Laporan)
    const chartDataMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartDataMap[d.toISOString().split('T')[0]] = 0; // Inisialisasi 0
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reportsLast7Days = await prisma.dailyReport.findMany({
      where: { ...reportCond, date: { gte: sevenDaysAgo } },
      select: { date: true }
    });

    reportsLast7Days.forEach(r => {
      const dateString = r.date.toISOString().split('T')[0];
      if (chartDataMap[dateString] !== undefined) {
        chartDataMap[dateString]++;
      }
    });

    // Format untuk chart library (recharts)
    const chartData = Object.keys(chartDataMap).map(key => ({
      tanggal: new Date(key).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      total: chartDataMap[key]
    }));

    res.status(200).json({ 
      totalReports, 
      totalProjects, 
      recentReports, 
      recentProjects,
      chartData 
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// --- Helper Filter ---
const buildReportFilter = (req) => {
  const { role, id, divisionId } = req.user;
  const { userId, month, year } = req.query;
  let where = {};

  if (role === 'USER') where.userId = id;
  else if (role === 'LEADER') where.user = { divisionId };

  if (userId && role !== 'USER') where.userId = parseInt(userId);
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    where.date = { gte: startDate, lte: endDate };
  }
  return where;
};

const buildProjectFilter = (req) => {
  const { role, id, divisionId } = req.user;
  const { templateId, status, startDate, endDate } = req.query;
  let where = {};

  if (role === 'USER') where.userId = id;
  else if (role === 'LEADER') where.divisionId = divisionId;

  if (templateId) where.templateId = parseInt(templateId);
  if (status) where.status = status;
  if (startDate && endDate) {
    where.createdAt = { gte: new Date(startDate), lte: new Date(endDate + 'T23:59:59Z') };
  }
  return where;
};

// --- 2. GET DATA JSON UNTUK PREVIEW FRONTEND ---
const getFilteredReports = async (req, res) => {
  try {
    const reports = await prisma.dailyReport.findMany({
      where: buildReportFilter(req),
      include: { user: { select: { name: true } }, tasks: true },
      orderBy: { date: 'desc' }
    });
    res.status(200).json(reports);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getFilteredProjects = async (req, res) => {
  try {
    const projects = await prisma.projectEntry.findMany({
      where: buildProjectFilter(req),
      include: { 
        user: { select: { name: true } }, template: { select: { name: true } },
        values: { include: { field: { select: { fieldName: true, fieldType: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 3. EXPORT EXCEL ---
const exportExcelReports = async (req, res) => {
  try {
    const reports = await prisma.dailyReport.findMany({
      where: buildReportFilter(req),
      include: { user: true, tasks: true },
      orderBy: { date: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Harian');

    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Nama Pegawai', key: 'name', width: 25 },
      { header: 'Daftar Pekerjaan', key: 'tasks', width: 40 },
      { header: 'Catatan', key: 'notes', width: 30 }
    ];

    reports.forEach((report) => {
      const taskString = report.tasks.map((t, i) => `${i+1}. ${t.description}`).join('\n');
      worksheet.addRow({
        date: report.date.toISOString().split('T')[0],
        name: report.user.name,
        tasks: taskString,
        notes: report.notes || '-'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Harian.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const exportExcelProjects = async (req, res) => {
  try {
    const projects = await prisma.projectEntry.findMany({
      where: buildProjectFilter(req),
      include: { 
        user: true, template: true,
        values: { include: { field: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Proyek');

    // Kolom Statis
    let columns = [
      { header: 'Tanggal Input', key: 'date', width: 15 },
      { header: 'Nama PIC', key: 'pic', width: 25 },
      { header: 'Template', key: 'template', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Karena EAV, kita kumpulkan semua field dinamis unik dari data yang ditarik untuk dijadikan kolom
    const dynamicFieldsMap = new Set();
    projects.forEach(p => p.values.forEach(v => dynamicFieldsMap.add(v.field.fieldName)));
    
    dynamicFieldsMap.forEach(field => {
      columns.push({ header: field, key: field, width: 20 });
    });

    worksheet.columns = columns;

    projects.forEach((project) => {
      let rowData = {
        date: project.createdAt.toISOString().split('T')[0],
        pic: project.user.name,
        template: project.template.name,
        status: project.status
      };
      
      // Petakan value EAV ke kolom masing-masing
      project.values.forEach(v => {
        rowData[v.field.fieldName] = v.field.fieldType === 'date' ? new Date(v.value).toLocaleDateString('id-ID') : v.value;
      });

      worksheet.addRow(rowData);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Proyek.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 4. EXPORT PDF LAPORAN HARIAN (BENTUK TABEL - PORTRAIT) ---
const exportPDFReports = async (req, res) => {
  try {
    const reports = await prisma.dailyReport.findMany({
      where: buildReportFilter(req),
      include: { user: true, tasks: true },
      orderBy: { date: 'desc' }
    });

    // UBAH KE PORTRAIT: Menggunakan A4 dengan layout portrait
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Harian.pdf');
    doc.pipe(res);

    // Judul
    doc.fontSize(16).font('Helvetica-Bold').text('Rekapitulasi Laporan Harian', { align: 'center' });
    doc.moveDown(1.5);

    if (reports.length === 0) {
      doc.fontSize(12).font('Helvetica').text('Tidak ada data laporan harian pada periode ini.', { align: 'center' });
      doc.end();
      return;
    }

    // Siapkan baris data tabel
    const tableRows = reports.map(report => {
      // Gabungkan semua multi-list task menjadi satu string dengan enter (\n)
      const taskString = report.tasks
        .map((t, i) => `${i + 1}. ${t.description} (${t.durationHours || 0} Jam)`)
        .join('\n');

      return [
        new Date(report.date).toLocaleDateString('id-ID'), // Format tanggal lokal
        report.user.name,
        taskString,
        report.notes || '-'
      ];
    });

    // Konfigurasi Objek Tabel
    const tableData = {
      headers: ['Tanggal', 'Nama Pegawai', 'Daftar Pekerjaan', 'Catatan Tambahan'],
      rows: tableRows,
    };

    // Gambar Tabel di PDF
    await doc.table(tableData, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(9);
      },
    });

    doc.end();
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// --- 5. EXPORT PDF PROYEK (EAV) BENTUK TABEL ---
const exportPDFProjects = async (req, res) => {
  try {
    const projects = await prisma.projectEntry.findMany({
      where: buildProjectFilter(req),
      include: { 
        user: true, 
        template: true,
        values: { include: { field: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Atur kertas menjadi A4 Landscape (Mendatar) agar tabel muat
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Proyek_Tabel.pdf');
    doc.pipe(res);

    // Judul
    doc.fontSize(16).font('Helvetica-Bold').text('Rekapitulasi Laporan Proyek', { align: 'center' });
    doc.moveDown(1.5);

    if (projects.length === 0) {
      doc.fontSize(12).font('Helvetica').text('Tidak ada data proyek pada periode ini.', { align: 'center' });
      doc.end();
      return;
    }

    // 1. Kumpulkan semua header dinamis (kolom EAV) untuk dijadikan kolom tabel
    const dynamicFieldsMap = new Set();
    projects.forEach(p => p.values.forEach(v => dynamicFieldsMap.add(v.field.fieldName)));
    const dynamicFieldsArray = Array.from(dynamicFieldsMap);

    // 2. Siapkan array untuk Header Tabel (Statis + Dinamis)
    const tableHeaders = ['Tanggal', 'PIC', 'Template', 'Status', ...dynamicFieldsArray];

    // 3. Siapkan baris data tabel
    const tableRows = projects.map(project => {
      // Masukkan data dasar
      const row = [
        project.createdAt.toISOString().split('T')[0],
        project.user.name,
        project.template.name,
        project.status
      ];

      // Petakan data EAV (Dynamic Fields)
      const eavValues = {};
      project.values.forEach(v => {
        eavValues[v.field.fieldName] = v.field.fieldType === 'date' && v.value 
          ? new Date(v.value).toLocaleDateString('id-ID') 
          : v.value;
      });

      // Masukkan jawaban EAV ke baris tabel sesuai urutan kolom header
      dynamicFieldsArray.forEach(field => {
        row.push(eavValues[field] || '-'); // Isi tanda strip '-' jika kosong
      });

      return row;
    });

    // 4. Konfigurasi Objek Tabel untuk pdfkit-table
    const tableData = {
      headers: tableHeaders,
      rows: tableRows,
    };

    // 5. Gambar Tabel di PDF
    await doc.table(tableData, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(9);
      },
    });

    doc.end();
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

module.exports = { 
  getDashboardStats, getFilteredReports, getFilteredProjects, 
  exportExcelReports, exportExcelProjects, exportPDFReports, exportPDFProjects 
};