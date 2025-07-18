import { Request, Response, NextFunction } from 'express';
import { zoomService } from '../services/zoomService';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

// Request validation schemas
const createMeetingSchema = z.object({
  bookingId: z.string().uuid(),
  mentorZoomUserId: z.string().min(1)
});

const updateMeetingStatusSchema = z.object({
  status: z.enum(['started', 'ended', 'cancelled'])
});

const cancelMeetingSchema = z.object({
  reason: z.string().optional()
});

// Middleware for authentication
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware for request validation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// Error handling middleware
const handleControllerError = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Controller error:', error);
  
  if (error.message.includes('not found')) {
    return res.status(404).json({ error: error.message });
  }
  
  if (error.message.includes('Unauthorized')) {
    return res.status(403).json({ error: error.message });
  }
  
  if (error.message.includes('Zoom API error')) {
    return res.status(502).json({ error: 'External service error', details: error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};

/**
 * POST /api/meetings
 * Create a new Zoom meeting for a booking
 */
export const createMeeting = [
  authenticateUser,
  validateRequest(createMeetingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookingId, mentorZoomUserId } = req.validatedData;
      const userId = req.user.id;

      // Verify user is authorized to create meeting for this booking
      const { data: booking, error: bookingError } = await supabase
        .from('session_bookings')
        .select('mentor_id, student_id, booking_status')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Only mentor or student can create meeting
      if (booking.mentor_id !== userId && booking.student_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized to create meeting for this booking' });
      }

      // Check if booking is confirmed and paid
      if (!['confirmed', 'paid'].includes(booking.booking_status)) {
        return res.status(400).json({ error: 'Booking must be confirmed and paid before creating meeting' });
      }

      // Check if meeting already exists
      const { data: existingMeeting } = await supabase
        .from('zoom_meetings')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (existingMeeting) {
        return res.status(409).json({ error: 'Meeting already exists for this booking' });
      }

      const meetingId = await zoomService.createMeeting(bookingId, mentorZoomUserId);

      res.status(201).json({
        success: true,
        data: {
          meetingId,
          message: 'Meeting created successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  },
  handleControllerError
];

/**
 * GET /api/meetings/:id
 * Get meeting details for authorized users
 */
export const getMeeting = [
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params.id;
      const userId = req.user.id;

      if (!meetingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meetingId)) {
        return res.status(400).json({ error: 'Invalid meeting ID format' });
      }

      const meetingDetails = await zoomService.getMeetingDetails(meetingId, userId);

      res.json({
        success: true,
        data: meetingDetails
      });
    } catch (error) {
      next(error);
    }
  },
  handleControllerError
];

/**
 * PUT /api/meetings/:id/status
 * Update meeting status
 */
export const updateMeetingStatus = [
  authenticateUser,
  validateRequest(updateMeetingStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params.id;
      const { status } = req.validatedData;
      const userId = req.user.id;

      if (!meetingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meetingId)) {
        return res.status(400).json({ error: 'Invalid meeting ID format' });
      }

      // Verify user is authorized to update this meeting
      const { data: meeting, error } = await supabase
        .from('zoom_meetings')
        .select(`
          id,
          booking:session_bookings(mentor_id, student_id)
        `)
        .eq('id', meetingId)
        .single();

      if (error || !meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const isAuthorized = meeting.booking.mentor_id === userId || meeting.booking.student_id === userId;
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized to update this meeting' });
      }

      await zoomService.updateMeetingStatus(meetingId, status);

      res.json({
        success: true,
        data: {
          message: `Meeting status updated to ${status}`
        }
      });
    } catch (error) {
      next(error);
    }
  },
  handleControllerError
];

/**
 * DELETE /api/meetings/:id
 * Cancel a meeting
 */
export const cancelMeeting = [
  authenticateUser,
  validateRequest(cancelMeetingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params.id;
      const { reason } = req.validatedData;
      const userId = req.user.id;

      if (!meetingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meetingId)) {
        return res.status(400).json({ error: 'Invalid meeting ID format' });
      }

      // Verify user is authorized to cancel this meeting
      const { data: meeting, error } = await supabase
        .from('zoom_meetings')
        .select(`
          id,
          meeting_status,
          booking:session_bookings(mentor_id, student_id)
        `)
        .eq('id', meetingId)
        .single();

      if (error || !meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const isAuthorized = meeting.booking.mentor_id === userId || meeting.booking.student_id === userId;
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized to cancel this meeting' });
      }

      if (meeting.meeting_status === 'cancelled') {
        return res.status(400).json({ error: 'Meeting is already cancelled' });
      }

      if (meeting.meeting_status === 'ended') {
        return res.status(400).json({ error: 'Cannot cancel a completed meeting' });
      }

      await zoomService.cancelMeeting(meetingId, reason);

      res.json({
        success: true,
        data: {
          message: 'Meeting cancelled successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  },
  handleControllerError
];

/**
 * POST /api/webhooks/zoom
 * Handle Zoom webhooks
 */
export const handleZoomWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-zm-signature'] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing webhook signature' });
    }

    await zoomService.handleWebhook(payload, signature);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * GET /api/meetings/booking/:bookingId
 * Get meeting by booking ID
 */
export const getMeetingByBooking = [
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user.id;

      if (!bookingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)) {
        return res.status(400).json({ error: 'Invalid booking ID format' });
      }

      // Verify user is authorized to access this booking
      const { data: booking, error: bookingError } = await supabase
        .from('session_bookings')
        .select('mentor_id, student_id')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const isAuthorized = booking.mentor_id === userId || booking.student_id === userId;
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized to access this booking' });
      }

      // Get meeting details
      const { data: meeting, error: meetingError } = await supabase
        .from('zoom_meetings')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (meetingError || !meeting) {
        return res.status(404).json({ error: 'Meeting not found for this booking' });
      }

      const meetingDetails = await zoomService.getMeetingDetails(meeting.id, userId);

      res.json({
        success: true,
        data: meetingDetails
      });
    } catch (error) {
      next(error);
    }
  },
  handleControllerError
];

// Export route handlers for Express router
export const zoomRoutes = {
  createMeeting,
  getMeeting,
  updateMeetingStatus,
  cancelMeeting,
  handleZoomWebhook,
  getMeetingByBooking
};