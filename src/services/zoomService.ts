import { supabase } from '../lib/supabase';

// Zoom API Configuration
interface ZoomConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  webhookSecret: string;
}

interface ZoomMeetingRequest {
  topic: string;
  type: number; // 1=instant, 2=scheduled, 3=recurring no fixed time, 8=recurring fixed time
  start_time: string; // ISO 8601 format
  duration: number; // minutes
  timezone: string;
  password?: string;
  agenda?: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    cn_meeting: boolean;
    in_meeting: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    watermark: boolean;
    use_pmi: boolean;
    approval_type: number; // 0=automatically approve, 1=manually approve, 2=no registration required
    registration_type: number; // 1=attendees register once, 2=attendees register for each occurrence, 3=attendees register once and can choose to attend any occurrence
    audio: string; // both, telephony, voip
    auto_recording: string; // local, cloud, none
    enforce_login: boolean;
    enforce_login_domains?: string;
    alternative_hosts?: string;
    close_registration?: boolean;
    show_share_button?: boolean;
    allow_multiple_devices?: boolean;
    registrants_confirmation_email?: boolean;
    waiting_room?: boolean;
    registrants_email_notification?: boolean;
    meeting_authentication?: boolean;
    encryption_type?: string; // enhanced_encryption, e2ee
  };
}

interface ZoomMeetingResponse {
  uuid: string;
  id: number;
  host_id: string;
  host_email: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  agenda: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password: string;
  h323_password: string;
  pstn_password: string;
  encrypted_password: string;
  settings: any;
  pre_schedule: boolean;
}

export class ZoomService {
  private config: ZoomConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      apiKey: process.env.ZOOM_API_KEY || '',
      apiSecret: process.env.ZOOM_API_SECRET || '',
      baseUrl: 'https://api.zoom.us/v2',
      webhookSecret: process.env.ZOOM_WEBHOOK_SECRET || ''
    };
  }

  /**
   * Generate JWT token for Zoom API authentication
   */
  private generateJWT(): string {
    const jwt = require('jsonwebtoken');
    const payload = {
      iss: this.config.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    };
    return jwt.sign(payload, this.config.apiSecret);
  }

  /**
   * Get OAuth access token for Zoom API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Zoom access token:', error);
      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  /**
   * Make authenticated request to Zoom API
   */
  private async makeZoomRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Zoom API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new Zoom meeting
   */
  async createMeeting(bookingId: string, mentorZoomUserId: string): Promise<string> {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('session_bookings')
        .select(`
          *,
          session:mentor_sessions(*),
          student:profiles!session_bookings_student_id_fkey(*),
          mentor:profiles!session_bookings_mentor_id_fkey(*)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error('Booking not found');
      }

      // Calculate meeting duration based on session duration
      const durationMap = { '15': 15, '30': 30, '60': 60 };
      const duration = durationMap[booking.session.duration as keyof typeof durationMap] || 60;

      // Create meeting request
      const meetingRequest: ZoomMeetingRequest = {
        topic: `Disha Mentorship: ${booking.session.title}`,
        type: 2, // Scheduled meeting
        start_time: booking.session.start_time,
        duration: duration,
        timezone: booking.session.timezone || 'UTC',
        password: this.generateMeetingPassword(),
        agenda: `Mentorship session between ${booking.mentor.name} and ${booking.student.name}. Topic: ${booking.session_topic || 'General guidance'}`,
        settings: {
          host_video: true,
          participant_video: true,
          cn_meeting: false,
          in_meeting: false,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0, // Automatically approve
          registration_type: 1,
          audio: 'both',
          auto_recording: 'cloud', // Enable cloud recording
          enforce_login: false,
          close_registration: false,
          show_share_button: true,
          allow_multiple_devices: false,
          registrants_confirmation_email: true,
          waiting_room: true,
          registrants_email_notification: true,
          meeting_authentication: false,
          encryption_type: 'enhanced_encryption'
        }
      };

      // Create meeting via Zoom API
      const zoomMeeting: ZoomMeetingResponse = await this.makeZoomRequest(
        `/users/${mentorZoomUserId}/meetings`,
        {
          method: 'POST',
          body: JSON.stringify(meetingRequest)
        }
      );

      // Store meeting details in database
      const { data: meetingRecord, error: meetingError } = await supabase
        .from('zoom_meetings')
        .insert({
          booking_id: bookingId,
          zoom_meeting_id: zoomMeeting.id.toString(),
          zoom_meeting_uuid: zoomMeeting.uuid,
          host_id: zoomMeeting.host_id,
          join_url: zoomMeeting.join_url,
          start_url: zoomMeeting.start_url,
          host_join_url: zoomMeeting.start_url,
          meeting_password: zoomMeeting.password,
          waiting_room_enabled: meetingRequest.settings.waiting_room || false,
          require_registration: false,
          mute_participants_on_entry: meetingRequest.settings.mute_upon_entry,
          scheduled_start_time: booking.session.start_time,
          scheduled_duration_minutes: duration,
          timezone: booking.session.timezone || 'UTC',
          auto_recording: true
        })
        .select()
        .single();

      if (meetingError) {
        console.error('Error storing meeting record:', meetingError);
        throw new Error('Failed to store meeting details');
      }

      // Create participant records
      await this.createParticipantRecords(meetingRecord.id, booking);

      // Schedule notifications
      await this.scheduleNotifications(bookingId, booking);

      return meetingRecord.id;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  }

  /**
   * Update meeting status
   */
  async updateMeetingStatus(meetingId: string, status: 'started' | 'ended' | 'cancelled'): Promise<void> {
    try {
      const updateData: any = {
        meeting_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'started') {
        updateData.actual_start_time = new Date().toISOString();
      } else if (status === 'ended') {
        updateData.actual_end_time = new Date().toISOString();
        
        // Calculate actual duration
        const { data: meeting } = await supabase
          .from('zoom_meetings')
          .select('actual_start_time')
          .eq('id', meetingId)
          .single();

        if (meeting?.actual_start_time) {
          const startTime = new Date(meeting.actual_start_time);
          const endTime = new Date();
          updateData.actual_duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        }
      }

      const { error } = await supabase
        .from('zoom_meetings')
        .update(updateData)
        .eq('id', meetingId);

      if (error) {
        throw new Error(`Failed to update meeting status: ${error.message}`);
      }

      // Update booking status if meeting ended
      if (status === 'ended') {
        await supabase
          .from('session_bookings')
          .update({ booking_status: 'completed' })
          .eq('id', (await supabase
            .from('zoom_meetings')
            .select('booking_id')
            .eq('id', meetingId)
            .single()
          ).data?.booking_id);
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
      throw error;
    }
  }

  /**
   * Get meeting details for authorized users
   */
  async getMeetingDetails(meetingId: string, userId: string): Promise<any> {
    try {
      const { data: meeting, error } = await supabase
        .from('zoom_meetings')
        .select(`
          *,
          booking:session_bookings(
            *,
            student:profiles!session_bookings_student_id_fkey(*),
            mentor:profiles!session_bookings_mentor_id_fkey(*),
            session:mentor_sessions(*)
          )
        `)
        .eq('id', meetingId)
        .single();

      if (error || !meeting) {
        throw new Error('Meeting not found');
      }

      // Check authorization
      const isAuthorized = meeting.booking.student_id === userId || meeting.booking.mentor_id === userId;
      if (!isAuthorized) {
        throw new Error('Unauthorized access to meeting');
      }

      // Return appropriate details based on user role
      const isMentor = meeting.booking.mentor_id === userId;
      
      return {
        id: meeting.id,
        zoom_meeting_id: meeting.zoom_meeting_id,
        join_url: meeting.join_url,
        start_url: isMentor ? meeting.start_url : null, // Only mentors get start URL
        meeting_password: meeting.meeting_password,
        scheduled_start_time: meeting.scheduled_start_time,
        scheduled_duration_minutes: meeting.scheduled_duration_minutes,
        meeting_status: meeting.meeting_status,
        waiting_room_enabled: meeting.waiting_room_enabled,
        booking: {
          id: meeting.booking.id,
          session_topic: meeting.booking.session_topic,
          student_message: meeting.booking.student_message,
          mentor_notes: isMentor ? meeting.booking.mentor_notes : null,
          student: {
            id: meeting.booking.student.id,
            name: meeting.booking.student.name,
            email: meeting.booking.student.email
          },
          mentor: {
            id: meeting.booking.mentor.id,
            name: meeting.booking.mentor.name,
            email: meeting.booking.mentor.email
          },
          session: meeting.booking.session
        }
      };
    } catch (error) {
      console.error('Error getting meeting details:', error);
      throw error;
    }
  }

  /**
   * Cancel a meeting
   */
  async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
    try {
      // Get meeting details
      const { data: meeting, error } = await supabase
        .from('zoom_meetings')
        .select('zoom_meeting_id, booking_id')
        .eq('id', meetingId)
        .single();

      if (error || !meeting) {
        throw new Error('Meeting not found');
      }

      // Cancel meeting in Zoom
      await this.makeZoomRequest(`/meetings/${meeting.zoom_meeting_id}`, {
        method: 'DELETE'
      });

      // Update meeting status
      await this.updateMeetingStatus(meetingId, 'cancelled');

      // Update booking status
      await supabase
        .from('session_bookings')
        .update({ 
          booking_status: 'cancelled',
          cancellation_reason: reason 
        })
        .eq('id', meeting.booking_id);

      // TODO: Process refund if applicable
      // TODO: Send cancellation notifications

    } catch (error) {
      console.error('Error cancelling meeting:', error);
      throw error;
    }
  }

  /**
   * Handle Zoom webhooks
   */
  async handleWebhook(payload: any, signature: string): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const { event, payload: eventPayload } = payload;

      switch (event) {
        case 'meeting.started':
          await this.handleMeetingStarted(eventPayload);
          break;
        case 'meeting.ended':
          await this.handleMeetingEnded(eventPayload);
          break;
        case 'meeting.participant_joined':
          await this.handleParticipantJoined(eventPayload);
          break;
        case 'meeting.participant_left':
          await this.handleParticipantLeft(eventPayload);
          break;
        case 'recording.completed':
          await this.handleRecordingCompleted(eventPayload);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      console.error('Error handling Zoom webhook:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private generateMeetingPassword(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async createParticipantRecords(meetingId: string, booking: any): Promise<void> {
    const participants = [
      {
        meeting_id: meetingId,
        user_id: booking.mentor_id,
        display_name: booking.mentor.name,
        email: booking.mentor.email,
        role: 'host'
      },
      {
        meeting_id: meetingId,
        user_id: booking.student_id,
        display_name: booking.student.name,
        email: booking.student.email,
        role: 'attendee'
      }
    ];

    const { error } = await supabase
      .from('meeting_participants')
      .insert(participants);

    if (error) {
      console.error('Error creating participant records:', error);
    }
  }

  private async scheduleNotifications(bookingId: string, booking: any): Promise<void> {
    const sessionTime = new Date(booking.session.start_time);
    const notifications = [
      {
        booking_id: bookingId,
        recipient_id: booking.student_id,
        notification_type: 'booking_confirmation',
        title: 'Session Confirmed',
        message: `Your mentorship session with ${booking.mentor.name} has been confirmed for ${sessionTime.toLocaleString()}.`,
        scheduled_for: new Date().toISOString()
      },
      {
        booking_id: bookingId,
        recipient_id: booking.mentor_id,
        notification_type: 'booking_confirmation',
        title: 'New Session Booked',
        message: `${booking.student.name} has booked a session with you for ${sessionTime.toLocaleString()}.`,
        scheduled_for: new Date().toISOString()
      },
      // 24-hour reminder
      {
        booking_id: bookingId,
        recipient_id: booking.student_id,
        notification_type: 'meeting_reminder',
        title: 'Session Tomorrow',
        message: `Reminder: Your mentorship session with ${booking.mentor.name} is tomorrow at ${sessionTime.toLocaleString()}.`,
        scheduled_for: new Date(sessionTime.getTime() - 24 * 60 * 60 * 1000).toISOString()
      },
      // 1-hour reminder
      {
        booking_id: bookingId,
        recipient_id: booking.student_id,
        notification_type: 'meeting_reminder',
        title: 'Session Starting Soon',
        message: `Your mentorship session with ${booking.mentor.name} starts in 1 hour. Join link will be available in your dashboard.`,
        scheduled_for: new Date(sessionTime.getTime() - 60 * 60 * 1000).toISOString()
      }
    ];

    const { error } = await supabase
      .from('meeting_notifications')
      .insert(notifications);

    if (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  private async handleMeetingStarted(payload: any): Promise<void> {
    const { data: meeting } = await supabase
      .from('zoom_meetings')
      .select('id')
      .eq('zoom_meeting_id', payload.object.id.toString())
      .single();

    if (meeting) {
      await this.updateMeetingStatus(meeting.id, 'started');
    }
  }

  private async handleMeetingEnded(payload: any): Promise<void> {
    const { data: meeting } = await supabase
      .from('zoom_meetings')
      .select('id')
      .eq('zoom_meeting_id', payload.object.id.toString())
      .single();

    if (meeting) {
      await this.updateMeetingStatus(meeting.id, 'ended');
    }
  }

  private async handleParticipantJoined(payload: any): Promise<void> {
    const { data: meeting } = await supabase
      .from('zoom_meetings')
      .select('id')
      .eq('zoom_meeting_id', payload.object.id.toString())
      .single();

    if (meeting) {
      await supabase
        .from('meeting_participants')
        .update({
          zoom_participant_id: payload.object.participant.id,
          joined_at: new Date().toISOString(),
          attendance_status: 'joined'
        })
        .eq('meeting_id', meeting.id)
        .eq('email', payload.object.participant.email);
    }
  }

  private async handleParticipantLeft(payload: any): Promise<void> {
    const { data: meeting } = await supabase
      .from('zoom_meetings')
      .select('id')
      .eq('zoom_meeting_id', payload.object.id.toString())
      .single();

    if (meeting) {
      const leftAt = new Date();
      
      // Get participant join time to calculate duration
      const { data: participant } = await supabase
        .from('meeting_participants')
        .select('joined_at')
        .eq('meeting_id', meeting.id)
        .eq('zoom_participant_id', payload.object.participant.id)
        .single();

      let duration = null;
      if (participant?.joined_at) {
        const joinedAt = new Date(participant.joined_at);
        duration = Math.round((leftAt.getTime() - joinedAt.getTime()) / (1000 * 60));
      }

      await supabase
        .from('meeting_participants')
        .update({
          left_at: leftAt.toISOString(),
          duration_minutes: duration,
          attendance_status: 'left'
        })
        .eq('meeting_id', meeting.id)
        .eq('zoom_participant_id', payload.object.participant.id);
    }
  }

  private async handleRecordingCompleted(payload: any): Promise<void> {
    const { data: meeting } = await supabase
      .from('zoom_meetings')
      .select('id')
      .eq('zoom_meeting_id', payload.object.id.toString())
      .single();

    if (meeting && payload.object.recording_files?.length > 0) {
      const recordingFile = payload.object.recording_files[0];
      
      await supabase
        .from('zoom_meetings')
        .update({
          recording_url: recordingFile.play_url,
          recording_password: recordingFile.password
        })
        .eq('id', meeting.id);
    }
  }
}

export const zoomService = new ZoomService();