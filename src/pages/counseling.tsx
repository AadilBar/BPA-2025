import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, Star, Award, Users, Filter, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  fetchCounselors,
  fetchUserAppointments,
  fetchCounselorAppointments,
  createAppointment,
  cancelAppointment,
  type Counselor,
  type Appointment,
} from '../lib/counselingService';

export default function Counseling() {
  const [userId, setUserId] = useState<string | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'online' | 'in-person'>('online');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingNotes, setBookingNotes] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('All');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const specializations = ['All', 'Anxiety & Depression', 'Trauma & PTSD', 'Family & Relationships', 'Self-Care', 'EMDR'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const counselorsData = await fetchCounselors();
        setCounselors(counselorsData);
        
        if (userId) {
          const appointments = await fetchUserAppointments(userId);
          setUserAppointments(appointments);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedCounselor) return;

      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const times = selectedCounselor.availability[dayName] || [];
      setAvailableTimes(times);

      // Fetch booked times for this counselor on this date
      const dateString = selectedDate.toISOString().split('T')[0];
      const appointments = await fetchCounselorAppointments(selectedCounselor.id, dateString);
      const booked = appointments.map(apt => apt.time);
      setBookedTimes(booked);
    };
    loadAvailability();
  }, [selectedCounselor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedCounselor || !selectedTime || !userId || !auth.currentUser) {
      alert('Please select a counselor, date, and time');
      return;
    }

    const appointment: Omit<Appointment, 'id' | 'createdAt'> = {
      counselorId: selectedCounselor.id,
      counselorName: selectedCounselor.name,
      userId: userId,
      userName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
      userEmail: auth.currentUser.email || '',
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: 50,
      type: selectedType,
      status: 'scheduled',
      notes: bookingNotes,
    };

    try {
      const appointmentId = await createAppointment(appointment);
      
      if (appointmentId) {
        alert('Appointment booked successfully!');
        
        // Close modal and reset state
        setShowBookingModal(false);
        setSelectedTime('');
        setBookingNotes('');
        setSelectedCounselor(null);
        
        // Refresh appointments with a small delay to ensure Firebase has updated
        setTimeout(async () => {
          const appointments = await fetchUserAppointments(userId);
          console.log('Fetched appointments:', appointments);
          setUserAppointments(appointments);
        }, 500);
      } else {
        alert('Failed to book appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while booking. Please try again.');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const success = await cancelAppointment(appointmentId);
      if (success) {
        alert('Appointment cancelled successfully');
        if (userId) {
          // Refresh appointments
          const appointments = await fetchUserAppointments(userId);
          console.log('Fetched appointments after cancel:', appointments);
          setUserAppointments(appointments);
        }
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('An error occurred while cancelling the appointment.');
    }
  };

  const filteredCounselors = counselors.filter(counselor => {
    if (filterSpecialization === 'All') return true;
    return counselor.tags.includes(filterSpecialization);
  });

  const nextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">Book Your Session</h1>
          <p className="text-white/70 text-lg">Connect with a compassionate professional who understands</p>
          <p className="text-white/50 text-sm mt-2">Choose a counselor, find a time that works for you. All sessions are completely confidential and designed to support your mental health journey.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-white/70" />
              <span className="text-white/70 text-sm font-medium">Specialization:</span>
            </div>
            {specializations.map(spec => (
              <button
                key={spec}
                onClick={() => setFilterSpecialization(spec)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border ${
                  filterSpecialization === spec
                    ? 'bg-white/25 text-white border-white/40 shadow-lg'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Counselors List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredCounselors.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
                <p className="text-white/70">No counselors found for this specialization.</p>
              </div>
            ) : (
              filteredCounselors.map(counselor => (
                <div
                  key={counselor.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/20 shadow-lg">
                      <img 
                        src={counselor.avatar} 
                        alt={counselor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(counselor.name)}&background=8B5CF6&color=fff&size=200`;
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{counselor.name}</h3>
                          <p className="text-white/80 text-sm">{counselor.credentials}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-semibold">{counselor.rating.toFixed(1)}</span>
                          <span className="text-white/60 text-sm">({counselor.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-white/90 font-semibold mb-2">{counselor.specialization}</p>
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{counselor.bio}</p>

                      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                        <div className="flex items-center gap-1">
                          <Award size={16} />
                          <span>{counselor.yearsExperience}+ years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>Family & Relationship Therapy</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {counselor.tags.map(tag => (
                          <span key={tag} className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/20">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCounselor(counselor);
                          setShowBookingModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-lg"
                      >
                        View Profile & Book
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Upcoming Appointments */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Your Appointments
              </h3>
              
              {!userId ? (
                <p className="text-white/60 text-sm">Please log in to view appointments</p>
              ) : userAppointments.filter(apt => apt.status === 'scheduled').length === 0 ? (
                <p className="text-white/60 text-sm">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {userAppointments
                    .filter(apt => apt.status === 'scheduled')
                    .slice(0, 3)
                    .map(appointment => (
                      <div key={appointment.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <p className="text-white font-semibold text-sm">{appointment.counselorName}</p>
                        <p className="text-white/70 text-xs mt-1">
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })} at {appointment.time}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {appointment.type === 'online' ? (
                            <Video size={14} className="text-white/50" />
                          ) : (
                            <MapPin size={14} className="text-white/50" />
                          )}
                          <span className="text-white/50 text-xs capitalize">{appointment.type}</span>
                        </div>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-400 hover:text-red-300 text-xs mt-2 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Session Info */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-bold text-white mb-4">Session Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-white/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium">Duration</p>
                    <p className="text-white/60">50 minutes per session</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Video size={16} className="text-white/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium">Online Sessions</p>
                    <p className="text-white/60">Secure video conferencing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-white/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium">In-Person</p>
                    <p className="text-white/60">Office locations available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedCounselor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0A0F2A] border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Book Session</h2>
                  <p className="text-white/70">{selectedCounselor.name}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Session Type */}
              <div className="mb-6">
                <label className="block text-white/90 text-sm font-semibold mb-3">Session Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedType('online')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                      selectedType === 'online'
                        ? 'bg-white/20 text-white border-2 border-white/40'
                        : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Video size={18} />
                    Online
                  </button>
                  <button
                    onClick={() => setSelectedType('in-person')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                      selectedType === 'in-person'
                        ? 'bg-white/20 text-white border-2 border-white/40'
                        : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <MapPin size={18} />
                    In-Person
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-white/90 text-sm font-semibold mb-3">Select Date</label>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevWeek} className="text-white/70 hover:text-white">
                    <ChevronLeft size={24} />
                  </button>
                  <span className="text-white font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextWeek} className="text-white/70 hover:text-white">
                    <ChevronRight size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() - date.getDay() + i);
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    
                    return (
                      <button
                        key={i}
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={`p-3 rounded-xl text-center transition-all ${
                          isSelected
                            ? 'bg-white/20 border-2 border-white/40'
                            : isPast
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                        }`}
                      >
                        <div className="text-white/60 text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-white font-semibold">{date.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-white/90 text-sm font-semibold mb-3">Select Time</label>
                {availableTimes.length === 0 ? (
                  <p className="text-white/60 text-sm">No available times for this date</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimes.map(time => {
                      const isBooked = bookedTimes.includes(time);
                      const isSelected = selectedTime === time;
                      
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-white/20 text-white border-2 border-white/40'
                              : isBooked
                              ? 'bg-white/5 text-white/30 line-through cursor-not-allowed'
                              : 'bg-white/5 text-white/80 hover:bg-white/10 border-2 border-transparent'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-white/90 text-sm font-semibold mb-2">Notes (Optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all resize-none"
                  placeholder="Any specific topics you'd like to discuss..."
                />
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!selectedTime || !userId}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
