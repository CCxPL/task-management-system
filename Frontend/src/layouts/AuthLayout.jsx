import { Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';

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
    <AuthContainer maxWidth="xl">
      <AuthCard elevation={3}>
        {/* 👇 Router v6 renders child routes here */}
        <Outlet />
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthLayout;
