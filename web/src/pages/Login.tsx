import React from 'react';
import AuthForm from '../components/AuthForm';
import './Login.css';

const Login: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <header className="login-header">
          <h1>🚀 MindX Training Week 01</h1>
          <p className="login-subtitle">Full Stack Web Application on Azure AKS</p>
          <div className="tech-stack">
            <span className="tech-badge">React</span>
            <span className="tech-badge">TypeScript</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Firebase Auth</span>
            <span className="tech-badge">Kubernetes</span>
            <span className="tech-badge">Azure</span>
          </div>
        </header>

        <AuthForm />

        <footer className="login-footer">
          <p>Prepared by Nguyễn Ngọc Lan — MindX Onboard Training Program</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;