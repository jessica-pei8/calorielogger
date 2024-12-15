import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from './NavBar';

const RecordsPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [activity, setActivity] = useState('');
  const [datetime, setDatetime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [quality, setQuality] = useState<number | ''>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [activityNames, setActivityNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch activity names
  const fetchActivityNames = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/activitynames');
      const data = await response.json();
      if (data.success) {
        setActivityNames(data.data);
      } else {
        alert(data.message || 'Failed to fetch activity names');
      }
    } catch (error) {
      console.error('Error fetching activity names:', error);
    }
  };

  // Fetch user records
  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/records?email=${user?.email}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        alert(data.message || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  // Add a new record
  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:5000/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: user?.email,
          Activity: activity,
          Datetime: datetime,
          Duration: duration,
          Quality: quality,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Record added successfully!');
        setActivity('');
        setDatetime('');
        setDuration('');
        setQuality('');
        fetchRecords();
      } else {
        alert(data.message || 'Failed to add record');
      }
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  // Update an existing record
  const updateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/records`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: user?.email,
            Activity: activity,
            Datetime: datetime,
            Duration: duration,
            Quality: quality,
          }),
        });
        const data = await response.json();
        if (data.success) {
          alert('Record updated successfully!');
          setIsEditing(false);
          setEditingRecord(null);
          fetchRecords();
        } else {
          alert(data.message || 'Failed to update record');
        }
      } catch (error) {
        console.error('Error updating record:', error);
      }
    }
  };

  // Delete a record
  const deleteRecord = async (record: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/records`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: user?.email,
          Activity: record.Activity,
          Datetime: record.Datetime,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Record deleted successfully!');
        fetchRecords();
      } else {
        alert(data.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setEditingRecord(record);
    setActivity(record.Activity);
    setDatetime(record.Datetime);
    setDuration(record.Duration);
    setQuality(record.Quality);
  };

  // Handle the search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActivity(e.target.value); // Make sure the activity state is updated as well
  };

  // Filter activities based on the search term
  const filteredActivityNames = activityNames.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select an activity from the filtered list
  const handleActivityNameSelect = (name: string) => {
    setActivity(name);
    setSearchTerm(''); // Reset the search term
  };

  useEffect(() => {
    if (user?.email) {
      fetchRecords();
    }
    fetchActivityNames(); // Fetch activity names when the component mounts
  }, [user]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Records Page</h1>

        <form onSubmit={isEditing ? updateRecord : addRecord} style={{ marginBottom: '20px' }}>
          <h2>{isEditing ? 'Edit Record' : 'Add New Record'}</h2>

          <div>
            <label>Activity: </label>
            <input
              type="text"
              value={activity} // Use the activity state here
              onChange={handleSearchChange} // Update the search term and activity state
              placeholder="Search and select activity"
              required
            />
            {/* Show filtered activity names */}
            {searchTerm && (
              <ul
                style={{
                  border: '1px solid #ccc',
                  maxHeight: '200px',
                  overflowY: 'scroll',
                  paddingLeft: '0',
                  listStyleType: 'none',
                }}
              >
                {filteredActivityNames.map((name, index) => (
                  <li
                    key={index}
                    onClick={() => handleActivityNameSelect(name)} // Set the selected activity
                    style={{
                      padding: '5px',
                      cursor: 'pointer',
                      backgroundColor: '#f4f4f4',
                      marginBottom: '2px',
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label>Datetime: </label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Duration (minutes): </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="Enter duration"
              required
            />
          </div>

          <div>
            <label>Quality (1-10): </label>
            <input
              type="number"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              placeholder="Enter quality"
              required
            />
          </div>

          <button type="submit" style={{ marginTop: '10px' }}>
            {isEditing ? 'Update Record' : 'Add Record'}
          </button>
        </form>

        <div>
          <h2>Your Records</h2>
          {records.length > 0 ? (
            <table cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Datetime</th>
                  <th>Duration (minutes)</th>
                  <th>Quality</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.Activity}</td>
                    <td>{record.Datetime}</td>
                    <td>{record.Duration}</td>
                    <td>{record.Quality}</td>
                    <td>
                      <button onClick={() => handleEdit(record)}>Edit</button>
                      <button onClick={() => deleteRecord(record)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsPage;
