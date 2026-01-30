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
import WorkflowManagement from '../pages/workflow/WorkflowManagement';

// Super Admin
import ManageOrganizations from '../pages/superadmin/ManageOrganizations';
import CreateOrganization from '../pages/superadmin/CreateOrganization';

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
        {/* ================= DEFAULT REDIRECT ================= */}
        <Route 
          path="/" 
          element={
            user?.role === 'SUPER_ADMIN' 
              ? <Navigate to="/super-admin/dashboard" replace />
              : <Navigate to="/dashboard" replace />
          } 
        />

        {/* ================= DASHBOARD ROUTES ================= */}
        {/* Super Admin Dashboard */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Regular Dashboard - NOT for SUPER_ADMIN */}
        <Route
          path="/dashboard"
          element={
            user?.role === 'SUPER_ADMIN' 
              ? <Navigate to="/super-admin/dashboard" replace />
              : <Dashboard />
          }
        />

        {/* ================= SUPER ADMIN ROUTES ================= */}
        <Route
          path="/super-admin/create-organization"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <CreateOrganization />
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
        {/* Team Management */}
        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        
        {/* Projects */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/projects/:id" 
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER']}>
              <ProjectDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Sprints */}
        <Route
          path="/sprints"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <SprintList />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/sprints/:id" 
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <SprintBoard />
            </ProtectedRoute>
          } 
        />

        {/* Workflow Management */}
        <Route
          path="/workflow"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <WorkflowManagement />
            </ProtectedRoute>
          }
        />

        {/* ================= COMMON ROUTES (ALL EXCEPT SUPER_ADMIN) ================= */}
        {/* Kanban Board */}
        <Route 
          path="/kanban" 
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER']}>
              <KanbanBoard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/board" 
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER']}>
              <KanbanBoard />
            </ProtectedRoute>
          } 
        />

        {/* Issue Detail */}
        <Route 
          path="/issues/:id" 
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER']}>
              <IssueDetail />
            </ProtectedRoute>
          } 
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ADMIN', 'MANAGER']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Profile - Available for ALL roles */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route 
        path="*" 
        element={
          user?.role === 'SUPER_ADMIN' 
            ? <Navigate to="/super-admin/dashboard" replace />
            : <Navigate to="/dashboard" replace />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;