import { useState, useEffect } from 'react';
import { caseService } from '../services/caseService';

export const AdvocateDashboard = ({ user, onLogout }) => {
  const [pendingCases, setPendingCases] = useState([]);
  const [handledCases, setHandledCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    try {
      const [pending, handled] = await Promise.all([
        caseService.getPendingCases(),
        caseService.getCasesByAdvocate(user.id),
      ]);
      setPendingCases(pending);
      setHandledCases(handled);
    } catch (err) {
      alert('Error loading cases: ' + err.message);
    }
  };

  const handleAcceptCase = async (caseId) => {
    if (!fee || fee <= 0) { alert('Please enter a valid fee amount'); return; }
    setLoading(true);
    try {
      await caseService.acceptCase(caseId, user.id, user.name, fee);
      setSelectedCase(null);
      setFee('');
      loadCases();
      alert('Case accepted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCase = async (caseId) => {
    if (!confirm('Are you sure you want to reject this case?')) return;
    setLoading(true);
    try {
      await caseService.rejectCase(caseId);
      setSelectedCase(null);
      loadCases();
      alert('Case rejected.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCase = async (caseId) => {
    if (!confirm('Remove this case from your dashboard?')) return;
    setLoading(true);
    try {
      await caseService.removeCaseFromAdvocate(caseId);
      loadCases();
    } catch (err) {
      alert('Error: ' + err.message);
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
          <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            Pending Cases ({pendingCases.length})
          </button>
          <button className={`tab ${activeTab === 'handled' ? 'active' : ''}`} onClick={() => setActiveTab('handled')}>
            Handled Cases ({handledCases.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="cases-section">
            <h3>Pending Case Requests</h3>
            {pendingCases.length === 0 ? <p>No pending cases at the moment.</p> : (
              <div className="cases-grid">
                {pendingCases.map(c => (
                  <div key={c.id} className="case-card">
                    <div className="case-header">
                      <h4>{c.category}</h4>
                      <span className="status-badge pending">Pending</span>
                    </div>
                    <p className="case-description">{c.description}</p>
                    <div className="case-details">
                      <p><strong>Client:</strong> {c.full_name || c.client_name}</p>
                      <p><strong>Email:</strong> {c.client_email}</p>
                      {c.phone && <p><strong>Phone:</strong> {c.phone}</p>}
                      {c.city && <p><strong>Location:</strong> {c.city}</p>}
                      <small>Submitted: {new Date(c.created_at).toLocaleDateString()}</small>
                    </div>
                    <div className="case-actions">
                      <button onClick={() => setSelectedCase(c)} className="primary-btn">Review Case</button>
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
            {handledCases.length === 0 ? <p>No handled cases yet.</p> : (
              <div className="cases-grid">
                {handledCases.map(c => (
                  <div key={c.id} className="case-card">
                    <div className="case-header">
                      <h4>{c.category}</h4>
                      <span className="status-badge" style={{ backgroundColor: c.status === 'Accepted' ? '#27ae60' : '#e74c3c' }}>
                        {c.status}
                      </span>
                    </div>
                    <p className="case-description">{c.description}</p>
                    <div className="case-details">
                      <p><strong>Client:</strong> {c.full_name || c.client_name}</p>
                      <p><strong>Email:</strong> {c.client_email}</p>
                      {c.phone && <p><strong>Phone:</strong> {c.phone}</p>}
                      {c.city && <p><strong>Location:</strong> {c.city}</p>}
                      {c.status === 'Accepted' && <p><strong>Fee:</strong> ₹{c.fee}</p>}
                      <small>Handled: {new Date(c.accepted_at || c.rejected_at).toLocaleDateString()}</small>
                    </div>
                    <div className="case-actions">
                      <button onClick={() => handleRemoveCase(c.id)} className="remove-btn" disabled={loading}>Remove</button>
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
              <button onClick={() => setSelectedCase(null)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="case-details-full">
                <p><strong>Client:</strong> {selectedCase.full_name || selectedCase.client_name}</p>
                <p><strong>Email:</strong> {selectedCase.client_email}</p>
                {selectedCase.phone && <p><strong>Phone:</strong> {selectedCase.phone}</p>}
                {selectedCase.city && <p><strong>Location:</strong> {selectedCase.city}</p>}
                <p><strong>Category:</strong> {selectedCase.category}</p>
                <p><strong>Description:</strong></p>
                <p className="description">{selectedCase.description}</p>
                <p><strong>Submitted:</strong> {new Date(selectedCase.created_at).toLocaleString()}</p>
              </div>
              <div className="fee-input">
                <label>Enter your fee (₹):</label>
                <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Enter fee amount" min="1" />
              </div>
              <div className="modal-actions">
                <button onClick={() => handleAcceptCase(selectedCase.id)} disabled={loading || !fee} className="accept-btn">
                  {loading ? 'Processing...' : 'Accept Case'}
                </button>
                <button onClick={() => handleRejectCase(selectedCase.id)} disabled={loading} className="reject-btn">
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