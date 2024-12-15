import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const RecordDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [activity, setActivity] = useState('');
  const [datetime, setDatetime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [quality, setQuality] = useState<number | ''>('');
  const [response, setResponse] = useState<any>(null);

  const handleApiRequest = async (method: string, endpoint: string, body: any = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
      });
      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ success: false, error: String(error) });
    }
  };

  const createRecord = () => {
    handleApiRequest('POST', '/records', { Email: email, Activity: activity, Datetime: datetime, Duration: duration, Quality: quality });
  };

  const getRecordsByEmail = () => {
    handleApiRequest('GET', `/records?email=${email}`);
  };

  const updateRecord = () => {
    handleApiRequest('PUT', '/records', { Email: email, Activity: activity, Datetime: datetime, Duration: duration, Quality: quality });
  };

  const deleteRecord = () => {
    handleApiRequest('DELETE', '/records', { Email: email, Activity: activity, Datetime: datetime });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>CRUD Demo</h1>
      <div style={{ marginBottom: '10px' }}>
        <label>Email: </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Activity: </label>
        <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Enter Activity" />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Datetime: </label>
        <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Duration: </label>
        <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Enter Duration" />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Quality: </label>
        <input type="number" value={quality} onChange={(e) => setQuality(Number(e.target.value))} placeholder="Enter Quality" />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={createRecord}>Create Record</button>
        <button onClick={getRecordsByEmail} style={{ marginLeft: '10px' }}>Get Records</button>
        <button onClick={updateRecord} style={{ marginLeft: '10px' }}>Update Record</button>
        <button onClick={deleteRecord} style={{ marginLeft: '10px' }}>Delete Record</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>API Response:</h2>
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </div>
    </div>
  );
};

export default RecordDemo;
