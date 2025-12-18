import { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, Phone, Cake, Heart, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { encryptData, encryptArray } from '../utils/encryption';

const MENTAL_HEALTH_TRIGGERS = [
  'Anxiety',
  'Depression',
  'Eating Disorders',
  'Self-Harm',
  'Substance Abuse',
  'Trauma/PTSD',
  'Suicidal Thoughts',
  'Relationship Issues',
  'Academic Stress',
  'Financial Stress',
  'Grief/Loss',
  'Social Anxiety',
  'Body Image',
  'Sleep Issues',
  'OCD',
  'Panic Attacks'
];

export default function AccountSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    phone: '',
    age: '',
    bio: '',
    preferences: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.currentUser) {
      navigate('/signin');
    }
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.phone.trim()) {
        console.log('Phone number is empty');
        setError('Phone number is required');
        setLoading(false);
        return;
      }

      console.log('Phone validation passed');
      let profileImageUrl = '';

      // Upload profile image if provided
      if (profileImage) {
        console.log('Uploading profile image');
        const user = auth.currentUser;
        if (!user) {
          console.log('User not authenticated (image upload)');
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        try {
          const imageRef = ref(storage, `profile-pictures/${user.uid}/${profileImage.name}`);
          console.log('Image ref:', imageRef.toString());
          await uploadBytes(imageRef, profileImage);
          profileImageUrl = await getDownloadURL(imageRef);
          console.log('Image uploaded:', profileImageUrl);
        } catch (uploadErr: any) {
          console.warn('Failed to upload profile image:', uploadErr);
          console.warn('Continuing without profile image');
          // Continue without image - don't fail the whole setup
        }
      }

      // Create user profile in Firestore
      const user = auth.currentUser;
      console.log('Current user:', user);
      if (!user) {
        console.log('User not authenticated (firestore)');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Encryption key is the user's UID
      const encryptionKey = user.uid;
      console.log('Using encryption key:', encryptionKey);

      // Encrypt sensitive fields
      const encryptedPhone = encryptData(formData.phone, encryptionKey);
      const encryptedAge = formData.age 
        ? encryptData(formData.age, encryptionKey) 
        : null;
      const encryptedTriggers = encryptArray(selectedTriggers, encryptionKey);

      console.log('Sensitive data encrypted');

      const profileData = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        // Encrypted sensitive data
        phone: encryptedPhone,
        age: encryptedAge,
        triggers: encryptedTriggers,
        // Non-sensitive data (unencrypted)
        profileImageUrl: profileImageUrl,
        bio: formData.bio,
        preferences: formData.preferences,
        setupCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Profile data prepared (with encrypted fields)');

      // Add document with random ID in Users collection
      const usersCollectionRef = collection(db, 'Users');
      console.log('Adding document to Firestore');
      const docRef = await addDoc(usersCollectionRef, profileData);
      console.log('Document added with ID:', docRef.id);

      setSuccess('Profile setup completed! Redirecting to home...');
      setLoading(false);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Error setting up profile:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      
      let errorMessage = 'An error occurred while setting up your profile';
      
      if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules. Make sure authenticated users can write to the Users collection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              Complete Your Profile
            </h1>
            <p className="text-white/70 text-sm">
              Help us personalize your mental health journey
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={32} className="text-white/50" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 transition-colors"
                  />
                  <p className="text-white/40 text-xs mt-2">Optional - PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Phone Number - Required */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Age</label>
              <div className="relative">
                <Cake className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  min="13"
                  max="120"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
              <textarea
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Mental Health Triggers */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Heart size={18} />
                Topics to Avoid (Select any that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {MENTAL_HEALTH_TRIGGERS.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`p-3 rounded-2xl text-sm font-medium transition-all border ${
                      selectedTriggers.includes(trigger)
                        ? 'bg-pink-500/40 border-pink-500/60 text-white'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <FileText size={18} />
                Additional Preferences
              </label>
              <textarea
                placeholder="Share any other preferences or information that would help personalize your experience..."
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:opacity-50 backdrop-blur-md text-white font-semibold rounded-full py-3 transition-all duration-300 border border-white/30 shadow-lg mt-6"
            >
              {loading ? 'Completing Setup...' : 'Complete Profile Setup'}
            </button>

            <p className="text-white/40 text-xs text-center">
              You can update this information anytime from your profile settings
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
