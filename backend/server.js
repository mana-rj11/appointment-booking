require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
  process.exit(-1);
});

// Configuration Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes' }
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives. Réessayez dans 5 minutes.' }
});

// Middleware JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Validation
const validateRegistration = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation échouée' });
    }
    next();
  }
];

const validateBooking = [
  body('businessId').isInt({ min: 1 }),
  body('serviceId').isInt({ min: 1 }),
  body('bookingDate').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('bookingTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation échouée' });
    }
    next();
  }
];

// ROUTES - Authentification
app.post('/api/auth/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { name, email, phone, password, role = 'client' } = req.body;
    
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, loyalty_points)
       VALUES ($1, $2, $3, $4, $5, 50)
       RETURNING id, uuid, name, email, phone, role, loyalty_points`,
      [name, email, phone, passwordHash, role]
    );
    
    const user = result.rows[0];
    
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
    
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    );
    
    console.log(`✅ Nouvel utilisateur: ${email}`);
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyalty_points
      },
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur inscription' });
  }
});

app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
    
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    );
    
    console.log(`✅ Connexion: ${email}`);
    
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyalty_points
      },
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur connexion' });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, uuid, name, email, phone, role, loyalty_points FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur profil:', error);
    res.status(500).json({ error: 'Erreur profil' });
  }
});

// ROUTES - Entreprises
app.get('/api/businesses', async (req, res) => {
  try {
    const { category, location, search, minRating } = req.query;
    
    let query = 'SELECT * FROM businesses WHERE is_active = true';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (location) {
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (minRating) {
      query += ` AND rating >= $${paramCount}`;
      params.push(parseFloat(minRating));
    }
    
    query += ' ORDER BY rating DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ businesses: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('❌ Erreur liste entreprises:', error);
    res.status(500).json({ error: 'Erreur liste' });
  }
});

app.get('/api/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // récuperer l'entreprise
    const businessResult = await pool.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    );
    
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    const business = businessResult.rows[0];
    
    // recuperer les services
    const servicesResult = await pool.query(
      'SELECT * FROM services WHERE business_id = $1 AND is_active = true',
      [id]
    );
    
    // recuperer les créneaux
    const slotsResult = await pool.query(
      'SELECT * FROM time_slots WHERE business_id = $1 ORDER BY day_of_week, time',
      [id]
    );
    
    const reviewsResult = await pool.query(
      `SELECT r.*, u.name as customer_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.business_id = $1 AND r.is_published = true
       ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );
    
    res.json({
      ...business,
      services: servicesResult.rows,
      timeSlots: slotsResult.rows
    });
  } catch (error) {
    console.error('❌ Erreur récupération entreprise:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ROUTES - Réservations
app.post('/api/bookings', authenticateToken, validateBooking, async (req, res) => {
  try {
    const { businessId, serviceId, bookingDate, bookingTime } = req.body;
    const userId = req.userId;
    
    const serviceResult = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND business_id = $2 AND is_active = true',
      [serviceId, businessId]
    );
    
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    const service = serviceResult.rows[0];
    const [year, month, day] = bookingDate.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    
    console.log('RECHERCHE CRÉNEAU:');
    console.log('businessId:', businessId);
    console.log('dayOfWeek:', dayOfWeek);
    console.log('bookingTime:', bookingTime);

    const slotResult = await pool.query(
      'SELECT * FROM time_slots WHERE business_id = $1 AND day_of_week = $2 AND time = $3 AND is_available = true AND is_blocked = false',
      [businessId, dayOfWeek, bookingTime]
    );
    
    if (slotResult.rows.length === 0) {
      console.log('❌ CRÉNEAU NON TROUVÉ !');
      console.log('businessId:', businessId);
      console.log('dayOfWeek calculé:', dayOfWeek);
      console.log('bookingTime:', bookingTime);
      console.log('bookingDate:', bookingDate);
      return res.status(400).json({ error: 'Créneau non disponible' });
}
    
    const totalPrice = service.price * (1 - service.discount / 100);
    const pointsEarned = Math.floor(service.price);
    
    const bookingResult = await pool.query(
      `INSERT INTO bookings (user_id, business_id, service_id, booking_date, booking_time, status, points_earned, total_price, discount_applied)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7, $8)
       RETURNING *`,
      [userId, businessId, serviceId, bookingDate, bookingTime, pointsEarned, totalPrice, service.discount]
    );
    
    await pool.query(
      'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2',
      [pointsEarned, userId]
    );
    
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_booking_id)
       VALUES ($1, 'success', 'Réservation confirmée', $2, $3)`,
      [userId, `Rendez-vous le ${bookingDate} à ${bookingTime} confirmé. +${pointsEarned} points`, bookingResult.rows[0].id]
    );
    
    console.log(`✅ Réservation créée: ${bookingResult.rows[0].id}`);
    
    res.status(201).json({
      message: 'Réservation créée',
      booking: bookingResult.rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur réservation:', error);
    res.status(500).json({ error: 'Erreur réservation' });
  }
});

app.get('/api/bookings/my-bookings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bk.*, b.name as business_name, b.location, s.name as service_name
       FROM bookings bk
       JOIN businesses b ON bk.business_id = b.id
       LEFT JOIN services s ON bk.service_id = s.id
       WHERE bk.user_id = $1
       ORDER BY bk.booking_date DESC`,
      [req.userId]
    );
    
    res.json({ bookings: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('❌ Erreur mes réservations:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    
    const booking = checkResult.rows[0];
    
    await pool.query(
      'UPDATE bookings SET status = $1, cancelled_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', id]
    );
    
    await pool.query(
      'UPDATE users SET loyalty_points = GREATEST(0, loyalty_points - $1) WHERE id = $2',
      [booking.points_earned, req.userId]
    );
    
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'info', 'Réservation annulée', 'Votre réservation a été annulée.')`,
      [req.userId]
    );
    
    console.log(`✅ Réservation annulée: ${id}`);
    
    res.json({ message: 'Réservation annulée' });
  } catch (error) {
    console.error('❌ Erreur annulation:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

app.patch('/api/bookings/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;
    
    const checkResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    
    const booking = checkResult.rows[0];
    const dayOfWeek = new Date(newDate).getDay();
    
    const slotResult = await pool.query(
      'SELECT * FROM time_slots WHERE business_id = $1 AND day_of_week = $2 AND time = $3 AND is_available = true',
      [booking.business_id, dayOfWeek, newTime]
    );
    
    if (slotResult.rows.length === 0) {
      return res.status(400).json({ error: 'Créneau non disponible' });
    }
    
    await pool.query(
      'UPDATE bookings SET booking_date = $1, booking_time = $2, status = $3 WHERE id = $4',
      [newDate, newTime, 'rescheduled', id]
    );
    
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'success', 'Réservation reportée', $2)`,
      [req.userId, `Reportée au ${newDate} à ${newTime}`]
    );
    
    console.log(`✅ Réservation reportée: ${id}`);
    
    res.json({ message: 'Réservation reportée' });
  } catch (error) {
    console.error('❌ Erreur report:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

// ROUTES - Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    
    res.json({
      notifications: result.rows,
      unreadCount: result.rows.filter(n => !n.is_read).length
    });
  } catch (error) {
    console.error('❌ Erreur notifications:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

// ============================================
// ROUTES DASHBOARD PROPRIÉTAIRE
// ============================================

// Middleware pour vérifier que l'utilisateur est propriétaire
const isBusinessOwner = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id FROM businesses WHERE owner_id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Accès réservé aux propriétaires' });
    }
    
    req.businessId = result.rows[0].id;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Statistiques globales
app.get('/api/owner/stats', authenticateToken, isBusinessOwner, async (req, res) => {
  try {
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT b.user_id) as total_customers,
        COALESCE(SUM(s.price * (1 - s.discount / 100.0)), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE b.business_id = $1
    `, [req.businessId]);
    
    const stats = statsQuery.rows[0];
    
    res.json({
      totalBookings: parseInt(stats.total_bookings),
      totalCustomers: parseInt(stats.total_customers),
      totalRevenue: parseFloat(stats.total_revenue).toFixed(2),
      averageRating: parseFloat(stats.average_rating).toFixed(1)
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur chargement statistiques' });
  }
});

// Liste des réservations
app.get('/api/owner/bookings', authenticateToken, isBusinessOwner, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.booking_time,
        b.status,
        u.name as customer_name,
        u.email as customer_email,
        s.name as service_name,
        s.price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      WHERE b.business_id = $1
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `, [req.businessId]);
    
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Erreur réservations:', error);
    res.status(500).json({ error: 'Erreur chargement réservations' });
  }
});

// Mettre à jour statut réservation
app.patch('/api/owner/bookings/:id', authenticateToken, isBusinessOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Vérifier que la réservation appartient bien à l'entreprise
    const checkResult = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND business_id = $2',
      [id, req.businessId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    
    await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      [status, id]
    );
    
    res.json({ message: 'Statut mis à jour' });
  } catch (error) {
    console.error('Erreur mise à jour réservation:', error);
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// Liste des services
app.get('/api/owner/services', authenticateToken, isBusinessOwner, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        discount,
        duration,
        is_active
      FROM services
      WHERE business_id = $1
      ORDER BY name
    `, [req.businessId]);
    
    res.json({ services: result.rows });
  } catch (error) {
    console.error('Erreur services:', error);
    res.status(500).json({ error: 'Erreur chargement services' });
  }
});

// Liste des avis
app.get('/api/owner/reviews', authenticateToken, isBusinessOwner, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as customer_name,
        s.name as service_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN services s ON r.service_id = s.id
      WHERE r.business_id = $1 AND r.is_published = true
      ORDER BY r.created_at DESC
    `, [req.businessId]);
    
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Erreur avis:', error);
    res.status(500).json({ error: 'Erreur chargement avis' });
  }
});

// Info entreprise
app.get('/api/owner/business', authenticateToken, isBusinessOwner, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, location, rating FROM businesses WHERE id = $1',
      [req.businessId]
    );
    
    res.json({ business: result.rows[0] });
  } catch (error) {
    console.error('Erreur entreprise:', error);
    res.status(500).json({ error: 'Erreur chargement entreprise' });
  }
});



// Démarrage
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log(`🚀 BOOKSERVICES BACKEND - Port ${PORT}`);
  console.log(`🚀 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ============================================');
  console.log('');
});

module.exports = app;

// ==========================================
// ROUTES AVIS/REVIEWS
// ==========================================

// Créer un avis
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { bookingId, businessId, serviceId, rating, comment } = req.body;
    const userId = req.userId;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const bookingCheck = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3',
      [bookingId, userId, 'completed']
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Réservation non trouvée ou non terminée' });
    }

    // Vérifier qu'il n'y a pas déjà un avis
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [bookingId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Avis déjà laissé pour cette réservation' });
    }

    // Créer l'avis
    const result = await pool.query(
      `INSERT INTO reviews (user_id, business_id, service_id, booking_id, rating, comment, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [userId, businessId, serviceId, bookingId, rating, comment]
    );

    // Mettre à jour la note moyenne de l'entreprise
    const ratingUpdate = await pool.query(
      `UPDATE businesses 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE business_id = $1 AND is_published = true),
           total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = $1 AND is_published = true)
       WHERE id = $1
       RETURNING *`,
      [businessId]
    );

    res.json({
      message: 'Avis créé avec succès',
      review: result.rows[0],
      business: ratingUpdate.rows[0]
    });
  } catch (error) {
    console.error('Erreur création avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les avis d'une entreprise
app.get('/api/businesses/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as user_name, s.name as service_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN services s ON r.service_id = s.id
       WHERE r.business_id = $1 AND r.is_published = true
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});