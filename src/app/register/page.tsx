'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Home } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: cleanEmail,
        password,
      });

      if (result?.error) {
        window.location.href = '/login';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
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
          <p className="auth-subtitle text-center text-text-secondary mb-6">Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="text-danger mb-4 text-center text-sm">{error}</div>}

          <div className="form-group mb-4">
            <label className="form-label block mb-1 text-sm font-medium" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="form-input w-full p-2 border border-border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div className="form-group mb-4">
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
          
          <div className="form-group mb-6">
            <label className="form-label block mb-1 text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input w-full p-2 border border-border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg w-full py-3 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-colors"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer mt-6 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
