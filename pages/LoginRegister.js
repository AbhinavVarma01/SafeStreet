import React, { useState } from 'react';
import { Lock, Mail, User, Phone, LogIn, UserPlus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [userType, setUserType] = useState('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorityCode, setAuthorityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulated auth data store
  const users = new Map();
  const AUTHORITY_CODE = 'AUTH123';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const apiUrl = isRegistering 
        ? "http://localhost:5000/api/auth/register" 
        : "http://localhost:5000/api/auth/login";
  
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
          email,
          password,
          userType,
          authorityCode,
        }),
      });
  
      // No JSON processing at all
      alert(isRegistering ? "Registration successful!" : "Login successful!");
      navigate(isRegistering ? "/login" : userType === "authority" ? "/authority" : "/upload");
  
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  


  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Password reset functionality would be implemented here');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {isRegistering ? (
            <UserPlus className="auth-icon" />
          ) : (
            <LogIn className="auth-icon" />
          )}
          <h1 className="auth-title">SafeStreet</h1>
          <h2 className="auth-subtitle">Road Damage Detection</h2>
          <h3 className="auth-welcome">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p className="auth-description">
            {isRegistering ? 'Sign up for your account' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div>
              <label className="input-label">Account Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="form-input"
              >
                <option value="user">User</option>
                <option value="authority">Authority</option>
              </select>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="input-label">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="form-input"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Last Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="form-input"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Phone Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-input"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {userType === 'authority' && (
              <div>
                <label className="input-label">Authority Code</label>
                <div className="input-wrapper">
                  <Shield className="input-icon" />
                  <input
                    type="text"
                    value={authorityCode}
                    onChange={(e) => setAuthorityCode(e.target.value)}
                    className="form-input"
                    placeholder="Enter authority code given"
                    required={userType === 'authority'}
                  />
                </div>
              </div>
            )}
          </div>

          {!isRegistering && (
            <div className="forgot-password">
              <button
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Loading...' : isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="toggle-account">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegistering(false)}
                className="toggle-button"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="toggle-button"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;