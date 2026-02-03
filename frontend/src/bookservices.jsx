import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, User, LogOut, Bell, X } from 'lucide-react';
import API from './services/api';

const BookServices = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [bookingForm, setBookingForm] = useState({
    serviceId: '',
    bookingDate: '',
    bookingTime: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await API.get('/auth/profile');
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      fetchMyBookings();
      fetchNotifications();
    } catch (error) {
      console.error('Erreur profil:', error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const { data } = await API.get('/businesses');
      setBusinesses(data.businesses);
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setMyBookings(data.bookings);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/register', authForm);
      localStorage.setItem('accessToken', data.tokens.accessToken);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      fetchMyBookings();
      fetchNotifications();
      alert('Compte créé avec succès !');
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', {
        email: authForm.email,
        password: authForm.password
      });
      localStorage.setItem('accessToken', data.tokens.accessToken);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      fetchMyBookings();
      fetchNotifications();
      alert('Connexion réussie !');
    } catch (error) {
      alert(error.response?.data?.error || 'Email ou mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMyBookings([]);
    setNotifications([]);
    alert('Déconnexion réussie');
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour réserver');
      setShowAuthModal(true);
      return;
    }

    try {
      await API.post('/bookings', {
        businessId: selectedBusiness.id,
        serviceId: parseInt(bookingForm.serviceId),
        bookingDate: bookingForm.bookingDate,
        bookingTime: bookingForm.bookingTime
      });
      
      alert('Réservation créée avec succès !');
      setShowBookingModal(false);
      fetchMyBookings();
      fetchNotifications();
      setBookingForm({ serviceId: '', bookingDate: '', bookingTime: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la réservation');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      return;
    }

    try {
      await API.delete(`/bookings/${bookingId}`);
      alert('Réservation annulée');
      fetchMyBookings();
      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'annulation');
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Tous', 'Coiffure', 'Beauté', 'Massage', 'Fitness', 'Restaurant'];
}

return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>BookServices</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAuthenticated && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{ position: 'relative', padding: '0.5rem', color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Bell size={24} />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span style={{ position: 'absolute', top: 0, right: 0, width: '1.25rem', height: '1.25rem', backgroundColor: '#f97316', color: 'white', fontSize: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div style={{ position: 'absolute', right: 0, marginTop: '0.5rem', width: '20rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', maxHeight: '24rem', overflowY: 'auto' }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontWeight: 600 }}>Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <p style={{ padding: '1rem', color: '#6b7280', textAlign: 'center' }}>Aucune notification</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: !notif.is_read ? '#fff7ed' : 'white' }}>
                            <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{notif.title}</p>
                            <p style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.25rem' }}>{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                    <User size={20} style={{ color: '#4b5563' }} />
                    <span style={{ fontWeight: 500 }}>{currentUser?.name}</span>
                    <span style={{ fontSize: '0.875rem', color: '#f97316' }}>({currentUser?.loyalty_points} pts)</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#dc2626', backgroundColor: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    <LogOut size={20} />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode('login');
                  }}
                  style={{ backgroundColor: '#f97316', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#9ca3af' }} size={20} />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {isAuthenticated && myBookings.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mes Réservations</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {myBookings.map(booking => (
                <div key={booking.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{booking.business_name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{booking.service_name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {new Date(booking.booking_date).toLocaleDateString('fr-FR')} à {booking.booking_time}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : '#f3f4f6', color: booking.status === 'confirmed' ? '#15803d' : '#4b5563' }}>
                      {booking.status === 'confirmed' ? 'Confirmé' : booking.status === 'cancelled' ? 'Annulé' : 'Reporté'}
                    </span>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ color: '#dc2626', backgroundColor: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer' }}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Services Disponibles ({filteredBusinesses.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredBusinesses.map(business => (
              <div key={business.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {business.image_url && (
                  <img src={business.image_url} alt={business.name} style={{ width: '100%', height: '12rem', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{business.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f97316' }}>
                      <Star size={16} fill="currentColor" />
                      <span style={{ fontWeight: 600 }}>{business.rating}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} />
                    {business.location}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>{business.description}</p>
                  <button
                    onClick={() => {
                      setSelectedBusiness(business);
                      setShowBookingModal(true);
                    }}
                    style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL AUTH */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{authMode === 'login' ? 'Connexion' : 'Inscription'}</h2>
              <button onClick={() => setShowAuthModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}
                required
              />
              {authMode === 'register' && (
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={authForm.phone}
                  onChange={(e) => setAuthForm({...authForm, phone: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }}
                />
              )}
              
              <button
                type="submit"
                style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginBottom: '0.75rem' }}
              >
                {authMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
                {authMode === 'login' ? 'Pas de compte ?' : 'Déjà inscrit ?'}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  style={{ color: '#f97316', marginLeft: '0.25rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {authMode === 'login' ? 'S\'inscrire' : 'Se connecter'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BOOKING */}
      {showBookingModal && selectedBusiness && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Réserver - {selectedBusiness.name}</h2>
              <button onClick={() => setShowBookingModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Service</label>
                <select
                  value={bookingForm.serviceId}
                  onChange={(e) => setBookingForm({...bookingForm, serviceId: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                >
                  <option value="">Choisir un service</option>
                  <option value="1">Coupe Femme - 45€</option>
                  <option value="2">Coupe Homme - 30€</option>
                  <option value="3">Coloration - 80€</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Date</label>
                <input
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={(e) => setBookingForm({...bookingForm, bookingDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Heure</label>
                <select
                  value={bookingForm.bookingTime}
                  onChange={(e) => setBookingForm({...bookingForm, bookingTime: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                >
                  <option value="">Choisir une heure</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                </select>
              </div>

              <button
                type="submit"
                style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                Confirmer la réservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
;

export default BookServices;