// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// --- REGISTER USER ---
const register = async (req, res) => {
  try {
    const { email, name, password, phone, role, divisionId } = req.body;

    // 1. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar!' });
    }

    // 2. Hash password demi keamanan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan user ke database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone,
        role: role || 'USER', // Default ke USER jika tidak diisi
        divisionId: divisionId || null
      }
    });

    res.status(201).json({
      message: 'User berhasil didaftarkan',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// --- LOGIN USER ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user di database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan!' });
    }

    // 2. Validasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah!' });
    }

    // 3. Buat JSON Web Token (JWT)
    // Kita menyimpan id, role, dan divisionId di dalam token agar mudah diakses oleh middleware nanti
    const token = jwt.sign(
      { id: user.id, role: user.role, divisionId: user.divisionId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, role: user.role, divisionId: user.divisionId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

module.exports = { register, login };