export const caseService = {
  CATEGORIES: ['Civil', 'Criminal', 'Property', 'Family', 'Labor', 'Corporate'],
  STATUS: {
    PENDING: 'Pending', ACCEPTED: 'Accepted', IN_PROGRESS: 'In Progress',
    HEARING_SCHEDULED: 'Hearing Scheduled', CLOSED: 'Closed', REJECTED: 'Rejected',
  },

  createCase: async (caseData) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const newCase = {
      id: Date.now().toString(),
      ...caseData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      advocateId: null, advocateName: null, fee: null,
      timeline: [{ event: 'Case Submitted', date: new Date().toISOString(), by: 'Client' }],
      remarks: [],
      hearingDates: [],
    };
    cases.push(newCase);
    localStorage.setItem('cases', JSON.stringify(cases));
    // Notification
    const notifService = await import('./notificationService.js');
    notifService.notificationService.add(caseData.clientId, 'Case Submitted', `Your case "${caseData.title}" has been submitted successfully.`, 'case');
    return newCase;
  },

  getCasesByClient: (clientId) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => c.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getPendingCases: () => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => c.status === 'Pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getCasesByAdvocate: (advocateId) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.filter(c => c.advocateId === advocateId && c.status !== 'Rejected').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllCases: () => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getCaseById: (id) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return cases.find(c => c.id === id) || null;
  },

  acceptCase: async (caseId, advocateId, advocateName, fee) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const idx = cases.findIndex(c => c.id === caseId);
    if (idx === -1) throw new Error('Case not found');
    cases[idx].status = 'Accepted';
    cases[idx].advocateId = advocateId;
    cases[idx].advocateName = advocateName;
    cases[idx].fee = fee;
    cases[idx].acceptedAt = new Date().toISOString();
    cases[idx].timeline.push({ event: 'Case Accepted', date: new Date().toISOString(), by: advocateName });
    localStorage.setItem('cases', JSON.stringify(cases));
    const notifService = await import('./notificationService.js');
    notifService.notificationService.add(cases[idx].clientId, 'Case Accepted! ✅', `Your case has been accepted by ${advocateName}. Fee: ₹${fee}`, 'case');
    return cases[idx];
  },

  rejectCase: async (caseId, advocateId, advocateName) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const idx = cases.findIndex(c => c.id === caseId);
    if (idx === -1) throw new Error('Case not found');
    cases[idx].status = 'Rejected';
    cases[idx].rejectedAt = new Date().toISOString();
    cases[idx].timeline.push({ event: 'Case Rejected', date: new Date().toISOString(), by: advocateName || 'Advocate' });
    localStorage.setItem('cases', JSON.stringify(cases));
    const notifService = await import('./notificationService.js');
    notifService.notificationService.add(cases[idx].clientId, 'Case Update', `Your case has been reviewed. Please consult another advocate.`, 'case');
    return cases[idx];
  },

  updateCaseStatus: async (caseId, status, remark, updatedBy) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const idx = cases.findIndex(c => c.id === caseId);
    if (idx === -1) throw new Error('Case not found');
    cases[idx].status = status;
    cases[idx].updatedAt = new Date().toISOString();
    cases[idx].timeline.push({ event: `Status changed to "${status}"`, date: new Date().toISOString(), by: updatedBy, remark });
    if (remark) cases[idx].remarks.push({ text: remark, date: new Date().toISOString(), by: updatedBy });
    localStorage.setItem('cases', JSON.stringify(cases));
    const notifService = await import('./notificationService.js');
    notifService.notificationService.add(cases[idx].clientId, 'Case Status Updated', `Your case status changed to: ${status}`, 'case');
    return cases[idx];
  },

  addHearingDate: async (caseId, hearingDate, court, updatedBy) => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const idx = cases.findIndex(c => c.id === caseId);
    if (idx === -1) throw new Error('Case not found');
    cases[idx].hearingDates.push({ date: hearingDate, court, scheduledAt: new Date().toISOString() });
    cases[idx].status = 'Hearing Scheduled';
    cases[idx].timeline.push({ event: `Hearing scheduled on ${hearingDate} at ${court}`, date: new Date().toISOString(), by: updatedBy });
    localStorage.setItem('cases', JSON.stringify(cases));
    const notifService = await import('./notificationService.js');
    notifService.notificationService.add(cases[idx].clientId, '⚖️ Hearing Scheduled', `Hearing scheduled on ${hearingDate} at ${court}`, 'hearing');
    return cases[idx];
  },

  getStats: () => {
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    return {
      total: cases.length,
      pending: cases.filter(c => c.status === 'Pending').length,
      active: cases.filter(c => ['Accepted', 'In Progress', 'Hearing Scheduled'].includes(c.status)).length,
      closed: cases.filter(c => c.status === 'Closed').length,
      rejected: cases.filter(c => c.status === 'Rejected').length,
      byCategory: caseService.CATEGORIES.map(cat => ({ name: cat, count: cases.filter(c => c.category === cat).length })),
    };
  },
};