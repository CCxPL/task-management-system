import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // ⏳ Global auth loading (login / fetchMe)
  if (loading) {
    return <Loader />;
  }

  // 🔐 Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 🚫 Role not allowed
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ TWO MODES SUPPORT
  // 1️⃣ Wrapper usage → return children
  // 2️⃣ Layout usage → render nested routes via Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
