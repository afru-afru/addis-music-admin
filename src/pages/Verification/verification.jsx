// src/pages/Login/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Implement your login logic here (API call to backend)
    try {
      const response = await fetch('/api/login', { // Replace with your backend login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        // Store token or user data in local storage or context
        localStorage.setItem('token', data.token); // Example: Store token
        navigate('/'); // Redirect to main dashboard
      } else {
        // Login failed
        const errorData = await response.json();
        alert(errorData.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full mx-4 md:mx-auto">
        <div className="flex flex-col md:flex-row">
          <div className="bg-red-600 text-white p-8 md:w-1/2 flex flex-col justify-center items-center">
            <img src="/logo.png" alt="Logo" className="max-w-xs mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Addis Music Award is Celebrating Excellence in Music</h2>
            <p className="text-sm">Empower artists by voting for your favorite nominees on the Addis Music and help crown this year's winners.</p>
          </div>
          <div className="p-8 md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">LOG IN</h2>
            <p className="text-sm text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">User Name</label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="username"
                  type="text"
                  placeholder="Enter your user name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* Eye icon for password visibility (you'll need to implement this) */}
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-red-600 mr-2"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Remember Me</span>
                </label>
                <Link to="/verification" className="inline-block align-baseline font-bold text-sm text-red-600 hover:text-red-800">Forgot Password?</Link>
              </div>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
              >
                LOGIN
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;