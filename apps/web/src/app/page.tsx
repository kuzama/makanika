import Link from 'next/link';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            Find Trusted Mechanics<br />in Harare
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
            Search verified car mechanics by location, car type, and speciality.
            Read reviews, compare prices, and get your car fixed by the best.
          </p>
          <Link
            href="/mechanics"
            className="inline-block bg-green-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Browse Mechanics
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100">
            <div className="text-4xl mb-4" aria-hidden="true">📍</div>
            <h2 className="text-xl font-semibold mb-2">Find Nearby</h2>
            <p className="text-gray-600">
              Locate car mechanics near you using our map-based search. Filter by distance and find the closest help.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100">
            <div className="text-4xl mb-4" aria-hidden="true">✅</div>
            <h2 className="text-xl font-semibold mb-2">Verified Mechanics</h2>
            <p className="text-gray-600">
              All mechanics go through a verification process. Look for the verified badge for trusted service.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100">
            <div className="text-4xl mb-4" aria-hidden="true">⭐</div>
            <h2 className="text-xl font-semibold mb-2">Read Reviews</h2>
            <p className="text-gray-600">
              See what other customers say. Honest ratings and reviews help you choose the right mechanic.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-12 md:mt-16" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">
          <p>Makanika</p>
        </div>
      </footer>
    </div>
  );
}
