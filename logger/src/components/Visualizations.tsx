import React, { useState, useEffect, act } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from './NavBar';
import CalorieChart from './CalorieChart';
import CalorieForm from './CalorieForm';
import WeeklyActivitiesChart from './WeeklyActivitiesChart';
import { fetchWeeklyActivities, fetchWeeklyActivitiesCalories, fetchTodayCalories } from './../utils/data';
import { CalorieData } from './../types/CalorieData';
import WeeklyCalorieChart from './WeeklyCalorieChart';
import DailyCalorieChart from './DailyCalorieChart';
import SavedLogs from './SavedLogs';

const Logger: React.FC = () => {
  const { user } = useAuth(); // Fetch the signed-in user
  const [data, setData] = useState<CalorieData[]>([]); // Start with an empty array
  const [weeklyActivities, setWeeklyActivities] = useState<{activity: string; cals_burnt: number }[]>([]);
  const [weeklyCalorieActivities, setweeklyCalorieActivities] = useState<{date: string; total_calories: number }[]>([]);
  const [dailyCalories, setdailyCalories] = useState<{date: string; total_cals: number }[]>([]);

  // Fetch weekly activity data using the authenticated user's email
  useEffect(() => {
    const loadWeeklyActivities = async () => {
      if (user?.email) { // Ensure email is a non-null string
        try {
          const activities = await fetchWeeklyActivities(user.email);
          setWeeklyActivities(activities);
        } catch (error) {
          console.error('Failed to load weekly activities:', error);
        }
      }
    };
    const loadWeeklyActivitiesCalories = async () => {
        if (user?.email) { // Ensure email is a non-null string
          try {
            const activities = await fetchWeeklyActivitiesCalories(user.email);
            setweeklyCalorieActivities(activities);
          } catch (error) {
            console.error('Failed to load weekly activities:', error);
          }
        }
      };
      const loaddailyCalories = async () => {
        if (user?.email) { // Ensure email is a non-null string
          try {
            const activities = await fetchTodayCalories(user.email);
            console.log(activities); 
            setdailyCalories(activities);
          } catch (error) {
            console.error('Failed to load daily calories:', error);
          }
        }
      };
      loaddailyCalories(); 
    loadWeeklyActivities();
    loadWeeklyActivitiesCalories(); 
  }, [user]);

  const addData = (newData: CalorieData) => {
    setData((prevData) => [...prevData, newData]);
  };

  return user?.email ? (
    <>
      <Navbar />
      <h1>Logger</h1>
      <h2>Weekly Top Activities</h2>
      <WeeklyActivitiesChart data={weeklyActivities} />
      <h2>Weekly Activities Calories Burned</h2>
      <WeeklyCalorieChart data={weeklyCalorieActivities} />
      <h2>Calories Consumed VS Maintenance Calories</h2>
      <DailyCalorieChart data={dailyCalories}/>
      <SavedLogs email={user.email}></SavedLogs>
    </>
  ) : null;
};

export default Logger;
