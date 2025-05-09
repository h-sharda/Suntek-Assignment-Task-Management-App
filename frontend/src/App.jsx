import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

// Context
import { AuthProvider } from "./context/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  return children;
};

// Public Route Component (for non-authenticated users)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is signed in
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Set default axios auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const { data } = await axios.get("/api/auth/me");
          setUser(data.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthProvider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser, loading }}
    >
      <Router>
        <div className="flex flex-col min-h-screen bg-bg-white">
          <div className="max-w-[85vw] mx-auto w-full flex flex-col flex-grow">
            <Header />
            <main className="flex-grow px-4 py-8">
              {!loading && (
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <SignUp />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/signin"
                    element={
                      <PublicRoute>
                        <SignIn />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
            </main>
            <Footer />
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
