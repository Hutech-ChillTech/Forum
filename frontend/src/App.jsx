import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Tags from "./pages/Tags";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Saved from "./pages/Saved";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import ModeratorReview from "./pages/ModeratorReview";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Header from "./components/Header";
import Toast from "./components/Toast";
import "./App.css";

// Minimal layout for full-width pages (no sidebar)
const SlimLayout = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "var(--bg-color)",
    }}
  >
    <Header />
    <Outlet />
    <Toast />
  </div>
);

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        setTheme(e.newValue);
      }
    };

    const handleCustomThemeChange = (e) => {
      setTheme(e.detail.theme);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themeChanged", handleCustomThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChanged", handleCustomThemeChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route
            path="/posts/review"
            element={
              <ProtectedRoute allowedRoles={["MODERATOR", "ADMIN"]}>
                <ModeratorReview />
              </ProtectedRoute>
            }
          />
          <Route path="/tags" element={<Tags />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Chat gets full viewport (no sidebar grid) */}
        <Route element={<SlimLayout />}>
          <Route path="/chat" element={<Chat />} />
        </Route>

        <Route path="/posts/:id" element={<PostDetail />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
