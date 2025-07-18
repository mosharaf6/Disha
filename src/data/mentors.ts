import { Mentor } from '../types';

export const mentors: Mentor[] = [
  {
    id: '1',
    name: 'Rashida Ahmed',
    photo: 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=300',
    university: 'University of Toronto',
    country: 'Canada',
    location: 'Toronto, ON',
    subject: 'Computer Science',
    bio: 'PhD student in Machine Learning at UofT. Previously worked at Google. Passionate about helping Bangladeshi students navigate tech careers abroad.',
    experience: '3 years mentoring',
    rating: 4.9,
    totalSessions: 127,
    languages: ['Bengali', 'English'],
    availability: 'Available'
  },
  {
    id: '2',
    name: 'Karim Hassan',
    photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
    university: 'MIT',
    country: 'USA',
    location: 'Cambridge, MA',
    subject: 'Electrical Engineering',
    bio: 'Masters student at MIT studying renewable energy systems. Love sharing insights about US university applications and engineering programs.',
    experience: '2 years mentoring',
    rating: 4.8,
    totalSessions: 89,
    languages: ['Bengali', 'English'],
    availability: 'Available'
  },
  {
    id: '3',
    name: 'Fatima Khan',
    photo: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300',
    university: 'Oxford University',
    country: 'UK',
    location: 'Oxford, England',
    subject: 'Medicine',
    bio: 'Medical student at Oxford. Specializing in global health. Happy to guide students interested in healthcare and medical school applications.',
    experience: '1 year mentoring',
    rating: 4.7,
    totalSessions: 45,
    languages: ['Bengali', 'English'],
    availability: 'Busy'
  },
  {
    id: '4',
    name: 'Abdullah Rahman',
    photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
    university: 'University of Melbourne',
    country: 'Australia',
    location: 'Melbourne, VIC',
    subject: 'Business Administration',
    bio: 'MBA student and entrepreneur. Founded a startup in fintech. Experienced in business strategy, entrepreneurship, and Australian education system.',
    experience: '4 years mentoring',
    rating: 4.9,
    totalSessions: 203,
    languages: ['Bengali', 'English'],
    availability: 'Available'
  },
  {
    id: '5',
    name: 'Nadia Sultana',
    photo: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=300',
    university: 'ETH Zurich',
    country: 'Switzerland',
    location: 'Zurich, Switzerland',
    subject: 'Data Science',
    bio: 'PhD researcher in AI and Data Science. Previously at Microsoft Research. Passionate about helping women in STEM and research opportunities.',
    experience: '2 years mentoring',
    rating: 4.8,
    totalSessions: 76,
    languages: ['Bengali', 'English', 'German'],
    availability: 'Available'
  },
  {
    id: '6',
    name: 'Mahbub Alam',
    photo: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
    university: 'University of British Columbia',
    country: 'Canada',
    location: 'Vancouver, BC',
    subject: 'Environmental Science',
    bio: 'Masters in Environmental Engineering. Working on climate change research. Love helping students interested in sustainability and environmental careers.',
    experience: '1 year mentoring',
    rating: 4.6,
    totalSessions: 34,
    languages: ['Bengali', 'English'],
    availability: 'Available'
  }
];

export const countries = [...new Set(mentors.map(m => m.country))];
export const universities = [...new Set(mentors.map(m => m.university))];
export const subjects = [...new Set(mentors.map(m => m.subject))];