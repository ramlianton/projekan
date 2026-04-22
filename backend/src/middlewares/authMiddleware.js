// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware untuk mengecek apakah user memiliki token JWT yang valid
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyisipkan data user (id, role, divisionId) ke dalam request
    next(); // Lanjut ke controller berikutnya
  } catch (error) {
    res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};

// Middleware untuk membatasi akses berdasarkan Role (Admin, Leader, User)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Akses ditolak. Hanya role ${allowedRoles.join(', ')} yang diizinkan.` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };