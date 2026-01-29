import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';

// Pages
import ProjectList from '../pages/projects/ProjectList';
import ProjectDashboard from '../pages/projects/ProjectDashboard';
import SprintList from '../pages/sprints/SprintList';
import SprintBoard from '../pages/sprints/SprintBoard';
import KanbanBoard from '../pages/kanban/KanbanBoard';
import IssueDetail from '../pages/issues/IssueDetail';
import Reports from '../pages/reports/Reports';
import Profile from '../pages/profile/Profile';
import TeamManagement from '../pages/team/TeamManagement';
import WorkflowManagement from '../pages/workflow/WorkflowManagement'; // ✅ Import

// Super Admin
import ManageOrganizations from '../pages/superadmin/ManageOrganizations';
import CreateAdmin from '../pages/superadmin/CreateAdmin';

// Components
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
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard - Role-based */}
        <Route
          path="/dashboard"
          element={
            user?.role === 'SUPER_ADMIN'
              ? <SuperAdminDashboard />
              : <Dashboard />
          }
        />

        {/* ================= SUPER ADMIN ROUTES ================= */}
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

        {/* ================= ADMIN/MANAGER ROUTES ================= */}
        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN']}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route path="/projects/:id" element={<ProjectDashboard />} />

        <Route
          path="/sprints"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <SprintList />
            </ProtectedRoute>
          }
        />
        <Route path="/sprints/:id" element={<SprintBoard />} />

        {/* ✅ WORKFLOW ROUTE - MOVED INSIDE PROTECTED ROUTES */}
        <Route
          path="/workflow"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <WorkflowManagement />
            </ProtectedRoute>
          }
        />

        {/* ================= COMMON ROUTES ================= */}
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/board" element={<KanbanBoard />} />
        <Route path="/issues/:id" element={<IssueDetail />} />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;