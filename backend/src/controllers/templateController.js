// backend/src/controllers/templateController.js
const prisma = require('../config/prisma');

// --- BUAT TEMPLATE BARU ---
const createTemplate = async (req, res) => {
  try {
    const { name, fields } = req.body; 
    // fields adalah array of objects: [{ fieldName: 'Lokasi', fieldType: 'text' }, ...]

    const template = await prisma.projectTemplate.create({
      data: {
        name,
        fields: {
          create: fields.map(field => ({
            fieldName: field.fieldName,
            fieldType: field.fieldType
          }))
        }
      },
      include: { fields: true } // Kembalikan data beserta field-nya
    });
    
    res.status(201).json({ message: 'Template berhasil dibuat', template });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat template', error: error.message });
  }
};

// --- AMBIL SEMUA TEMPLATE ---
const getTemplates = async (req, res) => {
  try {
    const templates = await prisma.projectTemplate.findMany({
      include: { fields: true }, // Tarik juga daftar kolomnya agar frontend tahu
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil template', error: error.message });
  }
};

module.exports = { createTemplate, getTemplates };