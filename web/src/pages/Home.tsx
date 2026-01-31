import React from 'react';
import ApiTest from '../components/ApiTest';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🚀 MindX Training Week 01 Project</h1>
        <p className="subtitle">Full Stack Web Application Deployment on Azure AKS</p>
        <div className="tech-stack">
          <span className="tech-badge">React</span>
          <span className="tech-badge">TypeScript</span>
          <span className="tech-badge">Node.js</span>
          <span className="tech-badge">Kubernetes</span>
          <span className="tech-badge">Azure</span>
        </div>
      </header>

      <main className="home-content">
        <ApiTest />
      </main>

      <footer className="home-footer">
        <p>Prepared by Nguyễn Ngọc Lan – MindX Onboard Training Program</p>
      </footer>
    </div>
  );
};

export default Home;