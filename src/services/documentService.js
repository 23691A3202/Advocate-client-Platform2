export const documentService = {
  upload: (caseId, file, uploadedBy, uploadedById, type = 'document') => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const docs = JSON.parse(localStorage.getItem('documents') || '[]');
        const newDoc = {
          id: Date.now().toString(),
          caseId, type,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: e.target.result,
          uploadedBy, uploadedById,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'pending',
          comments: [],
        };
        docs.push(newDoc);
        localStorage.setItem('documents', JSON.stringify(docs));
        resolve(newDoc);
      };
      reader.readAsDataURL(file);
    });
  },

  getByCaseId: (caseId) => {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    return docs.filter(d => d.caseId === caseId).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  },

  getAll: () => {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    return docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  },

  download: (docId) => {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = docs.find(d => d.id === docId);
    if (!doc) throw new Error('Document not found');
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  },

  verify: (docId, status, comment, advocateName) => {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    const idx = docs.findIndex(d => d.id === docId);
    if (idx === -1) throw new Error('Document not found');
    docs[idx].verificationStatus = status;
    docs[idx].verifiedAt = new Date().toISOString();
    docs[idx].verifiedBy = advocateName;
    if (comment) docs[idx].comments.push({ text: comment, by: advocateName, date: new Date().toISOString() });
    localStorage.setItem('documents', JSON.stringify(docs));
    return docs[idx];
  },

  delete: (docId) => {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    localStorage.setItem('documents', JSON.stringify(docs.filter(d => d.id !== docId)));
  },

  formatSize: (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },
};
