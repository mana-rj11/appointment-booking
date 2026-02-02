import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, User, LogOut, Bell, X } from 'lucide-react';
import API from './services/api';

const BookServices = () => {
  // États pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  
  // États pour les formulaires
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  // États pour les données
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  // États pour les modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // État pour la réservation
  const [bookingForm, setBookingForm] = useState({
    serviceId: '',
    bookingDate: '',
    bookingTime: ''
  });

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  // Charger les entreprises
  useEffect(() => {
    fetchBusinesses();
}, []);
}

// ==========================================
  // FONCTIONS API
  // ==========================================

  // Récupérer le profil utilisateur
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

  // Récupérer les entreprises
  const fetchBusinesses = async () => {
    try {
      const { data } = await API.get('/businesses');
      setBusinesses(data.businesses);
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
    }
  };

  // Récupérer mes réservations
  const fetchMyBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setMyBookings(data.bookings);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  // Récupérer les notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  // Inscription
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

  // Connexion
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

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMyBookings([]);
    setNotifications([]);
    alert('Déconnexion réussie');
  };

  // Créer une réservation
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

  // Annuler une réservation
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

// Filtrer les entreprises
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Tous', 'Coiffure', 'Beauté', 'Massage', 'Fitness', 'Restaurant'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">BookServices</h1>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-orange-500"
                  >
                    <Bell size={24} />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">Aucune notification</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 ${!notif.is_read ? 'bg-orange-50' : ''}`}>
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bouton Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <User size={20} className="text-gray-600" />
                    <span className="font-medium">{currentUser?.name}</span>
                    <span className="text-sm text-orange-500">({currentUser?.loyalty_points} pts)</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mt-4 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* MES RÉSERVATIONS */}
        {isAuthenticated && myBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Mes Réservations</h2>
            <div className="grid gap-4">
              {myBookings.map(booking => (
                <div key={booking.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{booking.business_name}</h3>
                    <p className="text-sm text-gray-600">{booking.service_name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <Calendar size={16} className="inline mr-1" />
                      {new Date(booking.booking_date).toLocaleDateString('fr-FR')} à {booking.booking_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmé' :
                       booking.status === 'cancelled' ? 'Annulé' : 'Reporté'}
                    </span>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"
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

        {/* LISTE DES ENTREPRISES */}
        <div>
          <h2 className="text-xl font-bold mb-4">Services Disponibles ({filteredBusinesses.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(business => (
              <div key={business.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {business.image_url && (
                  <img src={business.image_url} alt={business.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{business.name}</h3>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star size={16} fill="currentColor" />
                      <span className="font-semibold">{business.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin size={14} />
                    {business.location}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">{business.description}</p>
                  <button
                    onClick={() => {
                      setSelectedBusiness(business);
                      setShowBookingModal(true);
                    }}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL AUTHENTIFICATION */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{authMode === 'login' ? 'Connexion' : 'Inscription'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700">
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
                  className="w-full px-4 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-orange-500"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-orange-500"
                required
              />
              {authMode === 'register' && (
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={authForm.phone}
                  onChange={(e) => setAuthForm({...authForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-orange-500"
                />
              )}
              
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 mb-3"
              >
                {authMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
              </button>

              <p className="text-center text-sm text-gray-600">
                {authMode === 'login' ? 'Pas de compte ?' : 'Déjà inscrit ?'}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-orange-500 ml-1 font-medium"
                >
                  {authMode === 'login' ? 'S\'inscrire' : 'Se connecter'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÉSERVATION */}
      {showBookingModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Réserver - {selectedBusiness.name}</h2>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Service</label>
                <select
                  value={bookingForm.serviceId}
                  onChange={(e) => setBookingForm({...bookingForm, serviceId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Choisir un service</option>
                  <option value="1">Coupe Femme - 45€</option>
                  <option value="2">Coupe Homme - 30€</option>
                  <option value="3">Coloration - 80€</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={(e) => setBookingForm({...bookingForm, bookingDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Heure</label>
                <select
                  value={bookingForm.bookingTime}
                  onChange={(e) => setBookingForm({...bookingForm, bookingTime: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
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
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
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
