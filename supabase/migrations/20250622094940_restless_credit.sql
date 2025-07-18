/*
  # Initial Schema for Disha Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `role` (enum: mentor, learner)
      - `avatar_url` (text)
      - `university` (text, for mentors)
      - `country` (text, for mentors)
      - `subject` (text, for mentors)
      - `bio` (text)
      - `languages` (text array)
      - `experience` (text, for mentors)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `mentor_availability`
      - `id` (uuid, primary key)
      - `mentor_id` (uuid, references profiles)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `duration` (integer, minutes)
      - `is_booked` (boolean)
      - `created_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `learner_id` (uuid, references profiles)
      - `mentor_id` (uuid, references profiles)
      - `availability_slot_id` (uuid, references mentor_availability)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `status` (enum: pending, confirmed, completed, cancelled)
      - `video_call_link` (text)
      - `topic` (text)
      - `message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for mentors to manage their availability
    - Add policies for learners to view mentor data and create bookings
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('mentor', 'learner');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role user_role NOT NULL,
  avatar_url text,
  university text,
  country text,
  subject text,
  bio text,
  languages text[] DEFAULT '{}',
  experience text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mentor_availability table
CREATE TABLE IF NOT EXISTS mentor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration integer NOT NULL DEFAULT 60,
  is_booked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  availability_slot_id uuid NOT NULL REFERENCES mentor_availability(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status booking_status DEFAULT 'pending',
  video_call_link text,
  topic text,
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Mentor availability policies
CREATE POLICY "Anyone can view mentor availability"
  ON mentor_availability
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mentors can manage their availability"
  ON mentor_availability
  FOR ALL
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'mentor'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    learner_id = auth.uid() OR 
    mentor_id = auth.uid()
  );

CREATE POLICY "Learners can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    learner_id = auth.uid() AND
    learner_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'learner'
    )
  );

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    learner_id = auth.uid() OR 
    mentor_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_country ON profiles(country);
CREATE INDEX idx_profiles_subject ON profiles(subject);
CREATE INDEX idx_mentor_availability_mentor_id ON mentor_availability(mentor_id);
CREATE INDEX idx_mentor_availability_start_time ON mentor_availability(start_time);
CREATE INDEX idx_bookings_learner_id ON bookings(learner_id);
CREATE INDEX idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();