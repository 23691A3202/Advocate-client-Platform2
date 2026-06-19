export const chatService = {
  sendMessage: async (senderId, senderName, receiverId, receiverName, caseId, message, file = null) => {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const newMsg = {
      id: Date.now().toString(),
      senderId, senderName, receiverId, receiverName, caseId,
      message, file,
      timestamp: new Date().toISOString(),
      read: false,
    };
    messages.push(newMsg);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    const { notificationService } = await import('./notificationService.js');
    notificationService.add(receiverId, `💬 New message from ${senderName}`, message.substring(0, 60) + (message.length > 60 ? '...' : ''), 'message');
    return newMsg;
  },

  getMessages: (userId1, userId2, caseId) => {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    return messages
      .filter(m => m.caseId === caseId && ((m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1)))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  getConversations: (userId) => {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const userMsgs = messages.filter(m => m.senderId === userId || m.receiverId === userId);
    const convMap = {};
    userMsgs.forEach(m => {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      const otherName = m.senderId === userId ? m.receiverName : m.senderName;
      const key = `${otherId}-${m.caseId}`;
      if (!convMap[key] || new Date(m.timestamp) > new Date(convMap[key].lastMessage.timestamp)) {
        convMap[key] = { otherId, otherName, caseId: m.caseId, lastMessage: m, unread: 0 };
      }
      if (m.receiverId === userId && !m.read) convMap[key].unread++;
    });
    return Object.values(convMap).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  },

  markRead: (userId, otherId, caseId) => {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.forEach(m => { if (m.receiverId === userId && m.senderId === otherId && m.caseId === caseId) m.read = true; });
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  },

  getUnreadCount: (userId) => {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    return messages.filter(m => m.receiverId === userId && !m.read).length;
  },
};
