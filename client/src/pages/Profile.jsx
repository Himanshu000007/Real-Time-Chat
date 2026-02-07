import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to chats
          </Link>
        </div>
        <div className="bg-[#1f2c34] rounded-lg p-6 space-y-4">
          <h1 className="text-xl font-semibold text-[#00a884]">Profile</h1>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#00a884] flex items-center justify-center text-2xl font-semibold text-white">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-100">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full py-2.5 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
