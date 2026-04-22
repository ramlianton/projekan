// backend/src/config/prisma.js
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

// Inisialisasi pool koneksi PostgreSQL
const pool = new Pool({ connectionString });

// Inisialisasi adapter Prisma
const adapter = new PrismaPg(pool);

// Masukkan adapter ke dalam instance Prisma Client
const prisma = new PrismaClient({ adapter });

module.exports = prisma;