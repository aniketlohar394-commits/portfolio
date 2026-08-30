'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: cleanEmail,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err?.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon bg-primary flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-2">
            <Home size={32} color="white" />
          </div>
          <h1 className="auth-logo-title text-2xl font-bold text-center">HomeMate</h1>
          <p className="auth-subtitle text-center text-text-secondary mb-6">Your Digital Household Notebook</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="text-danger mb-4 text-center text-sm">{error}</div>}

          <div className="form-group mb-4">
            <label className="form-label block mb-1 text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input w-full p-2 border border-border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label block mb-1 text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input w-full p-2 border border-border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg w-full py-3 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer mt-6 text-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
