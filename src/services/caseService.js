// Mock case service using localStorage
export const caseService = {
  // Case categories
  CATEGORIES: [
    'Theft Case',
    'Property / Asset Issue',
    'Civil Case',
    'Criminal Case',
    'Family Dispute'
  ],

  // Case statuses
  STATUS: {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected'
  },

  // Create new case
  createCase: async (caseData) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    
    const newCase = {
      id: Date.now().toString(),
      ...caseData,
      status: caseService.STATUS.PENDING,
      createdAt: new Date().toISOString(),
      advocateId: null,
      advocateName: null,
      fee: null
    };

    cases.push(newCase);
    localStorage.setItem('cases', JSON.stringify(cases));
    
    return newCase;
  },

  // Get cases by client ID
  getCasesByClient: (clientId) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => c.clientId === clientId && !c.removedFromAdvocate && c.status !== 'Rejected');
  },

  // Get pending cases for advocates
  getPendingCases: () => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => c.status === caseService.STATUS.PENDING);
  },

  // Accept case
  acceptCase: async (caseId, advocateId, advocateName, fee) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }

    cases[caseIndex].status = caseService.STATUS.ACCEPTED;
    cases[caseIndex].advocateId = advocateId;
    cases[caseIndex].advocateName = advocateName;
    cases[caseIndex].fee = fee;
    cases[caseIndex].acceptedAt = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));
    return cases[caseIndex];
  },

  // Reject case
  rejectCase: async (caseId) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }

    cases[caseIndex].status = caseService.STATUS.REJECTED;
    cases[caseIndex].rejectedAt = new Date().toISOString();

    localStorage.setItem('cases', JSON.stringify(cases));
    return cases[caseIndex];
  },

  // Get cases handled by advocate
  getCasesByAdvocate: (advocateId) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => c.advocateId === advocateId && (c.status === 'Accepted' || c.status === 'Rejected'));
  },

  // Remove case from advocate view
  removeCaseFromAdvocate: async (caseId) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const caseIndex = cases.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }

    cases[caseIndex].removedFromAdvocate = true;
    localStorage.setItem('cases', JSON.stringify(cases));
    return cases[caseIndex];
  }
};