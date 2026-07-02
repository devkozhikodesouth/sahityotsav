import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await login(username, password);
      navigate("/admin");
    } catch (error) {
      console.error("Login component error:", error);
      setErrorMessage(
        error.response?.data?.message || "Invalid credentials or connection error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-accent/40 pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-accent/40 pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-accent/40 pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-accent/40 pointer-events-none"></div>

      <div className="max-w-md w-full p-8 bg-surface rounded-2xl border-vintage shadow-xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading text-primary font-bold tracking-wide uppercase">
            Sahityotsav
          </h2>
          <div className="divider-vintage"></div>
          <p className="text-sm text-secondary/70 mt-1 font-serif italic">
            Sign in to the festival administration panel
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="text-xs font-heading font-semibold text-primary uppercase tracking-wider block"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-background/30 border border-accent/30 rounded-xl text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition font-serif"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-xs font-heading font-semibold text-primary uppercase tracking-wider block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-background/30 border border-accent/30 rounded-xl text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition font-serif"
            />
          </div>
          {errorMessage && (
            <div className="p-3 bg-primary-dark/10 border border-primary/30 rounded-xl text-primary text-sm text-center font-serif">
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center bg-primary border border-accent/50 text-white hover:text-accent hover:border-accent hover:bg-primary-light py-3.5 rounded-xl font-heading font-semibold tracking-wide uppercase active:scale-95 disabled:opacity-50 disabled:scale-100 transition duration-150 ease-in-out shadow-md"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
