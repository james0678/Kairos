import { useGoogleLogin } from '@react-oauth/google';
import { Box, Typography, Button } from '@mui/material';

const Login = ({ onLoginSuccess }) => {
  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Login Success:', tokenResponse);
      const expiresIn = tokenResponse.expires_in || 3600;
      const expiryTime = new Date().getTime() + expiresIn * 1000;
      localStorage.setItem('tokenExpiryTime', expiryTime.toString());
      onLoginSuccess(tokenResponse);
    },
    onError: error => {
      console.error('Login Failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiryTime');
    },
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
    >
      <Typography variant="h4">Time Tracker</Typography>
      <Typography variant="body1" gutterBottom>
        구글 캘린더와 연동하여 계획된 시간과 실제 사용 시간을 비교해보세요
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => login()}
      >
        Google 계정으로 로그인
      </Button>
    </Box>
  );
};

export default Login;