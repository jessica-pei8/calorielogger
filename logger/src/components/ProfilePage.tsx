import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
const ProfilePage: React.FC = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    weight: '',
    sex: '',
    insomnia: false,
    maintenanceCalories: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user?email=${user?.email}`);
        const data = await response.json();

        if (data.success && data.complete) {
          setFormData({
            firstName: data.profile.FirstName || '',
            lastName: data.profile.LastName || '',
            age: data.profile.Age || '',
            weight: data.profile.Weight || '',
            sex: data.profile.Sex || '',
            insomnia: !!data.profile.Insomnia,
            maintenanceCalories: data.profile.MaintenanceCalories || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      }
    };

    if (user?.email) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email, // Use the authenticated user's email
          ...formData,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert('Profile saved successfully!');
        navigate('/chart'); // Redirect to the chart page
      } else {
        setError(data.message || 'Failed to save profile.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <><Navbar/> 
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>{formData.firstName ? 'Edit Your Profile' : 'Complete Your Profile'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Age:</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Weight (kg):</label>
        <input
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Sex (M/F/I):</label>
        <input
          type="text"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>
          Insomnia:
          <input
            type="checkbox"
            name="insomnia"
            checked={formData.insomnia}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>Maintenance Calories:</label>
        <input
          type="number"
          name="maintenanceCalories"
          value={formData.maintenanceCalories}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Save'}
      </button>
    </form>
    </>
  );
};

export default ProfilePage;