import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'customer') {
        navigate('/customer-dashboard');
      } else if (user.role === 'agent') {
        navigate('/agent-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = await login({ email, password });
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'customer') {
        navigate('/customer-dashboard');
      } else if (profile.role === 'agent') {
        navigate('/agent-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl shadow-black/20">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">Welcome back</p>
        <h1 className="text-3xl font-semibold">Sign in to your account</h1>
        <p className="text-slate-400">Use your credentials to access the delivery management workspace.</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Password</span>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 pr-28 text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{' '}
        <button type="button" className="font-semibold text-cyan-400 hover:text-cyan-300" onClick={() => navigate('/register')}>
          Create an account
        </button>
      </p>
    </section>
  );
}

export default Login;
