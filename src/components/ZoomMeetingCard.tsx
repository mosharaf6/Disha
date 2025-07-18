import React, { useState } from 'react';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  X, 
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useZoomMeetings } from '../hooks/useZoomMeetings';

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

interface ZoomMeetingCardProps {
  meeting: ZoomMeeting;
  currentUserId: string;
  onJoinMeeting?: (meeting: ZoomMeeting, isHost: boolean) => void;
  onCancelMeeting?: (meetingId: string, reason?: string) => void;
}

const ZoomMeetingCard: React.FC<ZoomMeetingCardProps> = ({
  meeting,
  currentUserId,
  onJoinMeeting,
  onCancelMeeting
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isHost = meeting.booking.mentor.id === currentUserId;
  const isStudent = meeting.booking.student.id === currentUserId;
  const otherParticipant = isHost ? meeting.booking.student : meeting.booking.mentor;

  const meetingTime = new Date(meeting.scheduled_start_time);
  const meetingEndTime = addMinutes(meetingTime, meeting.scheduled_duration_minutes);
  const now = new Date();

  // Determine meeting state
  const isUpcoming = isBefore(now, meetingTime);
  const isActive = meeting.meeting_status === 'started' || 
    (isAfter(now, meetingTime) && isBefore(now, meetingEndTime) && meeting.meeting_status === 'scheduled');
  const isCompleted = meeting.meeting_status === 'ended' || isAfter(now, meetingEndTime);
  const isCancelled = meeting.meeting_status === 'cancelled';

  // Can join 15 minutes before scheduled time
  const canJoinEarly = isBefore(now, meetingTime) && 
    isAfter(now, addMinutes(meetingTime, -15)) && 
    meeting.meeting_status === 'scheduled';

  const canJoin = isActive || canJoinEarly;
  const canCancel = !isCompleted && !isCancelled;

  const getStatusColor = () => {
    if (isCancelled) return 'bg-red-100 text-red-800';
    if (isCompleted) return 'bg-gray-100 text-gray-800';
    if (isActive) return 'bg-green-100 text-green-800';
    if (canJoinEarly) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = () => {
    if (isCancelled) return 'Cancelled';
    if (isCompleted) return 'Completed';
    if (isActive) return 'Active';
    if (canJoinEarly) return 'Ready to Join';
    return 'Scheduled';
  };

  const handleJoinMeeting = () => {
    if (onJoinMeeting) {
      onJoinMeeting(meeting, isHost);
    } else {
      // Default join behavior
      const url = isHost && meeting.start_url ? meeting.start_url : meeting.join_url;
      window.open(url, '_blank', 'width=1200,height=800');
    }
  };

  const handleCancelMeeting = async () => {
    if (!onCancelMeeting) return;
    
    setIsProcessing(true);
    try {
      await onCancelMeeting(meeting.id, cancelReason || undefined);
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling meeting:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                  {meeting.booking.session.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  with {otherParticipant.name}
                </p>
              </div>
            </div>
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{format(meetingTime, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {format(meetingTime, 'h:mm a')} - {format(meetingEndTime, 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{isHost ? 'Host' : 'Attendee'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2 text-center">💰</span>
              <span>${(meeting.booking.session.price_cents / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Topic */}
          {meeting.booking.session_topic && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-700">
                <strong>Topic:</strong> {meeting.booking.session_topic}
              </p>
            </div>
          )}
        </div>

        {/* Meeting Info */}
        <div className="p-4 md:p-6">
          {/* Meeting Password */}
          {meeting.meeting_password && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-yellow-800">
                    Meeting Password Required
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Password: <code className="bg-yellow-100 px-1 rounded">{meeting.meeting_password}</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Waiting Room Notice */}
          {meeting.waiting_room_enabled && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                <p className="text-xs md:text-sm text-blue-800">
                  Waiting room is enabled. {isHost ? 'You can admit participants when they join.' : 'Please wait to be admitted by the host.'}
                </p>
              </div>
            </div>
          )}

          {/* Student Message */}
          {meeting.booking.student_message && isHost && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-700">
                <strong>Student's message:</strong> {meeting.booking.student_message}
              </p>
            </div>
          )}

          {/* Mentor Notes */}
          {meeting.booking.mentor_notes && isStudent && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-700">
                <strong>Mentor's notes:</strong> {meeting.booking.mentor_notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canJoin && (
              <button
                onClick={handleJoinMeeting}
                className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors touch-manipulation min-h-[44px]"
              >
                <Play className="w-4 h-4 mr-2" />
                {isHost ? 'Start Meeting' : 'Join Meeting'}
              </button>
            )}

            {!canJoin && !isCompleted && !isCancelled && (
              <button
                disabled
                className="flex items-center justify-center bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed min-h-[44px]"
              >
                <Clock className="w-4 h-4 mr-2" />
                {isUpcoming ? 'Starts Soon' : 'Meeting Ended'}
              </button>
            )}

            {isCompleted && (
              <div className="flex items-center justify-center text-green-600 px-4 py-3">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">Session Completed</span>
              </div>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center justify-center border-2 border-red-300 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors touch-manipulation min-h-[44px]"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            )}

            {/* External Link */}
            <button
              onClick={() => window.open(meeting.join_url, '_blank')}
              className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Browser
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Meeting
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this meeting? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Let the other participant know why you're cancelling..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={isProcessing}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Meeting
              </button>
              <button
                onClick={handleCancelMeeting}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ZoomMeetingCard;