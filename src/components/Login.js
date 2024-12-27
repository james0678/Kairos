import { useGoogleLogin } from '@react-oauth/google';
import { Box, Typography, Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

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
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" gutterBottom>
        Kairos
      </Typography>
      
      <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
        Cronos to Kairos
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => login()}
        startIcon={<GoogleIcon />}
      >
        GOOGLE 계정으로 로그인
      </Button>
    </Box>
  );
};

export default Login;