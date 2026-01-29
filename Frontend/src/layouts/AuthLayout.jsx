import { Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';


const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: 420,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Outlet />
    </Box>
  );
};


export default AuthLayout;
