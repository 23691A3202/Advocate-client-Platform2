export const adminService = {
  getComplaints: () => JSON.parse(localStorage.getItem('complaints') || '[]').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  submitComplaint: async (userId, userName, description) => {
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const newComplaint = {
      id: Date.now().toString(),
      userId, userName, description,
      status: 'Open',
      resolution: null,
      createdAt: new Date().toISOString(),
    };
    complaints.push(newComplaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    return newComplaint;
  },

  resolveComplaint: (complaintId, resolution) => {
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const idx = complaints.findIndex(c => c.id === complaintId);
    if (idx !== -1) {
      complaints[idx].status = 'Resolved';
      complaints[idx].resolution = resolution;
      complaints[idx].resolvedAt = new Date().toISOString();
      localStorage.setItem('complaints', JSON.stringify(complaints));
    }
    return complaints[idx];
  },

  getPlatformStats: () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const cases = JSON.parse(localStorage.getItem('cases') || '[]');
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    return {
      totalUsers: users.length,
      totalClients: users.filter(u => u.role === 'client').length,
      totalAdvocates: users.filter(u => u.role === 'advocate').length,
      pendingAdvocates: users.filter(u => u.role === 'advocate' && u.approvalStatus === 'pending').length,
      totalCases: cases.length,
      activeCases: cases.filter(c => ['Accepted', 'In Progress', 'Hearing Scheduled'].includes(c.status)).length,
      closedCases: cases.filter(c => c.status === 'Closed').length,
      pendingCases: cases.filter(c => c.status === 'Pending').length,
      totalAppointments: appts.length,
      openComplaints: complaints.filter(c => c.status === 'Open').length,
      resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
      casesByCategory: ['Civil', 'Criminal', 'Property', 'Family', 'Labor', 'Corporate'].map(cat => ({
        category: cat,
        count: cases.filter(c => c.category === cat).length,
      })),
      recentActivity: JSON.parse(localStorage.getItem('auditLogs') || '[]').slice(0, 10),
    };
  },

  getPrivateNotes: (advocateId) => {
    const notes = JSON.parse(localStorage.getItem('privateNotes') || '[]');
    return notes.filter(n => n.advocateId === advocateId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addPrivateNote: (advocateId, caseId, content) => {
    const notes = JSON.parse(localStorage.getItem('privateNotes') || '[]');
    const newNote = { id: Date.now().toString(), advocateId, caseId, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    notes.push(newNote);
    localStorage.setItem('privateNotes', JSON.stringify(notes));
    return newNote;
  },

  updatePrivateNote: (noteId, content) => {
    const notes = JSON.parse(localStorage.getItem('privateNotes') || '[]');
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx !== -1) { notes[idx].content = content; notes[idx].updatedAt = new Date().toISOString(); localStorage.setItem('privateNotes', JSON.stringify(notes)); }
    return notes[idx];
  },

  deletePrivateNote: (noteId) => {
    const notes = JSON.parse(localStorage.getItem('privateNotes') || '[]');
    localStorage.setItem('privateNotes', JSON.stringify(notes.filter(n => n.id !== noteId)));
  },
};
