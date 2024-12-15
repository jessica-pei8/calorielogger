import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import CalorieChart from './components/CalorieChart';
import CalorieForm from './components/CalorieForm';
import WeeklyActivitiesChart from './components/WeeklyActivitiesChart';
import { fetchWeeklyActivities } from './utils/data'; // Ensure fetch logic is in `data.ts`
import { CalorieData } from './types/CalorieData';
import { LogData } from './types/LogData';
import { dummyData, dummyLogData } from './utils/data';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LockedRoute from './components/LockedRoute';
import Header from './components/Header';
import RecordDemo from './components/RecordDemo';
import SavedLogs from './components/SavedLogs';
import RecordsPage from './components/RecordsPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/NavBar';
import MealsPage from './components/MealsPage';
import Logger from './components/Visualizations';
import ScheduleView from './components/SchedulePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <AuthRedirector />
        <Routes>
          <Route path="/" element={ <div><Navbar /> <h1>Welcome to Calorie Tracker</h1></div>} />
          <Route
            path="/chart"
            element={
              <LockedRoute>
                <Logger />
              </LockedRoute>
            }
          />
          <Route path="/demo" element={<RecordDemo />} />
          <Route
            path="/records"
            element={
              <LockedRoute>
                <RecordsPage />
              </LockedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <LockedRoute>
                <MealsPage />
              </LockedRoute>
            }
          />
          <Route
            path="/complete-profile"
            element={
              <LockedRoute>
                <ProfilePage />
              </LockedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <LockedRoute>
                <ScheduleView />
              </LockedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// const Logger: React.FC = () => {
//   const [data, setData] = React.useState<CalorieData[]>(dummyData);
//   const [logData, setLogData] = React.useState<LogData[]>()
//   const [weeklyActivities, setWeeklyActivities] = React.useState<{ activity: string; cals_burnt: number }[]>([]);
//   const email = 'jwalker@gmail.com'; // Replace with actual logged-in user email

//   // Fetch weekly activity data when the component mounts
//   useEffect(() => {
//     const loadWeeklyActivities = async () => {
//       const activities = await fetchWeeklyActivities(email);
//       setWeeklyActivities(activities);
//     };

//     loadWeeklyActivities();
//   }, [email]);

//   const addData = (newData: CalorieData) => {
//     setData([...data, newData]);
//   };

//   return (
//     <>
//       <h1>Logger</h1>
//       <CalorieForm onAdd={addData} />
//       <CalorieChart data={data} />
//       <h2>Weekly Activities</h2>
//       <WeeklyActivitiesChart data={weeklyActivities} />
//       <SavedLogs email={email}></SavedLogs>
//     </>
//   );
// };

const AuthRedirector: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = window.location.pathname;

  useEffect(() => {
      const checkUserCompleteness = async () => {
        if (user) {
          try {
            const response = await fetch(`http://127.0.0.1:5000/user?email=${user.email}`);
            const data = await response.json();
  
            if (!data.success || !data.complete) {
              navigate('/complete-profile', { replace: true });
            } else if (location === '/') {
              navigate('/chart', { replace: true });
            }
          } catch (error) {
            console.error('Error checking user completeness:', error);
          }
        }
      };
  
      checkUserCompleteness();
  }, [user, navigate, location]);
  return null;
};
export default App;