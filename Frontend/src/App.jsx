import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './app/slices/authSlice';
import { fetchProjects } from './app/slices/projectSlice';
import { fetchTeamMembers } from './app/slices/teamSlice';
import { setCurrentProject } from './app/slices/projectContextSlice';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: projects } = useSelector((state) => state.projects);
  const { currentProject } = useSelector((state) => state.projectContext);

  // ✅ Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token && !user) {
      console.log('🔐 User already logged in, fetching profile...');
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  // ✅ Global data loader - fetch projects and team when user is available
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      console.log('🌍 Global: Loading app data for user:', user.username);
      
      // Fetch projects if not already loaded
      if (!projects || projects.length === 0) {
        console.log('📥 Global: Fetching projects...');
        dispatch(fetchProjects());
      }
      
      // Fetch team members
      console.log('📥 Global: Fetching team members...');
      dispatch(fetchTeamMembers());
    }
  }, [user, dispatch]);

  // ✅ Set default project if not set
  useEffect(() => {
    if (projects?.length > 0 && !currentProject) {
      console.log('🌍 Global: Setting default project:', projects[0].name);
      dispatch(setCurrentProject(projects[0]));
    }
  }, [projects, currentProject, dispatch]);

  return <AppRoutes />;
}

export default App;
