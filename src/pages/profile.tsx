import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { getUserProfile } from '../utils/profileHelpers';
import { Mail, Phone, Cake, FileText, Heart, LogOut, Edit } from 'lucide-react';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.currentUser) {
        navigate('/signin');
        return;
      }

      try {
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
        } else {
          setError('Could not load profile');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <div className="text-white text-xl">{error || 'Profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20 mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
              Your Profile
            </h1>
            <p className="text-white/70">All your account information</p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            {userProfile?.profileImageUrl ? (
              <img
                src={userProfile.profileImageUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 mb-4 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center mb-4">
                <span className="text-white/50 text-6xl">👤</span>
              </div>
            )}
            <h2 className="text-3xl font-bold text-white">{userProfile?.displayName || 'User'}</h2>
            <p className="text-white/60 text-sm">{userProfile?.email}</p>
          </div>

          {/* Information Grid - 3/1 layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:grid-flow-col md:auto-cols-fr">
            {/* Email */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center items-center min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={20} className="text-white/70" />
                <label className="text-white/70 text-sm font-medium">Email</label>
              </div>
              <p className="text-white font-normal text-center break-words text-xs md:text-sm w-full max-w-[180px] md:max-w-[220px] truncate" title={userProfile?.email}>{userProfile?.email}</p>
            </div>

            {/* Phone */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center items-center min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Phone size={20} className="text-white/70" />
                <label className="text-white/70 text-sm font-medium">Phone</label>
              </div>
              <p className="text-white font-semibold text-center break-words w-full max-w-[180px] md:max-w-[220px] truncate" title={userProfile?.phone}>{userProfile?.phone || 'Not provided'}</p>
            </div>

            {/* Age */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center items-center min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Cake size={20} className="text-white/70" />
                <label className="text-white/70 text-sm font-medium">Age</label>
              </div>
              <p className="text-white font-semibold text-center break-words w-full max-w-[180px] md:max-w-[220px] truncate" title={userProfile?.age}>{userProfile?.age ? userProfile.age : 'Not provided'}</p>
            </div>
          </div>

          {/* Bio Section */}
          {userProfile?.bio && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={20} className="text-white/70" />
                <label className="text-white/70 text-sm font-medium">Bio</label>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white">{userProfile.bio}</p>
              </div>
            </div>
          )}

          {/* Triggers Section */}
          {userProfile?.triggers && userProfile.triggers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Heart size={20} className="text-white/70" />
                <label className="text-white/70 text-sm font-medium">Topics to Avoid</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.triggers.map((trigger: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-pink-500/20 border border-pink-500/50 text-white rounded-full text-sm font-medium"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {userProfile?.preferences && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={20} className="text-white/70" />
                <label className="text-white/70 text-sm font-medium">Preferences</label>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white">{userProfile.preferences}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => navigate('/accountsetup')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg"
            >
              <Edit size={18} />
              Edit Profile
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-red-500/30 shadow-lg"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
