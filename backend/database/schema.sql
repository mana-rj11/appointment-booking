-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'business', 'admin')),
    loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- TABLE: businesses
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    description TEXT,
    image_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_location ON businesses(location);

-- TABLE: services
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_business ON services(business_id);

-- TABLE: time_slots
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, day_of_week, time)
);

-- TABLE: bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'rescheduled', 'cancelled', 'completed')),
    points_earned INTEGER DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    discount_applied INTEGER DEFAULT 0,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- TABLE: reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT false
);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test (password: Test123!)
INSERT INTO users (name, email, phone, password_hash, role, loyalty_points) VALUES
('Client Test', 'client@test.com', '0612345678', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5JjO3z/eK5dH.', 'client', 450)
ON CONFLICT (email) DO NOTHING;

INSERT INTO businesses (owner_id, name, category, location, address, phone, email, description, image_url, rating, total_reviews) VALUES
(1, 'Salon Élégance', 'Coiffure', 'Paris 15ème', '42 Rue de Vaugirard, 75015 Paris', '0145678912', 'contact@salon-elegance.fr', 'Salon de coiffure moderne', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 4.8, 127)
ON CONFLICT DO NOTHING;

INSERT INTO services (business_id, name, description, price, duration, discount) VALUES
(1, 'Coupe Femme', 'Coupe personnalisée', 45.00, 60, 10),
(1, 'Coupe Homme', 'Coupe moderne', 30.00, 45, 5),
(1, 'Coloration', 'Coloration professionnelle', 80.00, 120, 15)
ON CONFLICT DO NOTHING;

INSERT INTO time_slots (business_id, day_of_week, time, is_available) VALUES
(1, 1, '09:00', true), (1, 1, '10:00', true), (1, 1, '11:00', true),
(1, 1, '14:00', true), (1, 1, '15:00', true), (1, 1, '16:00', true),
(1, 2, '09:00', true), (1, 2, '10:00', true), (1, 2, '11:00', true),
(1, 2, '14:00', true), (1, 2, '15:00', true), (1, 2, '16:00', true)
ON CONFLICT DO NOTHING;

COMMIT;
```

**✅ Sauvegarde**

---

## ⚡ **FICHIER 5 : .gitignore**

**Ouvre `backend/.gitignore` et copie-colle ça :**
```
node_modules/
.env
*.log
logs/