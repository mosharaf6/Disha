import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MentorAvailability } from '../types';

export function useAvailability(mentorId?: string) {
  const [availability, setAvailability] = useState<MentorAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mentorId) {
      fetchAvailability();
    }
  }, [mentorId]);

  const fetchAvailability = async () => {
    if (!mentorId) return;

    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_booked', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAvailabilitySlot = async (startTime: string, endTime: string, duration: number = 60) => {
    if (!mentorId) return;

    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .insert({
          mentor_id: mentorId,
          start_time: startTime,
          end_time: endTime,
          duration
        })
        .select()
        .single();

      if (error) throw error;
      setAvailability(prev => [...prev, data].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
      return data;
    } catch (error) {
      console.error('Error adding availability:', error);
      throw error;
    }
  };

  const removeAvailabilitySlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      setAvailability(prev => prev.filter(slot => slot.id !== slotId));
    } catch (error) {
      console.error('Error removing availability:', error);
      throw error;
    }
  };

  return {
    availability,
    loading,
    addAvailabilitySlot,
    removeAvailabilitySlot,
    refetch: fetchAvailability
  };
}