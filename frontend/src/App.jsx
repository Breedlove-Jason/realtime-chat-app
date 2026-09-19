import { useChatStore } from './store/useChatStore.js';
import DemoPage from './pages/DemoPage.jsx';
import Navbar from './components/Navbar.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/Profile.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore.js';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) useChatStore.getState().reset();
    if (!socket) return;
    const receive = m => useChatStore.getState().receive(m);
    const typing = ({ userId }) => useChatStore.setState(s => ({ typingUntil: { ...s.typingUntil, [userId]: Date.now() + 2500 } }));
    const refresh = () => {
      useChatStore.getState().getUsers();
      const peer = useChatStore.getState().selectedUser;
      if (peer) useChatStore.getState().getMessages(peer._id);
    };
    socket.on('newMessage', receive);
    socket.on('typing', typing);
    socket.on('contactsChanged', refresh);
    socket.on('connect', refresh);
    return () => { socket.off('newMessage', receive); socket.off('typing', typing); socket.off('contactsChanged', refresh); socket.off('connect', refresh); };
  }, [authUser, socket]);

  // Apply theme to document element to prevent UI from looking squished initially
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className={'flex items-center justify-center h-screen'}>
        <Loader className={'size-10 animate-spin'} />
      </div>
    );
  }
  return (
    <>
      <div data-theme={theme}>
        <Navbar />
        <Routes>
          <Route path="/demo" element={<DemoPage />} />
          <Route
            path={'/'}
            element={authUser ? <HomePage /> : <DemoPage />}
          />
          <Route
            path={'/signup'}
            element={!authUser ? <SignUpPage /> : <Navigate to={'/'} />}
          />
          <Route
            path={'/login'}
            element={!authUser ? <LoginPage /> : <Navigate to={'/'} />}
          />
          <Route path={'/settings'} element={<SettingsPage />} />
          <Route
            path={'/profile'}
            element={authUser ? <ProfilePage /> : <Navigate to={'/login'} />}
          />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;

