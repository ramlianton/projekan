const prisma = require('../config/prisma');

const createDivision = async (req, res) => {
  try {
    const { name } = req.body;
    const division = await prisma.division.create({ data: { name } });
    res.status(201).json(division);
  } catch (error) { res.status(500).json({ message: 'Gagal membuat divisi', error: error.message }); }
};

const getDivisions = async (req, res) => {
  try {
    const divisions = await prisma.division.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(divisions);
  } catch (error) { res.status(500).json({ message: 'Gagal mengambil divisi', error: error.message }); }
};

// --- FUNGSI BARU: EDIT DIVISI ---
const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const division = await prisma.division.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    res.status(200).json({ message: 'Divisi berhasil diperbarui', division });
  } catch (error) { res.status(500).json({ message: 'Gagal update divisi', error: error.message }); }
};

// --- FUNGSI BARU: DELETE DIVISI ---
const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.division.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Divisi berhasil dihapus' });
  } catch (error) { 
    // Mencegah penghapusan jika divisi masih memiliki user
    res.status(500).json({ message: 'Gagal hapus divisi. Pastikan tidak ada pegawai di divisi ini.', error: error.message }); 
  }
};

module.exports = { createDivision, getDivisions, updateDivision, deleteDivision };