import React, { useState, useEffect } from 'react';
import { healthCheck, getRootMessage, HealthCheckResponse } from '../services/api';
import './ApiTest.css';

const ApiTest: React.FC = () => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Gọi health check endpoint
        const healthData = await healthCheck();
        setHealth(healthData);

        // Gọi root endpoint
        const messageData = await getRootMessage();
        setMessage(messageData.message || JSON.stringify(messageData));

      } catch (err: any) {
        const errorMessage = err.response?.data?.message 
          || err.message 
          || 'Failed to connect to API';
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="api-test">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading API data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-test">
        <div className="error-container">
          <h2>❌ Connection Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="api-test">
      <h2>✅ API Connection Test</h2>
      
      <div className="result-card">
        <h3>🏥 Health Check Status</h3>
        {health && (
          <div className="result-content">
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="result-card">
        <h3>💬 API Message</h3>
        <div className="result-content">
          <p>{message}</p>
        </div>
      </div>

      <button onClick={handleRefresh} className="refresh-btn">
        🔄 Refresh Data
      </button>
    </div>
  );
};

export default ApiTest;