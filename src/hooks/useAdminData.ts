import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MentorApplication {
  id: string;
  applicant_id: string;
  application_data: any;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expertise_areas: string[];
  experience_level: string;
  motivation: string;
  languages: string[];
  availability_hours: number;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  application_score: number | null;
  submitted_at: string;
  applicant?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    university: string | null;
    country: string | null;
  };
  reviewer?: {
    name: string;
    email: string;
  };
}

interface PlatformStats {
  total_mentors: number;
  total_mentees: number;
  pending_applications: number;
  completed_sessions: number;
  approval_rate: number;
  average_rating: number;
  monthly_growth: number;
  active_calls: number;
}

interface ScheduledCall {
  id: string;
  mentor_id: string;
  student_id: string;
  session_topic: string | null;
  scheduled_start_time: string;
  scheduled_duration_minutes: number;
  booking_status: string;
  mentor: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
  student: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
  session: {
    title: string;
    price_cents: number;
  };
}

export function useAdminData() {
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
    
    // Set up real-time subscriptions
    const applicationsSubscription = supabase
      .channel('mentor_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    const bookingsSubscription = supabase
      .channel('session_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_bookings'
        },
        () => {
          fetchScheduledCalls();
        }
      )
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchApplications(),
        fetchScheduledCalls(),
        fetchPlatformStats()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_applications')
        .select(`
          *,
          applicant:profiles!mentor_applications_applicant_id_fkey(
            id,
            name,
            email,
            avatar_url,
            university,
            country
          ),
          reviewer:admin_users!mentor_applications_reviewed_by_fkey(
            name,
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      throw err;
    }
  };

  const fetchScheduledCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('session_bookings')
        .select(`
          id,
          mentor_id,
          student_id,
          session_topic,
          booking_status,
          mentor:profiles!session_bookings_mentor_id_fkey(
            name,
            email,
            avatar_url
          ),
          student:profiles!session_bookings_student_id_fkey(
            name,
            email,
            avatar_url
          ),
          session:mentor_sessions(
            title,
            start_time,
            duration,
            price_cents
          )
        `)
        .in('booking_status', ['confirmed', 'paid'])
        .gte('session.start_time', new Date().toISOString())
        .order('session.start_time', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        scheduled_start_time: item.session?.start_time || '',
        scheduled_duration_minutes: item.session?.duration === '15' ? 15 : 
                                   item.session?.duration === '30' ? 30 : 60
      }));
      
      setScheduledCalls(transformedData);
    } catch (err) {
      console.error('Error fetching scheduled calls:', err);
      throw err;
    }
  };

  const fetchPlatformStats = async () => {
    try {
      // Fetch current stats
      const [
        mentorsResult,
        menteesResult,
        pendingAppsResult,
        completedSessionsResult,
        analyticsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'mentor'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'learner'),
        supabase.from('mentor_applications').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('session_bookings').select('id', { count: 'exact' }).eq('booking_status', 'completed'),
        supabase.from('platform_analytics')
          .select('metric_name, metric_value')
          .eq('date_recorded', new Date().toISOString().split('T')[0])
      ]);

      const analytics = analyticsResult.data?.reduce((acc, item) => {
        acc[item.metric_name] = item.metric_value;
        return acc;
      }, {} as Record<string, number>) || {};

      setPlatformStats({
        total_mentors: mentorsResult.count || 0,
        total_mentees: menteesResult.count || 0,
        pending_applications: pendingAppsResult.count || 0,
        completed_sessions: completedSessionsResult.count || 0,
        approval_rate: analytics.approval_rate || 0,
        average_rating: analytics.average_session_rating || 0,
        monthly_growth: analytics.monthly_growth || 0,
        active_calls: 0 // This would come from real-time meeting data
      });
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      throw err;
    }
  };

  const updateApplicationStatus = async (
    applicationId: string, 
    status: MentorApplication['status'],
    notes?: string,
    score?: number
  ) => {
    try {
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString()
      };

      if (notes) updateData.admin_notes = notes;
      if (score !== undefined) updateData.application_score = score;

      const { error } = await supabase
        .from('mentor_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      // If approved, update the profile role
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          await supabase
            .from('profiles')
            .update({ role: 'mentor' })
            .eq('id', application.applicant_id);
        }
      }

      await fetchApplications();
    } catch (err) {
      console.error('Error updating application status:', err);
      throw err;
    }
  };

  const bulkUpdateApplications = async (
    applicationIds: string[],
    status: MentorApplication['status'],
    notes?: string
  ) => {
    try {
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString()
      };

      if (notes) updateData.admin_notes = notes;

      const { error } = await supabase
        .from('mentor_applications')
        .update(updateData)
        .in('id', applicationIds);

      if (error) throw error;

      // If approved, update profile roles
      if (status === 'approved') {
        const approvedApplications = applications.filter(app => 
          applicationIds.includes(app.id)
        );
        
        const applicantIds = approvedApplications.map(app => app.applicant_id);
        
        await supabase
          .from('profiles')
          .update({ role: 'mentor' })
          .in('id', applicantIds);
      }

      await fetchApplications();
    } catch (err) {
      console.error('Error bulk updating applications:', err);
      throw err;
    }
  };

  const rescheduleCall = async (bookingId: string, newDateTime: string) => {
    try {
      const { error } = await supabase
        .from('session_bookings')
        .update({
          // This would update the associated session's start_time
          // Implementation depends on your session management logic
          rescheduled_count: supabase.sql`rescheduled_count + 1`
        })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchScheduledCalls();
    } catch (err) {
      console.error('Error rescheduling call:', err);
      throw err;
    }
  };

  const cancelCall = async (bookingId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('session_bookings')
        .update({
          booking_status: 'cancelled',
          cancellation_reason: reason
        })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchScheduledCalls();
    } catch (err) {
      console.error('Error cancelling call:', err);
      throw err;
    }
  };

  return {
    applications,
    scheduledCalls,
    platformStats,
    loading,
    error,
    updateApplicationStatus,
    bulkUpdateApplications,
    rescheduleCall,
    cancelCall,
    refetch: fetchAllData
  };
}