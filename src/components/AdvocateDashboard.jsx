import { useState, useEffect } from 'react';
import { caseService } from '../services/caseService';

export const AdvocateDashboard = ({ user, onLogout }) => {
  const [pendingCases, setPendingCases] = useState([]);
  const [handledCases, setHandledCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const pending = caseService.getPendingCases();
    const handled = caseService.getCasesByAdvocate(user.id).filter(c => !c.removedFromAdvocate);
    setPendingCases(pending);
    setHandledCases(handled);
  };

  const handleAcceptCase = async (caseId) => {
    if (!fee || fee <= 0) {
      alert('Please enter a valid fee amount');
      return;
    }

    setLoading(true);
    try {
      await caseService.acceptCase(caseId, user.id, user.name, fee);
      setSelectedCase(null);
      setFee('');
      loadCases();
      alert('Case accepted successfully!');
    } catch (err) {
      alert('Error accepting case: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCase = async (caseId) => {
    if (!confirm('Are you sure you want to reject this case?')) {
      return;
    }

    setLoading(true);
    try {
      await caseService.rejectCase(caseId);
      setSelectedCase(null);
      loadCases();
      alert('Case rejected successfully!');
    } catch (err) {
      alert('Error rejecting case: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCase = async (caseId) => {
    if (!confirm('Remove this case from your dashboard?')) {
      return;
    }

    setLoading(true);
    try {
      await caseService.removeCaseFromAdvocate(caseId);
      loadCases();
    } catch (err) {
      alert('Error removing case: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Advocate Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Cases ({pendingCases.length})
          </button>
          <button 
            className={`tab ${activeTab === 'handled' ? 'active' : ''}`}
            onClick={() => setActiveTab('handled')}
          >
            Handled Cases ({handledCases.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="cases-section">
            <h3>Pending Case Requests</h3>
            {pendingCases.length === 0 ? (
              <p>No pending cases at the moment.</p>
            ) : (
              <div className="cases-grid">
                {pendingCases.map(caseItem => (
                  <div key={caseItem.id} className="case-card">
                    <div className="case-header">
                      <h4>{caseItem.category}</h4>
                      <span className="status-badge pending">Pending</span>
                    </div>
                    <p className="case-description">{caseItem.description}</p>
                    <div className="case-details">
                      <p><strong>Client:</strong> {caseItem.fullName || caseItem.clientName}</p>
                      <p><strong>Email:</strong> {caseItem.email || caseItem.clientEmail}</p>
                      {caseItem.phone && <p><strong>Phone:</strong> {caseItem.phone}</p>}
                      {caseItem.city && <p><strong>Location:</strong> {caseItem.city}</p>}
                      <small>Submitted: {new Date(caseItem.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="case-actions">
                      <button 
                        onClick={() => setSelectedCase(caseItem)}
                        className="primary-btn"
                      >
                        Review Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'handled' && (
          <div className="cases-section">
            <h3>Handled Cases</h3>
            {handledCases.length === 0 ? (
              <p>No handled cases yet.</p>
            ) : (
              <div className="cases-grid">
                {handledCases.map(caseItem => (
                  <div key={caseItem.id} className="case-card">
                    <div className="case-header">
                      <h4>{caseItem.category}</h4>
                      <span 
                        className={`status-badge ${caseItem.status.toLowerCase()}`}
                        style={{ backgroundColor: caseItem.status === 'Accepted' ? '#27ae60' : '#e74c3c' }}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                    <p className="case-description">{caseItem.description}</p>
                    <div className="case-details">
                      <p><strong>Client:</strong> {caseItem.fullName || caseItem.clientName}</p>
                      <p><strong>Email:</strong> {caseItem.email || caseItem.clientEmail}</p>
                      {caseItem.phone && <p><strong>Phone:</strong> {caseItem.phone}</p>}
                      {caseItem.city && <p><strong>Location:</strong> {caseItem.city}</p>}
                      {caseItem.status === 'Accepted' && (
                        <p><strong>Fee:</strong> ₹{caseItem.fee}</p>
                      )}
                      <small>Handled: {new Date(caseItem.acceptedAt || caseItem.rejectedAt).toLocaleDateString()}</small>
                    </div>
                    <div className="case-actions">
                      <button 
                        onClick={() => handleRemoveCase(caseItem.id)}
                        className="remove-btn"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCase && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Review Case: {selectedCase.category}</h3>
              <button 
                onClick={() => setSelectedCase(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="case-details-full">
                <p><strong>Client:</strong> {selectedCase.fullName || selectedCase.clientName}</p>
                <p><strong>Email:</strong> {selectedCase.email || selectedCase.clientEmail}</p>
                {selectedCase.phone && <p><strong>Phone:</strong> {selectedCase.phone}</p>}
                {selectedCase.city && <p><strong>Location:</strong> {selectedCase.city}</p>}
                <p><strong>Category:</strong> {selectedCase.category}</p>
                <p><strong>Description:</strong></p>
                <p className="description">{selectedCase.description}</p>
                <p><strong>Submitted:</strong> {new Date(selectedCase.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="fee-input">
                <label>Enter your fee (₹):</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Enter fee amount"
                  min="1"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => handleAcceptCase(selectedCase.id)}
                  disabled={loading || !fee}
                  className="accept-btn"
                >
                  {loading ? 'Processing...' : 'Accept Case'}
                </button>
                <button 
                  onClick={() => handleRejectCase(selectedCase.id)}
                  disabled={loading}
                  className="reject-btn"
                >
                  {loading ? 'Processing...' : 'Reject Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};