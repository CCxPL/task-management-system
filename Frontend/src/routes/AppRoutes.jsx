import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';

import Dashboard from '../pages/dashboard/Dashboard';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';

import ProjectList from '../pages/projects/ProjectList';
import ProjectDashboard from '../pages/projects/ProjectDashboard';
import SprintList from '../pages/sprints/SprintList';
import SprintBoard from '../pages/sprints/SprintBoard';
import KanbanBoard from '../pages/kanban/KanbanBoard';
import IssueDetail from '../pages/issues/IssueDetail';
import Reports from '../pages/reports/Reports';
import Profile from '../pages/profile/Profile';

import TeamManagement from '../pages/team/TeamManagement';
import ManageOrganizations from '../pages/superadmin/ManageOrganizations';
import CreateAdmin from '../pages/superadmin/CreateAdmin';

import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ================= PROTECTED ROUTES ================= */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            user?.role === 'SUPER_ADMIN'
              ? <SuperAdminDashboard />
              : <Dashboard />
          }
        />

        {/* SUPER ADMIN */}
        <Route
          path="/super-admin/create-admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <CreateAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/organizations"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <ManageOrganizations />
            </ProtectedRoute>
          }
        />

        {/* ORG ADMIN / MANAGER */}
        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN']}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'MANAGER']}>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route path="/projects/:id" element={<ProjectDashboard />} />

        <Route
          path="/sprints"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'MANAGER']}>
              <SprintList />
            </ProtectedRoute>
          }
        />
        <Route path="/sprints/:id" element={<SprintBoard />} />

        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/issues/:id" element={<IssueDetail />} />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'MANAGER']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
