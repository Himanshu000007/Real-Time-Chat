import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP } from '../api/auth';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOTP({ email, otp });
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00a884]">Verify your email</h1>
          <p className="text-gray-400 mt-1">We sent a 6-digit code to {email}</p>
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
            <label className="block text-gray-300 text-sm font-medium mb-1">OTP</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#2a3942] text-white border border-gray-600 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none text-center text-2xl tracking-[0.5em]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#00a884] text-white font-semibold hover:bg-[#06cf9c] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <p className="text-center text-gray-400 text-sm">
            Wrong email?{' '}
            <Link to="/signup" className="text-[#00a884] hover:underline">
              Sign up again
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
