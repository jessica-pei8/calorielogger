import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from './NavBar';

const MealsPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [foodName, setFoodName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [foodNames, setFoodNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all food names from the server to populate the search options
  const fetchFoodNames = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/foodnames');
      const data = await response.json();
      if (data.success) {
        setFoodNames(data.data);
      } else {
        alert(data.message || 'Failed to fetch food names');
      }
    } catch (error) {
      console.error('Error fetching food names:', error);
    }
  };

  // Fetch user meals
  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/meals?email=${user?.email}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        alert(data.message || 'Failed to fetch meals');
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  // Add a new meal
  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:5000/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: user?.email,
          FoodName: foodName,
          Datetime: datetime,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Meal added successfully!');
        setFoodName('');
        setDatetime('');
        fetchRecords();
      } else {
        alert(data.message || 'Failed to add meal');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  // Update an existing meal
  const updateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/meals`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: user?.email,
            FoodName: foodName,
            Datetime: datetime,
          }),
        });
        const data = await response.json();
        if (data.success) {
          alert('Meal updated successfully!');
          setIsEditing(false);
          setEditingRecord(null);
          fetchRecords();
        } else {
          alert(data.message || 'Failed to update meal');
        }
      } catch (error) {
        console.error('Error updating meal:', error);
      }
    }
  };

  // Delete a meal
  const deleteRecord = async (record: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/meals`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: user?.email,
          FoodName: record.FoodName,
          Datetime: record.Datetime,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Meal deleted successfully!');
        fetchRecords();
      } else {
        alert(data.message || 'Failed to delete meal');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setEditingRecord(record);
    setFoodName(record.FoodName);
    setDatetime(record.Datetime);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodName(e.target.value); // Update food name directly
    setSearchTerm(e.target.value); // Update search term as well
  };

  // Filter food names based on the search term
  const filteredFoodNames = foodNames.filter((food) =>
    food.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close the search dropdown when a food name is selected
  const handleFoodNameSelect = (food: string) => {
    setFoodName(food);
    setSearchTerm(''); // Clear the search term after selection
  };

  useEffect(() => {
    if (user?.email) {
      fetchRecords();
    }
    fetchFoodNames();  // Fetch food names when the component mounts
  }, [user]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Meals Page</h1>

        <form onSubmit={isEditing ? updateRecord : addRecord} style={{ marginBottom: '20px' }}>
          <h2>{isEditing ? 'Edit Meal' : 'Add New Meal'}</h2>
          <div>
            <label>Food Name: </label>
            <input
              type="text"
              value={foodName}
              onChange={handleSearchChange}
              placeholder="Search and select food name"
              required
            />
            {/* Display the filtered food names as a dropdown */}
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
                {filteredFoodNames.map((food, index) => (
                  <li
                    key={index}
                    onClick={() => handleFoodNameSelect(food)}
                    style={{
                      padding: '5px',
                      cursor: 'pointer',
                      backgroundColor: '#f4f4f4',
                      marginBottom: '2px',
                    }}
                  >
                    {food}
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
          <button type="submit" style={{ marginTop: '10px' }}>
            {isEditing ? 'Update Meal' : 'Add Meal'}
          </button>
        </form>

        <div>
          <h2>Your Meals</h2>
          {records.length > 0 ? (
            <table cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Datetime</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.FoodName}</td>
                    <td>{record.Datetime}</td>
                    <td>
                      <button onClick={() => handleEdit(record)}>Edit</button>
                      <button onClick={() => deleteRecord(record)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No meals found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealsPage;
