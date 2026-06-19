export const appointmentService = {
  STATUS: { SCHEDULED: 'Scheduled', COMPLETED: 'Completed', CANCELLED: 'Cancelled', RESCHEDULED: 'Rescheduled' },

  book: async (data) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    const newAppt = {
      id: Date.now().toString(),
      ...data,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };
    appts.push(newAppt);
    localStorage.setItem('appointments', JSON.stringify(appts));
    const { notificationService } = await import('./notificationService.js');
    notificationService.add(data.clientId, '📅 Appointment Booked', `Appointment with ${data.advocateName} on ${data.date} at ${data.time}`, 'appointment');
    notificationService.add(data.advocateId, '📅 New Appointment', `New appointment booked by ${data.clientName} on ${data.date} at ${data.time}`, 'appointment');
    return newAppt;
  },

  getByClient: (clientId) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    return appts.filter(a => a.clientId === clientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getByAdvocate: (advocateId) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    return appts.filter(a => a.advocateId === advocateId).sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  updateStatus: async (apptId, status, userId, userName) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    const idx = appts.findIndex(a => a.id === apptId);
    if (idx === -1) throw new Error('Appointment not found');
    appts[idx].status = status;
    appts[idx].updatedAt = new Date().toISOString();
    localStorage.setItem('appointments', JSON.stringify(appts));
    return appts[idx];
  },

  reschedule: async (apptId, newDate, newTime) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    const idx = appts.findIndex(a => a.id === apptId);
    if (idx === -1) throw new Error('Appointment not found');
    appts[idx].date = newDate;
    appts[idx].time = newTime;
    appts[idx].status = 'Rescheduled';
    appts[idx].updatedAt = new Date().toISOString();
    localStorage.setItem('appointments', JSON.stringify(appts));
    const { notificationService } = await import('./notificationService.js');
    notificationService.add(appts[idx].clientId, '📅 Appointment Rescheduled', `Your appointment has been rescheduled to ${newDate} at ${newTime}`, 'appointment');
    return appts[idx];
  },

  cancel: async (apptId) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    const idx = appts.findIndex(a => a.id === apptId);
    if (idx === -1) throw new Error('Appointment not found');
    appts[idx].status = 'Cancelled';
    appts[idx].cancelledAt = new Date().toISOString();
    localStorage.setItem('appointments', JSON.stringify(appts));
    const { notificationService } = await import('./notificationService.js');
    notificationService.add(appts[idx].advocateId, '❌ Appointment Cancelled', `Appointment by ${appts[idx].clientName} on ${appts[idx].date} was cancelled`, 'appointment');
    return appts[idx];
  },

  getAdvocateSlots: (advocateId, date) => {
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    const booked = appts.filter(a => a.advocateId === advocateId && a.date === date && a.status !== 'Cancelled').map(a => a.time);
    const allSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    return allSlots.map(s => ({ time: s, available: !booked.includes(s) }));
  },

  getAll: () => JSON.parse(localStorage.getItem('appointments') || '[]'),
};
