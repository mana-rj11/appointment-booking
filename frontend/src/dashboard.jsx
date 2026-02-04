import React, { useState, useEffect } from 'react';
import API from './services/api';
import { BarChart3, Calendar, DollarSign, Star, Users, Settings, LogOut, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, servicesRes, reviewsRes, businessRes] = await Promise.all([
        API.get('/owner/stats'),
        API.get('/owner/bookings'),
        API.get('/owner/services'),
        API.get('/owner/reviews'),
        API.get('/owner/business')
      ]);
      
      setStats(statsRes.data);
      setBookings(bookingsRes.data.bookings);
      setServices(servicesRes.data.services);
      setReviews(reviewsRes.data.reviews);
      setBusiness(businessRes.data.business);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await API.patch(`/owner/bookings/${bookingId}`, { status });
      loadDashboardData();
    } catch (error) {
      console.error('Erreur mise à jour réservation:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '1.5rem', color: '#9ca3af' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>📊 Dashboard</h2>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          {business?.name}
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'overview', icon: <BarChart3 size={20} />, label: 'Vue d\'ensemble' },
            { id: 'bookings', icon: <Calendar size={20} />, label: 'Réservations' },
            { id: 'services', icon: <Settings size={20} />, label: 'Services' },
            { id: 'reviews', icon: <Star size={20} />, label: 'Avis' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: activeTab === tab.id ? '#374151' : 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.875rem'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            marginTop: 'auto',
            fontSize: '0.875rem',
            width: '100%',
            borderRadius: '0.5rem'
          }}
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '2rem' }}>
        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && stats && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Vue d'ensemble</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                { icon: <Calendar size={24} />, label: 'Réservations', value: stats.totalBookings, color: '#3b82f6' },
                { icon: <DollarSign size={24} />, label: 'Revenus', value: `${stats.totalRevenue}€`, color: '#10b981' },
                { icon: <Users size={24} />, label: 'Clients', value: stats.totalCustomers, color: '#f59e0b' },
                { icon: <Star size={24} />, label: 'Note moyenne', value: stats.averageRating, color: '#f97316' }
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{stat.label}</p>
                      <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{stat.value}</p>
                    </div>
                    <div style={{ padding: '0.75rem', background: `${stat.color}20`, borderRadius: '0.5rem', color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Réservations récentes</h2>
              {bookings.slice(0, 5).map(booking => (
                <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>{booking.customer_name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{booking.service_name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem' }}>{new Date(booking.booking_date).toLocaleDateString('fr-FR')}</p>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      background: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                      color: booking.status === 'confirmed' ? '#15803d' : '#92400e'
                    }}>
                      {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RÉSERVATIONS */}
        {activeTab === 'bookings' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Gestion des réservations</h1>
            
            <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Client</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Service</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Statut</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem' }}>{booking.customer_name}</td>
                      <td style={{ padding: '1rem' }}>{booking.service_name}</td>
                      <td style={{ padding: '1rem' }}>{new Date(booking.booking_date).toLocaleDateString('fr-FR')} {booking.booking_time}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          background: booking.status === 'confirmed' ? '#dcfce7' : booking.status === 'completed' ? '#dbeafe' : '#fef3c7',
                          color: booking.status === 'confirmed' ? '#15803d' : booking.status === 'completed' ? '#1e40af' : '#92400e'
                        }}>
                          {booking.status === 'confirmed' ? 'Confirmé' : booking.status === 'completed' ? 'Terminé' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {booking.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')} style={{ padding: '0.25rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Accepter
                            </button>
                            <button onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')} style={{ padding: '0.25rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Refuser
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <button onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} style={{ padding: '0.25rem 0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Marquer terminé
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Gestion des services</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {services.map(service => (
                <div key={service.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{service.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>{service.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f97316' }}>{service.price}€</p>
                      {service.discount > 0 && (
                        <p style={{ fontSize: '0.75rem', color: '#10b981' }}>-{service.discount}% promo</p>
                      )}
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      background: service.is_active ? '#dcfce7' : '#fee2e2',
                      color: service.is_active ? '#15803d' : '#dc2626'
                    }}>
                      {service.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVIS */}
        {activeTab === 'reviews' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Avis clients</h1>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>{review.customer_name}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{review.service_name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#f97316' : '#d1d5db' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{review.comment}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;