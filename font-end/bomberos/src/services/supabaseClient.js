import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Emergency Calls Service
export const emergencyCallsService = {
  // Create a new emergency call
  async createCall(callData) {
    const { data, error } = await supabase
      .from('emergency_calls')
      .insert([{
        caller_name: callData.callerName,
        caller_phone: callData.callerPhone,
        caller_address: callData.callerAddress,
        emergency_type: callData.emergencyType,
        priority: callData.priority,
        description: callData.description,
        transcript: callData.transcript,
        location_lat: callData.locationLat,
        location_lng: callData.locationLng,
        status: callData.status || 'active',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error creating call:', error);
      throw error;
    }
    return data[0];
  },

  // Get all calls
  async getAllCalls(filters = {}) {
    let query = supabase
      .from('emergency_calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
    return data;
  },

  // Get single call by ID
  async getCallById(id) {
    const { data, error } = await supabase
      .from('emergency_calls')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching call:', error);
      throw error;
    }
    return data;
  },

  // Update call
  async updateCall(id, updates) {
    const { data, error } = await supabase
      .from('emergency_calls')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating call:', error);
      throw error;
    }
    return data[0];
  },

  // Delete call
  async deleteCall(id) {
    const { error } = await supabase
      .from('emergency_calls')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting call:', error);
      throw error;
    }
    return true;
  },

  // Add transcript entry
  async addTranscriptEntry(callId, entry) {
    const call = await this.getCallById(callId);
    const transcript = call.transcript || [];
    transcript.push(entry);

    return this.updateCall(callId, { transcript });
  }
};

// Reports Service
export const reportsService = {
  async createReport(reportData) {
    const { data, error } = await supabase
      .from('emergency_reports')
      .insert([reportData])
      .select();

    if (error) {
      console.error('Error creating report:', error);
      throw error;
    }
    return data[0];
  },

  async getReportsByCallId(callId) {
    const { data, error } = await supabase
      .from('emergency_reports')
      .select('*')
      .eq('call_id', callId);

    if (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
    return data;
  }
};

export default supabase;
