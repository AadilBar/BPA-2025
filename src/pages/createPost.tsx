import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, AlertCircle } from 'lucide-react';
import { db, auth } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

export default function CreatePost() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Uplifty',
    tags: [] as string[],
    triggers: [] as string[]
  });

  const categories = ['Uplifty', 'Depression', 'Relationships', 'Recovery', 'Self-Care'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const handleTagInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.slice(0, -1)
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title for your post');
      return;
    }

    if (!formData.content.trim()) {
      setError('Please enter content for your post');
      return;
    }

    if (!auth.currentUser) {
      setError('You must be signed in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the post document - store only userId, not author name/avatar
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        triggers: formData.triggers,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        replies: 0,
        likes: 0,
        views: 0,
        isPinned: false
      };

      // Add to Firestore
      await addDoc(collection(db, 'forum'), postData);

      setSuccessMessage('Post created successfully!');
      
      // Redirect to forum after a short delay
      setTimeout(() => {
        navigate('/forum');
      }, 1500);

    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/forum');
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">Create New Discussion</h1>
          <p className="text-white/70 text-lg">Share your thoughts and connect with the community</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="text-green-400 flex-shrink-0 mt-0.5">✓</div>
              <p className="text-green-200 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-white font-semibold mb-2">
                Discussion Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a clear, descriptive title..."
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all"
                disabled={isSubmitting}
                maxLength={200}
              />
              <p className="text-white/50 text-xs mt-1">{formData.title.length}/200 characters</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-white font-semibold mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/40 cursor-pointer backdrop-blur-md transition-all appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center'
                }}
                disabled={isSubmitting}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#6A1E55] text-white">{cat}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-white font-semibold mb-2">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Share your thoughts, experiences, or questions... Be respectful and supportive."
                className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all resize-none"
                rows={8}
                disabled={isSubmitting}
                maxLength={5000}
              />
              <p className="text-white/50 text-xs mt-1">{formData.content.length}/5000 characters</p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-white font-semibold mb-2">
                Tags (optional)
              </label>
              <div className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 min-h-[48px] flex flex-wrap gap-2 items-center">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/20 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 border border-white/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder={formData.tags.length === 0 ? "Type a tag and press space..." : ""}
                  className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-white placeholder-white/50"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-white/50 text-xs mt-1">Press space to add a tag, backspace to remove</p>
            </div>

            {/* Triggers */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Content Warnings / Triggers (optional)
              </label>
              <p className="text-white/50 text-xs mb-3">Select any sensitive topics that your post mentions</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MENTAL_HEALTH_TRIGGERS.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      formData.triggers.includes(trigger)
                        ? 'bg-white/30 text-white border-white/50 shadow-lg'
                        : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Guidelines Reminder */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-2 text-sm">Community Guidelines Reminder</h3>
              <ul className="space-y-1 text-white/60 text-xs">
                <li>• Be respectful and kind to all members</li>
                <li>• Keep discussions supportive and constructive</li>
                <li>• Respect confidentiality and privacy</li>
                <li>• Avoid giving medical advice - share experiences instead</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full px-6 py-3 transition-all duration-300 border border-white/30 shadow-lg flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                {isSubmitting ? 'Creating...' : 'Create Discussion'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/80 font-semibold rounded-full px-6 py-3 transition-all duration-300 border border-white/20 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md">Tips for Great Discussions</h3>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400">💡</span>
              <span>Use a clear, specific title that describes your topic</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">💡</span>
              <span>Provide context and details to help others understand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">💡</span>
              <span>Add relevant tags to increase visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">💡</span>
              <span>Mark triggers to help members navigate content safely</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
