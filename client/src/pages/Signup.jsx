import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await signup(form);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00a884]">RealTime Chat</h1>
          <p className="text-gray-400 mt-1">Create your account</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-[#1f2c34] rounded-lg shadow-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[#2a3942] text-white border border-gray-600 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[#2a3942] text-white border border-gray-600 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg bg-[#2a3942] text-white border border-gray-600 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#00a884] text-white font-semibold hover:bg-[#06cf9c] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Sending OTP...' : 'Sign up'}
          </button>
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00a884] hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
