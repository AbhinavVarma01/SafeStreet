import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, Loader2, ArrowRight, AlertCircle, User, Mail, Lock, Shield } from 'lucide-react';
import './LoginRegister.css';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    authorityCode: ''
  });
  const [formValid, setFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const VALID_AUTHORITY_CODE = 'AUTH123';

  useEffect(() => {
    validateForm();
  }, [formData, isRegistering, userType]);

  const validateForm = () => {
    const { email, password, firstName, lastName, phoneNumber, confirmPassword, authorityCode } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (isRegistering) {
      const basicValidation = emailRegex.test(email) && 
                            password.length >= 6 && 
                            firstName.trim() && 
                            lastName.trim() && 
                            phoneNumber.trim();
      
      if (userType === 'authority') {
        setFormValid(basicValidation && authorityCode === VALID_AUTHORITY_CODE);
      } else {
        setFormValid(basicValidation && password === confirmPassword);
      }
    } else {
      if (userType === 'authority') {
        setFormValid(emailRegex.test(email) && password.length >= 6 && authorityCode === VALID_AUTHORITY_CODE);
      } else {
        setFormValid(emailRegex.test(email) && password.length >= 6);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate authority code for both login and registration
    if (userType === 'authority' && formData.authorityCode !== VALID_AUTHORITY_CODE) {
      setError('Invalid authority code!');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegistering 
        ? 'http://localhost:5000/api/auth/register' 
        : 'http://localhost:5000/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType
        })
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isRegistering) {
        // For registration, show success message and switch to login
        setError('Registration successful! Please log in.');
        setIsRegistering(false);
        // Clear the form
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          password: '',
          confirmPassword: '',
          authorityCode: ''
        });
      } else {
        // For login, store token and navigate
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', userType);
        navigate(userType === 'authority' ? '/authority' : '/upload');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="home-button">
          <Home size={20} />
        </Link>

        <div className="auth-header">
          <div className="auth-icon">
            {isRegistering ? <User size={48} /> : <Mail size={48} />}
          </div>
          <h1 className="auth-title">SafeStreet</h1>
          <h2 className="auth-subtitle">Road Damage Detection</h2>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div>
              <label className="input-label">Account Type</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <select
                  name="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="form-input"
                >
                  <option value="user">User</option>
                  <option value="authority">Authority</option>
                </select>
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="input-label">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
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
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Phone Number</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {userType === 'authority' && (
              <div>
                <label className="input-label">Authority Code</label>
                <div className="input-wrapper">
                  <Shield className="input-icon" />
                  <input
                    type="text"
                    name="authorityCode"
                    value={formData.authorityCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter authority code"
                    required
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <>
                <div>
                  <label className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isRegistering ? 'Sign Up' : 'Log In'}
                <ArrowRight size={20} />
              </>
            )}
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