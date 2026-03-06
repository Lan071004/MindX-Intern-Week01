import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Home from './adapters/inbound/pages/home/Home';
import Login from './adapters/inbound/pages/login/Login';

// DI wiring — chỉ App.tsx biết về Firebase & GA
import { FirebaseAuthAdapter } from './adapters/outbound/firebase/FirebaseAuthAdapter';
import { GoogleAnalyticsAdapter } from './adapters/outbound/analytics/GoogleAnalyticsAdapter';

import './App.css';

// Khởi tạo adapters một lần duy nhất ở composition root
const authPort = new FirebaseAuthAdapter();
const analyticsPort = new GoogleAnalyticsAdapter();

function Analytics() {
  const location = useLocation();
  useEffect(() => {
    analyticsPort.trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
}

function App() {
  useEffect(() => {
    analyticsPort.init();
  }, []);

  return (
    // Inject ports vào AuthProvider thay vì hardcode bên trong
    <AuthProvider authPort={authPort} analyticsPort={analyticsPort}>
      <Router>
        <Analytics />
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;