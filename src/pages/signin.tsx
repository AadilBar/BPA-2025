import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { checkProfileSetupComplete } from '../utils/profileHelpers';

export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }

        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });

        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/accountsetup');
        }, 1500);
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Check if user has completed profile setup
        const isSetupComplete = await checkProfileSetupComplete();
        
        setSuccess('Signed in successfully! Redirecting...');
        setTimeout(() => {
          navigate(isSetupComplete ? '/' : '/accountsetup');
        }, 1500);
      }
    } catch (err: any) {
      // Handle Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else if (err.code === 'auth/user-not-found') {
        setError('User not found');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-white/70 text-sm">
              {isSignUp ? 'Join our supportive community' : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-3 mb-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-3 mb-4 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for sign up) */}
            {isSignUp && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (only for sign up) */}
            {isSignUp && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Forgot Password (only for sign in) */}
            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-white/60 hover:text-white text-sm transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:opacity-50 backdrop-blur-md text-white font-semibold rounded-full py-3 transition-all duration-300 border border-white/30 shadow-lg mt-6"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span className="font-semibold">{isSignUp ? 'Sign In' : 'Sign Up'}</span>
            </button>
          </div>

          {/* Privacy Notice */}
          <p className="text-white/40 text-xs text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
