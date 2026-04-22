// backend/src/controllers/reportController.js
const prisma = require('../config/prisma');
const { sendMessage } = require('../services/whatsappService');

const createReport = async (req, res) => {
  try {
    const { date, notes, tasks } = req.body;
    const userId = req.user.id;
    const reportDate = new Date(date);
    reportDate.setUTCHours(0, 0, 0, 0);

    const report = await prisma.dailyReport.create({
      data: {
        date: reportDate,
        notes,
        userId,
        tasks: {
          create: tasks.map(task => ({
            description: task.description,
            durationHours: task.durationHours || null
          }))
        }
      },
      include: { tasks: true, user: true }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.phone) {
      const taskListString = tasks.map((task, index) => `${index + 1}. ${task.description}`).join('\n');
      const waMessage = `*Notifikasi Sistem Kinerja*\n\nHalo ${user.name},\nLaporan Kinerja Harian Anda untuk tanggal ${reportDate.toISOString().split('T')[0]} telah berhasil dicatat oleh sistem.\n\nJumlah Task: ${tasks.length}\nTask:\n${taskListString}\n\nCatatan: ${notes || '-'}\n\nTerima kasih atas kerja keras Anda hari ini! 🚀`;
      
      const isSent = await sendMessage(user.phone, waMessage);
      if (isSent) {
         await prisma.dailyReport.update({ where: { id: report.id }, data: { isSentToWa: true } });
      }
    }
    res.status(201).json({ message: 'Laporan harian berhasil disimpan', report });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat laporan', error: error.message });
  }
};

// --- GET REPORTS DENGAN PAGINATION ---
const getReports = async (req, res) => {
  try {
    const { role, id, divisionId } = req.user;
    // Tangkap parameter pagination (default page 1, limit 10)
    const { search, date, page = 1, limit = 10 } = req.query; 
    
    let queryConditions = {};

    if (role === 'USER') queryConditions.userId = id;
    else if (role === 'LEADER') queryConditions.user = { divisionId: divisionId };

    if (search) {
      queryConditions.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { tasks: { some: { description: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (date) {
      const searchDate = new Date(date);
      searchDate.setUTCHours(0, 0, 0, 0);
      queryConditions.date = searchDate;
    }

    // Hitung offset (data yang dilewati)
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Gunakan transaksi untuk menghitung total data & mengambil data halaman ini secara paralel
    const [total, reports] = await prisma.$transaction([
      prisma.dailyReport.count({ where: queryConditions }),
      prisma.dailyReport.findMany({
        where: queryConditions,
        skip,
        take,
        include: { user: { select: { name: true, role: true } }, tasks: true },
        orderBy: { date: 'desc' }
      })
    ]);

    // Kirim response dalam format standar pagination
    res.status(200).json({
      data: reports,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil laporan', error: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, tasks } = req.body;
    await prisma.dailyTask.deleteMany({ where: { dailyReportId: parseInt(id) } });
    const updatedReport = await prisma.dailyReport.update({
      where: { id: parseInt(id) },
      data: {
        notes,
        tasks: { create: tasks.map(task => ({ description: task.description, durationHours: task.durationHours || null })) }
      },
      include: { tasks: true }
    });
    res.status(200).json({ message: 'Laporan berhasil diperbarui', report: updatedReport });
  } catch (error) { res.status(500).json({ message: 'Gagal update laporan', error: error.message }); }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dailyReport.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Laporan berhasil dihapus' });
  } catch (error) { res.status(500).json({ message: 'Gagal menghapus laporan', error: error.message }); }
};

module.exports = { createReport, getReports, updateReport, deleteReport };