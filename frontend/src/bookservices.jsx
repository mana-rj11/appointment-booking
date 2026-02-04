import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, User, LogOut, Bell, X } from 'lucide-react';
import API from './services/api';

// Système de badges
const getLoyaltyBadge = (points) => {
  if (points >= 600) return { name: 'Platine', icon: '💎', color: '#E5E4E2', nextLevel: null, progress: 100 };
  if (points >= 300) return { name: 'Or', icon: '🥇', color: '#FFD700', nextLevel: 600, progress: ((points - 300) / 300) * 100 };
  if (points >= 100) return { name: 'Argent', icon: '🥈', color: '#C0C0C0', nextLevel: 300, progress: ((points - 100) / 200) * 100 };
  return { name: 'Bronze', icon: '🥉', color: '#CD7F32', nextLevel: 100, progress: (points / 100) * 100 };
};

const BookServices = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [businessReviews, setBusinessReviews] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loadingServices, setLoadingServices] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ businessId: '', serviceId: '', bookingDate: '', bookingTime: '' });
  

  useEffect(() => {
    fetchBusinesses();
    if (currentUser) {
      fetchMyBookings();
      fetchNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    const loadData = async () => {
        await fetchBusinesses();
        // charger les avis pour chaque entreprise
        businesses.forEach(business => fetchBusinessesReviews(business.id));
        };
        loadData();
    }, []);


  const fetchUserProfile = async () => {
    try {
      const { data } = await API.get('/auth/profile');
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      fetchMyBookings();
      fetchNotifications();
    } catch (error) {
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const { data } = await API.get('/businesses', {
        params: { category: filteredBusinesses.category, search: filteredBusinesses.search }
      });
      setBusinesses(data.businesses);

      // charger les avis pour chaque entreprise
      data.businesses.forEach(business => {
        fetchBusinessesReviews(business.id);
      });
    } catch (error) {
      console.error('Erreur charhement entreprises:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setMyBookings(data.bookings);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
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
      alert('Compte créé !');
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur inscription');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email: authForm.email, password: authForm.password });
      localStorage.setItem('accessToken', data.tokens.accessToken);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      fetchMyBookings();
      alert('Connexion réussie !');
    } catch (error) {
      alert(error.response?.data?.error || 'Email/mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMyBookings([]);
    alert('Déconnexion réussie');
  };

  const fetchBusinessDetails = async (businessId) => {
    setLoadingServices(true);
    try {
      const { data } = await API.get(`/businesses/${businessId}`);

      // essayer différentes structures de données
      const services = data.services || [];
      const slots = data.timeSlots || [];

      setAvailableServices(services);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Erreur chargement services:', error);
      setAvailableServices([]);
      setAvailableSlots([]);
    } finally {
        setLoadingServices(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Veuillez vous connecter');
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
      alert('Réservation créée !');
      setShowBookingModal(false);
      fetchMyBookings();
      setBookingForm({ serviceId: '', bookingDate: '', bookingTime: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur réservation');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await API.delete(`/bookings/${bookingId}`);
      alert('Réservation annulée');
      fetchMyBookings();
    } catch (error) {
      alert('Erreur annulation');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
        await API.post('/reviews', {
            bookingId: selectedBookingForReview.id,
            businessId: selectedBookingForReview.business_id,
            serviceId: selectedBookingForReview.service_id,
            rating: parseInt(reviewForm.rating),
            comment: reviewForm.comment
        });

        alert('Avis publié avec succès !');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: ''});
        fetchMyBookings();
        fetchBusinesses();
    } catch (error) {
        alert(error.response?.data?.error || 'Erreur lors de la publication de l\'avis');
    }
  };

  const fetchBusinessesReviews = async (businessId) => {
    try {
        const { data } = await API.get(`/businesses/${businessId}/reviews`);
        setBusinessReviews(prev => ({ ...prev, [businessId]: data.reviews }));
    } catch (error) {
        console.error('Erreur chargement avis:', error);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>BookServices</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  
                  {/* NOTIFICATION BELL - NOUVEAU CODE ICI */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      style={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.5rem', 
                        padding: '0.5rem', 
                        cursor: 'pointer',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      🔔
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '999px',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        width: '350px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        zIndex: 1000
                      }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                          Notifications ({unreadCount} non lues)
                        </div>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                            Aucune notification
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id}
                              style={{
                                padding: '1rem',
                                borderBottom: '1px solid #f3f4f6',
                                background: notif.is_read ? 'white' : '#fef3c7',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                {notif.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {notif.message}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                {new Date(notif.created_at).toLocaleString('fr-FR')}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {/* FIN NOTIFICATION BELL */}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{getLoyaltyBadge(currentUser.loyaltyPoints).icon}</span>





                    <span style={{ fontSize: '2rem' }}>{getLoyaltyBadge(currentUser.loyaltyPoints).icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {currentUser.name} - {getLoyaltyBadge(currentUser.loyaltyPoints).name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {currentUser.loyaltyPoints} points
                      </div>
                    </div>
                  </div>
                  <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                     Déconnexion
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} style={{ backgroundColor: '#f97316', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  Se connecter
                </button>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#9ca3af' }} size={20} />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
              {['Tous', 'Coiffure', 'Beauté', 'Massage', 'Fitness'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </header>


      {/* Système de fidélité - Version discrète */}
      {currentUser && getLoyaltyBadge(currentUser.loyalty_points).nextLevel && (
        <div style={{ maxWidth: '1200px', margin: '1rem auto', padding: '1rem 1.5rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{getLoyaltyBadge(currentUser.loyalty_points).icon}</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                  Niveau {getLoyaltyBadge(currentUser.loyalty_points).name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {currentUser.loyalty_points} / {getLoyaltyBadge(currentUser.loyalty_points).nextLevel} points
                </div>
              </div>
            </div>
            <span style={{ fontSize: '1.25rem', opacity: 0.3 }}>{getLoyaltyBadge(getLoyaltyBadge(currentUser.loyalty_points).nextLevel).icon}</span>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '0.5rem', overflow: 'hidden' }}>
            <div style={{ 
              background: '#f97316', 
              height: '100%', 
              width: `${getLoyaltyBadge(currentUser.loyalty_points).progress}%`,
              transition: 'width 0.5s ease',
              borderRadius: '999px'
            }}></div>
          </div>
        </div>
      )}


      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {isAuthenticated && myBookings.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mes Réservations</h2>
                {myBookings.map(booking => (
                    <div key={booking.id} style={{ backgroundColor: 'white', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>{booking.business_name}</h3>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{booking.service_name}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{new Date(booking.booking_date).toLocaleDateString('fr-FR')} à {booking.booking_time}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : booking.status === 'completed' ? '#dbeafe' : '#f3f4f6', color: booking.status === 'confirmed' ? '#15803d' : booking.status === 'completed' ? '#1d4ed8' : '#6b7280' }}>
                                {booking.status === 'confirmed' ? 'Confirmé' : booking.status === 'completed' ? 'Terminé' : booking.status === 'cancelled' ? 'Annulé' : 'Reporté'}
                            </span>
                            {booking.status === 'confirmed' && (
                                <button onClick={() => handleCancelBooking(booking.id)} style={{ padding: '0.25rem 0.75rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', color: '#dc2626', background: 'white' }}>
                                    Annuler
                                </button>
                            )}
                            {booking.status === 'completed' && (
                                <button onClick={() => { setSelectedBookingForReview(booking); setShowReviewModal(true); }} style={{ padding: '0.25rem 0.75rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', color: 'white', backgroundColor: '#f97316' }}>
                                    Laisser un avis
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Services Disponibles ({filteredBusinesses.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredBusinesses.map(business => (
            <div key={business.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              {business.image_url && <img src={business.image_url} alt={business.name} style={{ width: '100%', height: '12rem', objectFit: 'cover' }} />}
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 'bold' }}>{business.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f97316' }}>
                    <Star size={16} fill="currentColor" />
                    <span>{business.rating}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}><MapPin size={14} style={{ display: 'inline' }} /> {business.location}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>{business.description}</p>


                {/* AFFICHER LES AVIS*/}
                {businessReviews[business.id]?.length > 0 && (
                  <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: '3px solid #f97316' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < businessReviews[business.id][0].rating ? '#f97316' : '#d1d5db' }}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#374151', fontStyle: 'italic', margin: '0 0 0.25rem 0' }}>
                      "{businessReviews[business.id][0].comment.substring(0, 80)}{businessReviews[business.id][0].comment.length > 80 ? '...' : ''}"
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                      — {businessReviews[business.id][0].user_name}
                    </p>
                  </div>
                )}
                
                <button onClick={() => { setSelectedBusiness(business); setShowBookingModal(true); fetchBusinessDetails(business.id); }} style={{ width: '100%', padding: '0.75rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                  Réserver
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{authMode === 'login' ? 'Connexion' : 'Inscription'}</h2>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              {authMode === 'register' && <input type="text" placeholder="Nom" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }} required />}
              <input type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }} required />
              <input type="password" placeholder="Mot de passe" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }} required />
              {authMode === 'register' && <input type="tel" placeholder="Téléphone" value={authForm.phone} onChange={(e) => setAuthForm({...authForm, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.75rem' }} />}
              <button type="submit" style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                {authMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                {authMode === 'login' ? 'Pas de compte ?' : 'Déjà inscrit ?'}
                <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ color: '#f97316', marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  {authMode === 'login' ? 'S\'inscrire' : 'Se connecter'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {showBookingModal && selectedBusiness && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Réserver - {selectedBusiness.name}</h2>
              <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Service</label>
                <select value={bookingForm.serviceId} onChange={(e) => setBookingForm({...bookingForm, serviceId: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required disabled={loadingServices}>
                  <option value="">{loadingServices ? 'Chargement...' : 'Choisir un service'}</option>
                  {availableServices.map(service => ( 
                    <option key={service.id} value={service.id}>
                        {service.name} - {service.price}€ {service.discount > 0 && `(-${service.discount}%)`}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Date</label>
                <input type="date" value={bookingForm.bookingDate} onChange={(e) => setBookingForm({...bookingForm, bookingDate: e.target.value})} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Heure</label>
                
                
                <select value={bookingForm.bookingTime} onChange={(e) => setBookingForm({...bookingForm, bookingTime: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required>
                  <option value="">Choisir une heure</option>
                  {[...new Set(availableSlots.map(slot => slot.time))].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>


              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                Confirmer
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MODAL AVIS */}
{showReviewModal && selectedBookingForReview && (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Laisser un avis</h2>
        <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontWeight: 600 }}>{selectedBookingForReview.business_name}</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{selectedBookingForReview.service_name}</p>
      </div>

      <form onSubmit={handleSubmitReview}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Note</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={32}
                fill={star <= reviewForm.rating ? '#f97316' : 'none'}
                stroke={star <= reviewForm.rating ? '#f97316' : '#d1d5db'}
                style={{ cursor: 'pointer' }}
                onClick={() => setReviewForm({...reviewForm, rating: star})}
              />
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Commentaire</label>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
            placeholder="Partagez votre expérience..."
            rows={4}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', resize: 'vertical' }}
            required
          />
        </div>
        
        <button type="submit" style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Publier l'avis
        </button>
      </form>
    </div>
  </div>
)}
    </div>
  );
};
export default BookServices;