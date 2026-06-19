import { supabase } from './supabaseClient';

export const caseService = {
  CATEGORIES: [
    'Theft Case',
    'Property / Asset Issue',
    'Civil Case',
    'Criminal Case',
    'Family Dispute'
  ],

  STATUS: {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
  },

  createCase: async (caseData) => {
    const { data, error } = await supabase.from('cases').insert([{
      client_id: caseData.clientId,
      client_name: caseData.clientName,
      client_email: caseData.clientEmail,
      full_name: caseData.fullName,
      phone: caseData.phone,
      city: caseData.city,
      category: caseData.category,
      description: caseData.description,
      status: 'Pending',
    }]).select().single();

    if (error) throw new Error(error.message);
    return data;
  },

  getCasesByClient: async (clientId) => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('client_id', clientId)
      .neq('status', 'Rejected')
      .eq('removed_from_advocate', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getPendingCases: async () => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getCasesByAdvocate: async (advocateId) => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('advocate_id', advocateId)
      .in('status', ['Accepted', 'Rejected'])
      .eq('removed_from_advocate', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  acceptCase: async (caseId, advocateId, advocateName, fee) => {
    const { data, error } = await supabase
      .from('cases')
      .update({
        status: 'Accepted',
        advocate_id: advocateId,
        advocate_name: advocateName,
        fee: fee,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  rejectCase: async (caseId) => {
    const { data, error } = await supabase
      .from('cases')
      .update({
        status: 'Rejected',
        rejected_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  removeCaseFromAdvocate: async (caseId) => {
    const { data, error } = await supabase
      .from('cases')
      .update({ removed_from_advocate: true })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};