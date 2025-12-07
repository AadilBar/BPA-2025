import { useState, useEffect } from 'react';
import { X, Phone, MessageCircle, AlertCircle } from 'lucide-react';

const MentalHealthPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Always show popup on page load
    setIsOpen(true);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/20 max-w-sm w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-lg">Need Immediate Help?</h2>
            <p className="text-white/80 text-sm mt-1">Crisis support available 24/7</p>
          </div>
          <button
            onClick={closePopup}
            className="text-white/90 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all duration-200"
            aria-label="Close popup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3 hover:bg-white/10 transition-all duration-200">
            <div className="flex items-start gap-3">
              <Phone className="text-white/80 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-white drop-shadow-md">988 Suicide & Crisis Lifeline</p>
                <p className="text-white/70 text-sm font-medium">Call or text 988</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3 hover:bg-white/10 transition-all duration-200">
            <div className="flex items-start gap-3">
              <MessageCircle className="text-white/80 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-white drop-shadow-md">Crisis Text Line</p>
                <p className="text-white/70 text-sm font-medium">Text HOME to 741741</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3 hover:bg-white/10 transition-all duration-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-white/80 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-white drop-shadow-md">SAMHSA Helpline</p>
                <p className="text-white/70 text-sm font-medium">1-800-662-4357 (free, 24/7)</p>
              </div>
            </div>
          </div>

          <button
            onClick={closePopup}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-300 border border-white/30 shadow-lg mt-4 drop-shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPopup;
