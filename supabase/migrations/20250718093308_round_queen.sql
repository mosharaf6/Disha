/*
  # Zoom Integration System for Disha Platform

  1. New Tables
    - `mentor_sessions` - Mentor availability slots with duration options
    - `session_bookings` - Student booking records with payment tracking
    - `zoom_meetings` - Zoom meeting metadata and security settings
    - `meeting_participants` - Track meeting attendance and roles
    - `payment_transactions` - Payment processing records
    - `meeting_notifications` - Notification queue for reminders

  2. Security
    - Enable RLS on all new tables
    - Add policies for role-based access control
    - Implement time-based access restrictions

  3. Performance
    - Add indexes for frequently queried columns
    - Include composite indexes for complex queries
    - Set up proper foreign key constraints
*/

-- Create enum types for better data integrity
CREATE TYPE session_duration AS ENUM ('15', '30', '60');
CREATE TYPE booking_status_new AS ENUM ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refunded');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'started', 'ended', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'payment_success', 'meeting_reminder', 'meeting_started', 'meeting_ended');

-- Mentor Sessions Table (Enhanced availability management)
CREATE TABLE IF NOT EXISTS mentor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title varchar(255) DEFAULT 'Mentorship Session',
  description text,
  start_time timestamptz NOT NULL,
  duration session_duration NOT NULL DEFAULT '60',
  price_cents integer NOT NULL DEFAULT 0, -- Price in cents for precision
  currency varchar(3) DEFAULT 'USD',
  max_participants integer DEFAULT 1,
  is_recurring boolean DEFAULT false,
  recurrence_pattern jsonb, -- For future recurring sessions
  timezone varchar(50) DEFAULT 'UTC',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price_cents >= 0),
  CONSTRAINT valid_duration CHECK (duration IN ('15', '30', '60')),
  CONSTRAINT future_session CHECK (start_time > now())
);

-- Session Bookings Table (Enhanced booking management)
CREATE TABLE IF NOT EXISTS session_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES mentor_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Booking details
  booking_status booking_status_new DEFAULT 'pending',
  booked_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  
  -- Session metadata
  session_topic varchar(255),
  student_message text,
  mentor_notes text,
  
  -- Payment information
  total_amount_cents integer NOT NULL,
  currency varchar(3) DEFAULT 'USD',
  payment_intent_id varchar(255), -- Stripe payment intent ID
  
  -- Meeting preparation
  student_preparation_notes text,
  mentor_preparation_notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (total_amount_cents >= 0),
  CONSTRAINT no_self_booking CHECK (student_id != mentor_id)
);

-- Zoom Meetings Table (Meeting metadata and security)
CREATE TABLE IF NOT EXISTS zoom_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES session_bookings(id) ON DELETE CASCADE,
  
  -- Zoom meeting details
  zoom_meeting_id varchar(255) NOT NULL UNIQUE,
  zoom_meeting_uuid varchar(255),
  host_id varchar(255) NOT NULL, -- Zoom user ID of the host
  
  -- Meeting URLs and access
  join_url text NOT NULL,
  start_url text NOT NULL, -- Only for host
  host_join_url text NOT NULL,
  
  -- Security settings
  meeting_password varchar(50),
  waiting_room_enabled boolean DEFAULT true,
  require_registration boolean DEFAULT false,
  mute_participants_on_entry boolean DEFAULT true,
  
  -- Meeting configuration
  scheduled_start_time timestamptz NOT NULL,
  scheduled_duration_minutes integer NOT NULL,
  timezone varchar(50) DEFAULT 'UTC',
  
  -- Meeting status and lifecycle
  meeting_status meeting_status DEFAULT 'scheduled',
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  actual_duration_minutes integer,
  
  -- Recording settings
  auto_recording boolean DEFAULT false,
  recording_url text,
  recording_password varchar(50),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_duration_minutes CHECK (scheduled_duration_minutes > 0),
  CONSTRAINT valid_actual_duration CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes >= 0)
);

-- Meeting Participants Table (Track attendance and engagement)
CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES zoom_meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Participant details
  zoom_participant_id varchar(255),
  display_name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'attendee', -- host, co-host, attendee
  
  -- Attendance tracking
  joined_at timestamptz,
  left_at timestamptz,
  duration_minutes integer,
  
  -- Engagement metrics
  camera_on_duration_minutes integer DEFAULT 0,
  microphone_on_duration_minutes integer DEFAULT 0,
  screen_share_duration_minutes integer DEFAULT 0,
  
  -- Status
  attendance_status varchar(50) DEFAULT 'invited', -- invited, joined, left, no_show
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  CONSTRAINT valid_engagement_metrics CHECK (
    camera_on_duration_minutes >= 0 AND
    microphone_on_duration_minutes >= 0 AND
    screen_share_duration_minutes >= 0
  )
);

-- Payment Transactions Table (Comprehensive payment tracking)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES session_bookings(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_intent_id varchar(255) NOT NULL UNIQUE,
  payment_method_id varchar(255),
  amount_cents integer NOT NULL,
  currency varchar(3) DEFAULT 'USD',
  
  -- Payment status and lifecycle
  payment_status payment_status DEFAULT 'pending',
  processed_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  
  -- Payment metadata
  payment_provider varchar(50) DEFAULT 'stripe',
  provider_transaction_id varchar(255),
  provider_fee_cents integer DEFAULT 0,
  platform_fee_cents integer DEFAULT 0,
  mentor_payout_cents integer,
  
  -- Failure and refund details
  failure_reason text,
  failure_code varchar(100),
  refund_reason text,
  refund_amount_cents integer,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_amounts CHECK (
    amount_cents > 0 AND
    provider_fee_cents >= 0 AND
    platform_fee_cents >= 0 AND
    (mentor_payout_cents IS NULL OR mentor_payout_cents >= 0) AND
    (refund_amount_cents IS NULL OR refund_amount_cents <= amount_cents)
  )
);

-- Meeting Notifications Table (Notification queue and tracking)
CREATE TABLE IF NOT EXISTS meeting_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES session_bookings(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification details
  notification_type notification_type NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  
  -- Delivery settings
  send_email boolean DEFAULT true,
  send_sms boolean DEFAULT false,
  send_push boolean DEFAULT true,
  
  -- Scheduling
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  
  -- Status tracking
  delivery_status varchar(50) DEFAULT 'pending', -- pending, sent, delivered, failed
  delivery_attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  failure_reason text,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_delivery_attempts CHECK (delivery_attempts >= 0),
  CONSTRAINT valid_scheduled_time CHECK (scheduled_for >= created_at)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_start_time ON mentor_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_available ON mentor_sessions(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_time ON mentor_sessions(mentor_id, start_time);

CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_student_id ON session_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_mentor_id ON session_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON session_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_session_bookings_booked_at ON session_bookings(booked_at);

CREATE INDEX IF NOT EXISTS idx_zoom_meetings_booking_id ON zoom_meetings(booking_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_zoom_id ON zoom_meetings(zoom_meeting_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_status ON zoom_meetings(meeting_status);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_start_time ON zoom_meetings(scheduled_start_time);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_intent_id ON payment_transactions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);

CREATE INDEX IF NOT EXISTS idx_meeting_notifications_booking_id ON meeting_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notifications_recipient_id ON meeting_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notifications_scheduled_for ON meeting_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_meeting_notifications_status ON meeting_notifications(delivery_status);

-- Enable Row Level Security
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_sessions
CREATE POLICY "Mentors can manage their own sessions"
  ON mentor_sessions
  FOR ALL
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Students can view available sessions"
  ON mentor_sessions
  FOR SELECT
  TO authenticated
  USING (is_available = true AND start_time > now());

-- RLS Policies for session_bookings
CREATE POLICY "Users can view their own bookings"
  ON session_bookings
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Students can create bookings"
  ON session_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Participants can update their bookings"
  ON session_bookings
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR mentor_id = auth.uid());

-- RLS Policies for zoom_meetings
CREATE POLICY "Meeting participants can view meeting details"
  ON zoom_meetings
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM session_bookings 
      WHERE student_id = auth.uid() OR mentor_id = auth.uid()
    )
  );

CREATE POLICY "System can manage zoom meetings"
  ON zoom_meetings
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for meeting_participants
CREATE POLICY "Users can view their participation records"
  ON meeting_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Meeting hosts can view all participants"
  ON meeting_participants
  FOR SELECT
  TO authenticated
  USING (
    meeting_id IN (
      SELECT zm.id FROM zoom_meetings zm
      JOIN session_bookings sb ON zm.booking_id = sb.id
      WHERE sb.mentor_id = auth.uid()
    )
  );

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM session_bookings 
      WHERE student_id = auth.uid() OR mentor_id = auth.uid()
    )
  );

-- RLS Policies for meeting_notifications
CREATE POLICY "Users can view their notifications"
  ON meeting_notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_mentor_sessions_updated_at
  BEFORE UPDATE ON mentor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_bookings_updated_at
  BEFORE UPDATE ON session_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zoom_meetings_updated_at
  BEFORE UPDATE ON zoom_meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_participants_updated_at
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_notifications_updated_at
  BEFORE UPDATE ON meeting_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO mentor_sessions (mentor_id, title, description, start_time, duration, price_cents, currency) 
SELECT 
  p.id,
  'Career Guidance Session',
  'Get personalized advice on your career path and study abroad journey',
  now() + interval '1 day' + (random() * interval '7 days'),
  (ARRAY['15', '30', '60'])[floor(random() * 3 + 1)]::session_duration,
  (ARRAY[2500, 5000, 10000])[floor(random() * 3 + 1)], -- $25, $50, $100
  'USD'
FROM profiles p 
WHERE p.role = 'mentor' 
LIMIT 5;