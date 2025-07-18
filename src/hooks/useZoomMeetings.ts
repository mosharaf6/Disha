import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ZoomMeeting {
  id: string;
  zoom_meeting_id: string;
  join_url: string;
  start_url?: string;
  meeting_password: string;
  scheduled_start_time: string;
  scheduled_duration_minutes: number;
  meeting_status: 'scheduled' | 'started' | 'ended' | 'cancelled';
  waiting_room_enabled: boolean;
  booking: {
    id: string;
    session_topic?: string;
    student_message?: string;
    mentor_notes?: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    mentor: {
      id: string;
      name: string;
      email: string;
    };
    session: {
      title: string;
      description?: string;
      duration: string;
      price_cents: number;
    };
  };
}

interface CreateMeetingRequest {
  bookingId: string;
  mentorZoomUserId: string;
}

export function useZoomMeetings(userId?: string) {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchMeetings();
      
      // Set up real-time subscription for meeting updates
      const subscription = supabase
        .channel('zoom_meetings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'zoom_meetings',
            filter: `booking_id=in.(${getMeetingBookingIds().join(',')})`
          },
          (payload) => {
            console.log('Meeting update received:', payload);
            fetchMeetings(); // Refetch meetings on any change
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const getMeetingBookingIds = (): string[] => {
    return meetings.map(meeting => meeting.booking.id);
  };

  const fetchMeetings = async () => {
    if (!userId) return;

    try {
      setError(null);
      
      // First get all bookings for the user
      const { data: bookings, error: bookingsError } = await supabase
        .from('session_bookings')
        .select('id')
        .or(`student_id.eq.${userId},mentor_id.eq.${userId}`)
        .in('booking_status', ['confirmed', 'paid', 'completed']);

      if (bookingsError) throw bookingsError;

      if (!bookings || bookings.length === 0) {
        setMeetings([]);
        return;
      }

      const bookingIds = bookings.map(b => b.id);

      // Then get meetings for those bookings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('zoom_meetings')
        .select(`
          id,
          zoom_meeting_id,
          join_url,
          start_url,
          meeting_password,
          scheduled_start_time,
          scheduled_duration_minutes,
          meeting_status,
          waiting_room_enabled,
          booking:session_bookings(
            id,
            session_topic,
            student_message,
            mentor_notes,
            student:profiles!session_bookings_student_id_fkey(
              id,
              name,
              email
            ),
            mentor:profiles!session_bookings_mentor_id_fkey(
              id,
              name,
              email
            ),
            session:mentor_sessions(
              title,
              description,
              duration,
              price_cents
            )
          )
        `)
        .in('booking_id', bookingIds)
        .order('scheduled_start_time', { ascending: true });

      if (meetingsError) throw meetingsError;

      setMeetings(meetingsData || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (request: CreateMeetingRequest): Promise<string> => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }

      const result = await response.json();
      
      // Refresh meetings list
      await fetchMeetings();
      
      return result.data.meetingId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getMeetingDetails = async (meetingId: string): Promise<ZoomMeeting> => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get meeting details');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get meeting details';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getMeetingByBooking = async (bookingId: string): Promise<ZoomMeeting> => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/meetings/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get meeting for booking');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get meeting for booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: 'started' | 'ended' | 'cancelled'): Promise<void> => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/meetings/${meetingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update meeting status');
      }

      // Refresh meetings list
      await fetchMeetings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update meeting status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const cancelMeeting = async (meetingId: string, reason?: string): Promise<void> => {
    try {
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel meeting');
      }

      // Refresh meetings list
      await fetchMeetings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const joinMeeting = (meeting: ZoomMeeting, isHost: boolean = false): void => {
    const url = isHost && meeting.start_url ? meeting.start_url : meeting.join_url;
    
    // Open Zoom meeting in new window/tab
    const meetingWindow = window.open(url, '_blank', 'width=1200,height=800');
    
    if (!meetingWindow) {
      // Fallback if popup is blocked
      window.location.href = url;
    }
    
    // Update meeting status to started if user is host
    if (isHost && meeting.meeting_status === 'scheduled') {
      updateMeetingStatus(meeting.id, 'started').catch(console.error);
    }
  };

  // Filter meetings by status
  const upcomingMeetings = meetings.filter(m => 
    m.meeting_status === 'scheduled' && new Date(m.scheduled_start_time) > new Date()
  );
  
  const activeMeetings = meetings.filter(m => m.meeting_status === 'started');
  
  const completedMeetings = meetings.filter(m => 
    m.meeting_status === 'ended' || 
    (m.meeting_status === 'scheduled' && new Date(m.scheduled_start_time) < new Date())
  );

  return {
    meetings,
    upcomingMeetings,
    activeMeetings,
    completedMeetings,
    loading,
    error,
    createMeeting,
    getMeetingDetails,
    getMeetingByBooking,
    updateMeetingStatus,
    cancelMeeting,
    joinMeeting,
    refetch: fetchMeetings
  };
}