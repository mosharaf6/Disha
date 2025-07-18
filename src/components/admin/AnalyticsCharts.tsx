import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Globe
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

interface AnalyticsChartsProps {
  stats: PlatformStats | null;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Mock data for charts - in a real implementation, you'd fetch this from your analytics API
  const monthlyData = [
    { month: 'Jan', mentors: 120, students: 890, sessions: 45 },
    { month: 'Feb', mentors: 135, students: 950, sessions: 52 },
    { month: 'Mar', mentors: 142, students: 1020, sessions: 68 },
    { month: 'Apr', mentors: 148, students: 1150, sessions: 75 },
    { month: 'May', mentors: 156, students: 1247, sessions: 89 },
  ];

  const topCountries = [
    { country: 'Canada', mentors: 45, percentage: 28.8 },
    { country: 'USA', mentors: 38, percentage: 24.4 },
    { country: 'UK', mentors: 25, percentage: 16.0 },
    { country: 'Australia', mentors: 22, percentage: 14.1 },
    { country: 'Germany', mentors: 15, percentage: 9.6 },
    { country: 'Others', mentors: 11, percentage: 7.1 },
  ];

  const topSubjects = [
    { subject: 'Computer Science', count: 42, percentage: 26.9 },
    { subject: 'Business', count: 28, percentage: 17.9 },
    { subject: 'Engineering', count: 25, percentage: 16.0 },
    { subject: 'Medicine', count: 22, percentage: 14.1 },
    { subject: 'Data Science', count: 18, percentage: 11.5 },
    { subject: 'Others', count: 21, percentage: 13.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Growth Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Growth Trends
          </h3>
          <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>All time</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simple Bar Chart Representation */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Monthly Registrations</h4>
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-8 text-sm text-gray-600">{data.month}</div>
                  <div className="flex-1 mx-3">
                    <div className="flex space-x-1">
                      <div 
                        className="bg-blue-500 h-6 rounded-sm flex items-center justify-center text-white text-xs"
                        style={{ width: `${(data.mentors / 200) * 100}%`, minWidth: '20px' }}
                      >
                        {data.mentors}
                      </div>
                      <div 
                        className="bg-green-500 h-6 rounded-sm flex items-center justify-center text-white text-xs"
                        style={{ width: `${(data.students / 1500) * 100}%`, minWidth: '30px' }}
                      >
                        {data.students}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                <span>Mentors</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                <span>Students</span>
              </div>
            </div>
          </div>

          {/* Sessions Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Monthly Sessions</h4>
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-8 text-sm text-gray-600">{data.month}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 h-6 rounded-sm overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-sm flex items-center justify-center text-white text-xs"
                        style={{ width: `${(data.sessions / 100) * 100}%`, minWidth: '20px' }}
                      >
                        {data.sessions}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-600" />
            Mentors by Country
          </h3>
          <div className="space-y-4">
            {topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{country.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {country.mentors}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Popular Subjects
          </h3>
          <div className="space-y-4">
            {topSubjects.map((subject, index) => (
              <div key={subject.subject} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{subject.subject}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {subject.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {((stats.completed_sessions / stats.total_mentees) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Student Engagement Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(stats.completed_sessions / stats.total_mentors).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Sessions per Mentor</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.approval_rate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Application Approval Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.average_rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Session Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;