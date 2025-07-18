import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const fetchBookings = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          learner:profiles!bookings_learner_id_fkey(*),
          mentor:profiles!bookings_mentor_id_fkey(*)
        `)
        .or(`learner_id.eq.${userId},mentor_id.eq.${userId}`)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    mentor_id: string;
    availability_slot_id: string;
    start_time: string;
    end_time: string;
    topic?: string;
    message?: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Generate video call link (simplified - in production, integrate with Google Meet/Zoom)
      const videoCallLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          learner_id: userId,
          ...bookingData,
          video_call_link: videoCallLink,
          status: 'confirmed'
        })
        .select(`
          *,
          learner:profiles!bookings_learner_id_fkey(*),
          mentor:profiles!bookings_mentor_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Mark availability slot as booked
      await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', bookingData.availability_slot_id);

      setBookings(prev => [...prev, data].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));

      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select(`
          *,
          learner:profiles!bookings_learner_id_fkey(*),
          mentor:profiles!bookings_mentor_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? data : booking
      ));

      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  return {
    bookings,
    loading,
    createBooking,
    updateBookingStatus,
    refetch: fetchBookings
  };
}