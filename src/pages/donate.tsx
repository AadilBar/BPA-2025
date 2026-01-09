export default function Donate() {
  return (
    <div className="min-h-screen bg-[#081023] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 rounded-2xl shadow-xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">
            Make a Donation
          </h1>
          <p className="text-center text-white/60 mb-8">
            Your support helps us make a difference. Every contribution counts!
          </p>
          
          <div className="w-full">
            <iframe 
              src="https://buy.stripe.com/test_6oU14mfS88iifOk8ww" 
              className="w-full h-[600px] border-0 rounded-lg"
              title="Stripe Donation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
