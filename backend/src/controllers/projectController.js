// backend/src/controllers/projectController.js
const prisma = require('../config/prisma');

// --- BUAT PROYEK BARU ---
const createProject = async (req, res) => {
  try {
    const { templateId, values, note } = req.body;

    const entry = await prisma.projectEntry.create({
      data: {
        userId: req.user.id,
        divisionId: req.user.divisionId || null,
        templateId: parseInt(templateId),
        values: {
          create: values.map(v => ({ fieldId: parseInt(v.fieldId), value: String(v.value) }))
        },
        logs: note ? { create: [{ note }] } : undefined
      },
      include: { values: true, logs: true }
    });

    res.status(201).json({ message: 'Proyek berhasil dibuat', entry });
  } catch (error) { res.status(500).json({ message: 'Gagal membuat proyek', error: error.message }); }
};

// --- GET PROJECTS DENGAN PAGINATION ---
const getProjects = async (req, res) => {
  try {
    const { role, id, divisionId } = req.user;
    // Tambahkan parameter page dan limit
    const { search, status, templateId, page = 1, limit = 10 } = req.query; 

    let queryConditions = {};

    if (role === 'USER') queryConditions.userId = id;
    else if (role === 'LEADER') queryConditions.divisionId = divisionId;

    if (status) queryConditions.status = status;
    if (templateId) queryConditions.templateId = parseInt(templateId);

    if (search) {
      queryConditions.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { values: { some: { value: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, projects] = await prisma.$transaction([
      prisma.projectEntry.count({ where: queryConditions }),
      prisma.projectEntry.findMany({
        where: queryConditions,
        skip,
        take,
        include: { 
          user: { select: { name: true, role: true } },
          template: { select: { name: true } },
          values: { include: { field: { select: { fieldName: true, fieldType: true } } } },
          logs: { orderBy: { createdAt: 'desc' } } 
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.status(200).json({
      data: projects,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) { res.status(500).json({ message: 'Gagal mengambil proyek', error: error.message }); }
};

// --- UPDATE DATA FORM DINAMIS (EDIT) ---
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { values } = req.body;

    // Hapus nilai EAV yang lama, lalu buat yang baru (metode paling aman untuk EAV)
    await prisma.projectValue.deleteMany({ where: { entryId: parseInt(id) } });

    const updatedEntry = await prisma.projectEntry.update({
      where: { id: parseInt(id) },
      data: {
        values: {
          create: values.map(v => ({ fieldId: parseInt(v.fieldId), value: String(v.value) }))
        }
      },
      include: { values: true }
    });

    res.status(200).json({ message: 'Data proyek berhasil diperbarui', entry: updatedEntry });
  } catch (error) { res.status(500).json({ message: 'Gagal update proyek', error: error.message }); }
};

// --- HAPUS PROYEK ---
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    // Otomatis menghapus values dan logs berkat onDelete: Cascade
    await prisma.projectEntry.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Proyek berhasil dihapus' });
  } catch (error) { res.status(500).json({ message: 'Gagal menghapus proyek', error: error.message }); }
};

// --- UPDATE STATUS & TAMBAH LOG (Tetap sama) ---
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const updatedEntry = await prisma.projectEntry.update({
      where: { id: parseInt(id) },
      data: {
        status,
        logs: note ? { create: [{ note }] } : undefined
      },
      include: { logs: true }
    });

    res.status(200).json({ message: 'Status berhasil diperbarui', updatedEntry });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createProject, getProjects, updateProject, deleteProject, updateProjectStatus };