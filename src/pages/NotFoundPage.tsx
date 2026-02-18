import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full text-center">
        {/* Image */}
        <div className="mb-8">
          <img 
            src="/assets/404page.jpg" 
            alt="Lost in space" 
            className="mx-auto max-w-md w-full rounded-2xl shadow-lg"
          />
        </div>

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
          Oops! 404
        </h1>

        {/* Message */}
        <div className="space-y-4 mb-8">
          <p className="text-2xl md:text-3xl font-semibold text-slate-900">
            We've lost our way
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Even the best explorers lose their way sometimes. The page you're looking for seems to have wandered off into the digital wilderness.
          </p>
        </div>

        {/* Fun fact card */}
        <div className="bg-white rounded-xl p-6 mb-8 max-w-2xl mx-auto shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">Fun fact:</strong> You're not alone! Even Columbus thought he was in India when he discovered America. At least you're just a click away from home!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Take Me Home
          </Link>
          
          <Link 
            to="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-300 hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Footer message */}
        <div className="mt-12">
          <button 
            onClick={() => window.history.back()} 
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            ← Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}
