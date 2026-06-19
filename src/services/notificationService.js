export const notificationService = {
  add: (userId, title, message, type = 'info') => {
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifs.unshift({
      id: Date.now().toString(),
      userId, title, message, type,
      status: 'unread',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('notifications', JSON.stringify(notifs));
  },

  getByUser: (userId) => {
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    return notifs.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  markRead: (notifId) => {
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    const idx = notifs.findIndex(n => n.id === notifId);
    if (idx !== -1) { notifs[idx].status = 'read'; localStorage.setItem('notifications', JSON.stringify(notifs)); }
  },

  markAllRead: (userId) => {
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifs.forEach(n => { if (n.userId === userId) n.status = 'read'; });
    localStorage.setItem('notifications', JSON.stringify(notifs));
  },

  getUnreadCount: (userId) => {
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    return notifs.filter(n => n.userId === userId && n.status === 'unread').length;
  },

  deleteNotif: (notifId) => {
    const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    localStorage.setItem('notifications', JSON.stringify(notifs.filter(n => n.id !== notifId)));
  },
};
