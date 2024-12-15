import { CalorieData } from '../types/CalorieData';
import { LogData } from '../types/LogData';
// Existing dummy data (if any)
export const dummyData: CalorieData[] = [
  { activity: 'run', date: '2024-11-01', calories: 2000 },
  { activity: 'walk', date: '2024-11-02', calories: 1800 },
  { activity: 'sprint', date: '2024-11-03', calories: 2200 },
];

export const dummyLogData: LogData[] = [
  { 
    email: 'uwilson@scott.com', 
    startDate: '2024-10-23', 
    endDate: '2024-10-30', 
    avgCalBurnt: 1280,
    avgCalConsumed: 2180,
    avgProteinGrams: 44,
    avgCarbGrams: 30
  },
  { 
    email: 'uwilson@scott.com', 
    startDate: '2024-10-30', 
    endDate: '2024-11-6', 
    avgCalBurnt: 1580,
    avgCalConsumed: 100,
    avgProteinGrams: 64,
    avgCarbGrams: 20
  }
]

// Fetch weekly activity data from the backend
export const fetchWeeklyActivities = async (email: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/weekly/activities?email=${email}`);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data; // Returns an array of activities and calories burned
    } else {
      throw new Error(data.message || 'Failed to fetch weekly activities');
    }
  } catch (error) {
    console.error('Error fetching weekly activities:', error);
    return [];
  }
};
export const fetchWeeklyActivitiesCalories = async (email: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/weekly/activitiescalories?email=${email}`);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data; // Returns an array of activities and calories burned
    } else {
      throw new Error(data.message || 'Failed to fetch weekly activities');
    }
  } catch (error) {
    console.error('Error fetching weekly activities:', error);
    return [];
  }
};

export const fetchTodayCalories = async (email: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/daily/calories?email=${email}`);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data; // Returns an array of activities and calories burned
    } else {
      throw new Error(data.message || 'Failed to fetch today calories');
    }
  } catch (error) {
    console.error('Error fetching today calories:', error);
    return [];
  }
};
export const fetchUserInfo = async (email: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000//user?email=${email}`);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data; // Returns an array of activities and calories burned
    } else {
      throw new Error(data.message || 'Failed to fetch user info');
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    return [];
  }
};





export const fetchAllLogs = async (email: string)  => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/saved_logs?email=${email}`);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data; // Returns an array of activities and calories burned
    } else {
      throw new Error(data.message || 'Failed to fetch weekly activities');
    }
  } catch (error) {
    console.error('Error fetching weekly activities:', error);
    return [];
  }
};