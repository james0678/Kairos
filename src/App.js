import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GoogleAuthProvider from './components/GoogleAuthProvider';
import Login from './components/Login';
import TimeTracker from './components/TimeTracker';
import QuickEventPage from './components/QuickEventPage';
import CustomizePage from './components/CustomizePage';
import Navigation from './components/Navigation';
import { Box } from '@mui/material';
import { CalendarProvider } from './contexts/CalendarContext';
import { QuickEventsProvider } from './contexts/QuickEventsContext';
import NewQuickEventPage from './components/NewQuickEventPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const savedToken = localStorage.getItem('token');
    const tokenExpiryTime = localStorage.getItem('tokenExpiryTime');
    
    if (savedToken && tokenExpiryTime) {
      const now = new Date().getTime();
      if (now < parseInt(tokenExpiryTime)) {
        setToken(savedToken);
        setIsLoggedIn(true);
      } else {
        // 토큰이 만료되었으면 로그아웃
        handleLogout();
      }
    }
  }, []);

  const handleLoginSuccess = (tokenResponse) => {
    console.log('Token Response:', tokenResponse);
    const accessToken = tokenResponse.access_token;
    setToken(accessToken);
    setIsLoggedIn(true);
    
    // 토큰과 만료 시간을 localStorage에 저장
    localStorage.setItem('token', accessToken);
    const expiryTime = new Date().getTime() + (tokenResponse.expires_in || 3600) * 1000;
    localStorage.setItem('tokenExpiryTime', expiryTime.toString());
  };

  const handleLogout = () => {
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiryTime');
  };

  return (
    <QuickEventsProvider>
      <Router>
        <GoogleAuthProvider>
          <CalendarProvider>
            <Box sx={{ width: '100%', position: 'relative', minHeight: '100vh' }}>
              {!isLoggedIn ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <>
                  <Routes>
                    <Route path="/" element={<QuickEventPage token={token} />} />
                    <Route path="/calendar" element={<TimeTracker token={token} onLogout={handleLogout} />} />
                    <Route path="/customize" element={<CustomizePage />} />
                    <Route path="/customize/new" element={<NewQuickEventPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Navigation />
                </>
              )}
            </Box>
          </CalendarProvider>
        </GoogleAuthProvider>
      </Router>
    </QuickEventsProvider>
  );
}

export default App;
