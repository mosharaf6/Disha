import React from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Star,
  DollarSign,
  Activity
} from 'lucide-react';

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

interface StatsCardsProps {
  stats: PlatformStats | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Mentors',
      value: stats.total_mentors.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Students',
      value: stats.total_mentees.toLocaleString(),
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Applications',
      value: stats.pending_applications.toLocaleString(),
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '-5%',
      changeType: 'negative' as const
    },
    {
      title: 'Completed Sessions',
      value: stats.completed_sessions.toLocaleString(),
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+23%',
      changeType: 'positive' as const
    },
    {
      title: 'Approval Rate',
      value: `${stats.approval_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '+2.1%',
      changeType: 'positive' as const
    },
    {
      title: 'Average Rating',
      value: stats.average_rating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+0.2',
      changeType: 'positive' as const
    },
    {
      title: 'Monthly Growth',
      value: `${stats.monthly_growth.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+1.5%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Calls',
      value: stats.active_calls.toLocaleString(),
      icon: Activity,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: 'Live',
      changeType: 'neutral' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600' 
                      : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;