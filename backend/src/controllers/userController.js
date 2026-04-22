const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs'); 

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, division: { select: { id: true, name: true } }, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(users);
  } catch (error) { res.status(500).json({ message: 'Gagal mengambil data user', error: error.message }); }
};

// --- FUNGSI BARU: EDIT USER ---
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, divisionId, password } = req.body;

    const updateData = {
      name, email, phone, role,
      divisionId: divisionId ? parseInt(divisionId) : null
    };

    // Jika Admin mengisi password baru di form edit, lakukan hashing
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({ message: 'User berhasil diperbarui', user: updatedUser });
  } catch (error) { res.status(500).json({ message: 'Gagal update user', error: error.message }); }
};

// --- FUNGSI BARU: DELETE USER ---
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'User berhasil dihapus' });
  } catch (error) { 
    res.status(500).json({ message: 'Gagal hapus user. Pastikan user ini tidak terikat dengan Laporan atau Proyek.', error: error.message }); 
  }
};

// --- FUNGSI BARU: GET PROFIL SENDIRI ---
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, division: { select: { name: true } } }
    });
    res.status(200).json(user);
  } catch (error) { 
    res.status(500).json({ message: 'Gagal mengambil profil', error: error.message }); 
  }
};

// --- FUNGSI BARU: UPDATE PROFIL & PASSWORD SENDIRI ---
const updateProfile = async (req, res) => {
  try {
    const { name, phone, oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const updateData = { name, phone };

    // Logika Ganti Password (Jika user mengisi form password)
    if (oldPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      // Cek apakah password lama yang dimasukkan cocok dengan di database
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password lama Anda salah!' });
      }
      
      // Enkripsi password baru
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true } // Jangan kembalikan password
    });

    res.status(200).json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (error) { 
    res.status(500).json({ message: 'Gagal update profil', error: error.message }); 
  }
};

module.exports = { getUsers, updateUser, deleteUser, getProfile, updateProfile };