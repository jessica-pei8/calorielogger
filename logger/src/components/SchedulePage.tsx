import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

import Navbar from './NavBar';
import Schedule from './Schedule';
import ScheduleExporter from './ExportScheduleButton'

const ScheduleView: React.FC = () => {
  function numberToTime(number: number): string {
    return number.toString().padStart(2, '0') + ':00';
  }

    const { user } = useAuth(); // Fetch the signed-in user
    const [schedule, setSchedule] = useState<{ start_time: number; end_time: number; day: string; activity: string }[]>([]); // this is for the visual schedule
    const [activity, setActivity] = useState('');
    const [day, setDay] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    
    const [isVisible, setIsVisible] = useState(false); // State to track visibility
    const [isEditing, setIsEditing] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<any>(null);


    const fetchSchedule = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/schedule?email=${user?.email}`);
        const data = await response.json();
        if (data.success) {
          setSchedule(data.data);
        } else {
          alert(data.message || 'Failed to fetch records');
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    
    const addSchedule = async (e: React.FormEvent) => {
      e.preventDefault(); 
      try {
        const response = await fetch(`http://127.0.0.1:5000/schedule`, { // need to edit this to connect to schedule db
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: user?.email, 
            Activity: activity,
            Day: day,
            StartTime: startTime,
            EndTime: endTime,
          }),
        });
        const data = await response.json();
        if (data.success) {
          alert('Schedule added successfully!');
          setActivity('');
          setDay('');
          setStartTime('')
          setEndTime('')

          // const updatedSchedule = await fetchSchedule();
          // setSchedule(updatedSchedule);
          fetchSchedule()
        } else {
          alert(data.message || 'Failed to add schedule');
        }
      } catch (error) {
        console.error('Error adding meal:', error);
      }
    };

    const updateSchedule = async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingSchedule) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/schedule`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Email: user?.email, 
              Activity: activity,
              Day: day,
              StartTime: startTime,
              EndTime: endTime,
            }),
          });
          const data = await response.json();
          if (data.success) {
            alert('Schedule updated successfully!');
            setIsEditing(false); 
            setEditingSchedule(null);
            fetchSchedule();
          } else {
            alert(data.message || 'Failed to update schedule');
          }
        } catch (error) {
          console.error('Error updating schedule:', error);
        }
      }
    };

    const deleteSchedule = async (schedule: any) => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/schedule`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: user?.email, // User email from auth
            Activity: schedule.activity, // Activity to delete
            Day: schedule.day, // Include Day as required by the backend
            StartTime: schedule.start_time, // Ensure this matches the integer format in the database
          }),
        });
    
        const data = await response.json();
        if (data.success) {
          alert('Schedule deleted successfully!');
          fetchSchedule(); // Refresh the schedule list
        } else {
          alert(data.message || 'Failed to delete schedule');
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    };

    const handleEdit = (schedule: any) => {
      setIsEditing(true);
      setEditingSchedule(schedule);
      setActivity(schedule.activity);
      setDay(schedule.day);
      setStartTime(numberToTime(schedule.start_time));
      setEndTime(numberToTime(schedule.end_time))
    };


    const handleToggle = () => {
      setIsVisible((prevState) => !prevState);
    };


    useEffect(() => {
      if (user?.email) {
        fetchSchedule();
      }
    }, [user]);
  
    return (
      <>
        <Navbar />
        <div style={{ padding: '20px' }}></div>
          <h1>Schedule Page</h1>

          <form onSubmit={isEditing ? updateSchedule : addSchedule} style={{ marginBottom: '20px' }}>
            <h2>{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h2>
            
            <div>
              <label>Activity: </label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Enter activity name"
                required
              />
            </div>

            <div>
              <label>Start Time: </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label>End Time: </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Day: </label>
              <select value={day} onChange={(e) => setDay(e.target.value)} required>
                <option value="" disabled>
                  Select a day
                </option>
                <option value="M">Monday</option>
                <option value="T">Tuesday</option>
                <option value="W">Wednesday</option>
                <option value="R">Thursday</option>
                <option value="F">Friday</option>
                <option value="S">Saturday</option>
                <option value="U">Sunday</option>
              </select>
            </div>

            <button type="submit" style={{ marginTop: '10px' }}>
              {isEditing ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </form>

          <div>
            {/* Toggle Button */}
            <button onClick={handleToggle} style={{ marginBottom: '10px' }}>
              {isVisible ? 'Hide Content' : 'Show Content'}
            </button>

            {/* Conditional rendering based on state */}
            {isVisible && (
              <div>
              <h2>Your Schedule</h2>
              {schedule.length > 0 ? (
                <table cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Day</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((schedule, index) => (
                      <tr key={index}>
                        <td>{schedule.activity}</td>
                        <td>{schedule.day}</td>
                        <td>{schedule.start_time}</td>
                        <td>{schedule.end_time}</td>
                        <td>
                          <button onClick={() => handleEdit(schedule)}>Edit</button>
                          <button onClick={() => deleteSchedule(schedule)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No records found</p>
              )}
            </div>
            )}
          </div>
          

        <ScheduleExporter events={schedule}/>
        <Schedule events={schedule}/>
      </>
    );
  };

  export default ScheduleView;