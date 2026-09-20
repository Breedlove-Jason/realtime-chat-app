import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { MessageSquare, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import { Link } from 'react-router-dom';


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoggingIn } = useAuthStore();

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    const nextErrors = {};
    const email = formData.email.trim();
    if (!email) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!formData.password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length) return;
    const result = await login({ ...formData, email });
    if (result?.error) setSubmitError(result.error);
  };
  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>
          <form noValidate onSubmit={handleSubmit} className={'space-y-6'}>
            <div className="form-control">
              <label htmlFor="login-email">
                <span className={'label-text font-medium'}>Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={'h-5 w-5 text-base-content/40'} />
                </div>
                <input
                  id="login-email"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  type={'email'}
                  className={'input input-bordered w-full pl-10'}
                  placeholder={'you@example.com'}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            {errors.email && <p id="login-email-error" role="alert" className="text-error text-sm">{errors.email}</p>}
            <div className={'form-control'}>
              <label htmlFor="login-password" className={'label-text font-medium'}>Password</label>
              <div className="relative">
                <div
                  className={
                    'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'
                  }
                >
                  <Lock className={'h-5 w-5 text-base-content/40'} />
                </div>
                <input
                  id="login-password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  type={showPassword ? 'text' : 'password'}
                  className={'input input-bordered w-full pl-10'}
                  placeholder={'••••••••'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {errors.password && <p id="login-password-error" role="alert" className="text-error text-sm">{errors.password}</p>}
            {submitError && <p role="alert" className="alert alert-error">{submitError}</p>}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={'Welcome back!'}
        subtitle={
          'Sign in to continue your conversations and catch up with your messages.'
        }
      />
    </div>
  );
}

export default LoginPage;

