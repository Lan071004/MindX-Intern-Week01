import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';
import { useEffect } from 'react';
import { initGA, trackPageView } from './utils/analytics';

// Component để track page views
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Track page view mỗi khi route thay đổi
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    // Khởi tạo Google Analytics khi app load
    initGA();
  }, []);

  return (
    <AuthProvider>
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