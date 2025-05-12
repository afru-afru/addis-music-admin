import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css'; 

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [resetSuccessMessage, setResetSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const navigate = useNavigate();
    const [emailFound, setEmailFound] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Attempting login with:', { email, password: password.trim() });
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: password.trim() }),
            });
            console.log('Login Response Status:', response.status);
            const data = await response.json();
            console.log('Login Response Data:', data);
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                alert(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
        setLoading(false);
    };

    const handleCheckEmail = async () => {
        if (!email) return alert('Please enter your email.');
        try {
            const response = await fetch('http://localhost:5000/api/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (response.ok) {
                setEmailFound(true);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Email not found.');
            }
        } catch (error) {
            console.error('Email check error:', error);
            alert('An error occurred while checking your email.');
        }
    };

    const validateNewPassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[^a-zA-Z0-9\s]/.test(password)) {
            return 'Password must contain at least one symbol (e.g., !@#$%^&*).';
        }
        return '';
    };

    const handleResetPassword = async () => {
        const validationError = validateNewPassword(newPassword);
        setNewPasswordError(validationError);

        if (validationError) {
            return;
        }

        setResettingPassword(true);
        try {
            const response = await fetch('http://localhost:5000/api/reset-password-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: newPassword.trim() })
            });
            if (response.ok) {
                setResetSuccessMessage('Password reset successfully!');
                setTimeout(() => {
                    setForgotPassword(false);
                    setEmailFound(false);
                    setEmail('');
                    setNewPassword('');
                    setNewPasswordError('');
                    setResetSuccessMessage('');
                }, 2000); // Go back to login after 2 seconds
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('An error occurred while resetting your password.');
        }
        setResettingPassword(false);
    };

    const handleBackToLogin = () => {
        setForgotPassword(false);
        setEmailFound(false);
        setEmail('');
        setNewPassword('');
        setNewPasswordError('');
        setResetSuccessMessage('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    return (
        <div className="min-h-screen flex relative bg-gray-100 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.15] overflow-hidden">
                <div className="h-full w-full flex items-center justify-between rotate-180">
                    <div className="flex-1 h-full flex items-center">
                        <img className="h-full object-cover -rotate-180" alt="Left filler" src="/vector-7.svg" />
                    </div>
                    <div className="flex items-center h-full">
                        <img className="w-[575.1px] h-[575.19px] -rotate-180" alt="Vector" src="/vector-7.svg" />
                        <img className="w-[575px] h-full -rotate-180 object-cover" alt="Element" src="/vector-3-2.svg" />
                        <img className="w-[432px] h-full -rotate-180 object-cover" alt="Element" src="/vector-3-2.svg" />
                    </div>
                    <div className="flex-1 h-full flex items-center justify-end">
                        <img className="h-full object-cover -rotate-180" alt="Right filler" src="/7vector-7.svg" />
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/2 bg-red-600 text-white flex flex-col justify-center items-center p-12 relative z-10">
                <div className="max-w-md text-center">
                    <img src="/logo.svg" alt="Logo" className="w-20 mb-6" />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Addis Music Awards</h2>
                    <p className="text-lg text-white opacity-80 mb-4">
                        Vote for your favorite nominees and celebrate excellence in music.
                    </p>
                </div>
            </div>

            <div className={`w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center shadow-lg rounded-l-md md:rounded-none relative z-10 transition-all duration-500 ${forgotPassword ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
                {!forgotPassword ? (
                    <div className="form-container">
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Login to Your Account</h2>
                        <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your account.</p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                <input
                                    className="border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    type="text"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        className="border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox text-indigo-600 mr-2"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Remember Me
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setForgotPassword(true)}
                                    className="text-sm font-semibold text-red-600 hover:text-red-800 focus:outline-none transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <button
                                className="bg-red-600 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-md w-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                ) : null}
                                {loading ? 'Logging in...' : 'LOGIN'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="form-container">
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Reset Your Password</h2>
                        <p className="text-sm text-gray-500 mb-6">Enter your email to reset your password.</p>

                        {resetSuccessMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Success!</strong>
                                <span className="block sm:inline">{resetSuccessMessage}</span>
                            </div>
                        )}

                        {!emailFound ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                    <input
                                        className="border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        type="text"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button className="bg-red-600 text-white font-bold py-3 px-6 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all" onClick={handleCheckEmail}>
                                    CHECK EMAIL
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="mt-4 text-sm text-gray-600 hover:text-red-800 focus:outline-none transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            className="border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter your new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleNewPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                        >
                                            <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {newPasswordError && <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>}
                                    <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters and contain one symbol.</p>
                                </div>
                                <button
                                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-md w-full flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all"
                                    onClick={handleResetPassword}
                                    disabled={resettingPassword}
                                >
                                    {resettingPassword ? (
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                    ) : null}
                                    RESET PASSWORD
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;