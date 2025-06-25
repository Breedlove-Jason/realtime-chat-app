import Navbar from "./components/Navbar.jsx";
import {Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/Profile.jsx" //different filename but same function name
import {useAuthStore} from "./store/useAuthStore.js";
import {useEffect} from "react";

function App() {
    const {authUser, checkAuth} = useAuthStore()
    useEffect(() => {
        checkAuth()
    }, [checkAuth])
    console.log("Auth User:", authUser)
  return (
    <>
      <div>
          <Navbar />
          <Routes>
              <Route path={"/"} element={<HomePage/>} />
              <Route path={"/signup"} element={<SignUpPage/>} />
              <Route path={"/login"} element={<LoginPage/>} />
              <Route path={"/settings"} element={<SettingsPage/>} />
              <Route path={"/profile"} element={<ProfilePage/>} />
          </Routes>

        </div>
    </>
  );
}

export default App;
