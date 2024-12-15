import React, { useState } from 'react';
import { CalorieData } from '../types/CalorieData';

interface CalorieFormProps {
  onAdd: (data: CalorieData) => void;
}

const CalorieForm: React.FC<CalorieFormProps> = ({ onAdd }) => {
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity && date && calories) {
      onAdd({activity, date, calories: parseInt(calories, 10) });
      setActivity('');
      setDate('');
      setCalories('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        placeholder='Activity'
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="number"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        placeholder="Calories"
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default CalorieForm;
