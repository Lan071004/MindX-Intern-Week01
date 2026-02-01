import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiTest from '../components/ApiTest';
import './Home.css';

const Home: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="home-page">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner-home"></div>
          <p style={{ color: '#666', marginTop: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🚀 MindX Training Week 01 Project</h1>
        <p className="subtitle">Full Stack Web Application Deployment on Azure AKS</p>
        <div className="tech-stack">
          <span className="tech-badge">React</span>
          <span className="tech-badge">TypeScript</span>
          <span className="tech-badge">Node.js</span>
          <span className="tech-badge">Firebase Auth</span>
          <span className="tech-badge">Kubernetes</span>
          <span className="tech-badge">Azure</span>
        </div>

        {/* Auth status bar */}
        <div className="auth-status-bar">
          <span>👤 {user.email}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="home-content">
        {/* API test */}
        <ApiTest />
      </main>

      <footer className="home-footer">
        <p>Prepared by Nguyễn Ngọc Lan — MindX Onboard Training Program</p>
      </footer>
    </div>
  );
};

export default Home;