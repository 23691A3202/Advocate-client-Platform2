import { useState, useEffect } from 'react';
import { caseService } from '../services/caseService';

export const ClientDashboard = ({ user, onLogout }) => {
  const [cases, setCases] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    fullName: user.name,
    email: user.email,
    phone: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const userCases = caseService.getCasesByClient(user.id);
    setCases(userCases);
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await caseService.createCase({
        ...formData,
        clientId: user.id,
        clientName: user.name,
        clientEmail: user.email
      });
      
      setFormData({ category: '', description: '', fullName: user.name, email: user.email, phone: '', city: '' });
      setShowCreateForm(false);
      loadCases();
    } catch (err) {
      alert('Error creating case: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f39c12';
      case 'Accepted': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Client Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="actions">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="primary-btn"
          >
            {showCreateForm ? 'Cancel' : 'Create New Case'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-case-form">
            <h3>Create New Case Request</h3>
            <form onSubmit={handleCreateCase}>
              <div className="form-group">
                <label>Case Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {caseService.CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of your case"
                  rows="4"
                  required
                />
              </div>
              
              <h4 style={{margin: '1.5rem 0 1rem 0', color: '#2c3e50'}}>Personal Details</h4>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>City / Location</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Enter your city"
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Submit Case'}
              </button>
            </form>
          </div>
        )}

        <div className="cases-section">
          <h3>My Cases</h3>
          {cases.length === 0 ? (
            <p>No cases submitted yet.</p>
          ) : (
            <div className="cases-grid">
              {cases.map(caseItem => (
                <div key={caseItem.id} className="case-card">
                  <div className="case-header">
                    <h4>{caseItem.category}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(caseItem.status) }}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <p className="case-description">{caseItem.description}</p>
                  <div className="case-details">
                    <small>Created: {new Date(caseItem.createdAt).toLocaleDateString()}</small>
                    {caseItem.status === 'Accepted' && (
                      <div className="acceptance-details">
                        <p><strong>Advocate:</strong> {caseItem.advocateName}</p>
                        <p><strong>Fee:</strong> ₹{caseItem.fee}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};