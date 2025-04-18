import React, { useState } from 'react';
import { api } from '../services/api';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    try {
      setStatus('Testing connection...');
      setError('');
      const result = await api.testConnection();
      setStatus(`Connected successfully! Response: ${JSON.stringify(result)}`);
    } catch (err) {
      setError(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Backend Connection
      </button>
      {status && <p style={{ color: 'green' }}>{status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ConnectionTest;
