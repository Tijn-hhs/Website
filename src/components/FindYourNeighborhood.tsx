import { useState } from 'react'
import { getNeighborhoodsForCity, getUniversityLocation, recommendNeighborhoods } from '../lib/neighborhoodConfig'
import NeighborhoodMap from './NeighborhoodMap'
import type { UserProfile } from '../types/user'

interface FindYourNeighborhoodProps {
  profile: UserProfile | null
}

export default function FindYourNeighborhood({ profile }: FindYourNeighborhoodProps) {
  const city = profile?.destinationCity
  const universityName = profile?.universityName

  // State for questionnaire
  const [budgetRange, setBudgetRange] = useState<'0-500' | '500-800' | '800-1100' | '1100+'>('500-800')
  const [preferWalkability, setPreferWalkability] = useState(true)
  const [nightlifePref, setNightlifePref] = useState<'quiet' | 'vibrant'>('vibrant')
  const [communityPref, setCommunityPref] = useState<'mixed' | 'student-heavy'>('mixed')
  const [vibe, setVibe] = useState<'emerging' | 'established'>('emerging')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)

  // Get neighborhoods and university location
  const neighborhoods = getNeighborhoodsForCity(city)
  const universityLocation = getUniversityLocation(city, universityName)

  // Debug logging
  console.log('[FindYourNeighborhood] Profile loaded:', { city, universityName })
  console.log('[FindYourNeighborhood] Data loaded:', { 
    neighborhoodCount: neighborhoods.length, 
    hasUniversityLocation: !!universityLocation,
    universityLocation
  })

  // Get budget value for filtering
  const budgetMap = {
    '0-500': 500,
    '500-800': 800,
    '800-1100': 1100,
    '1100+': 2000,
  }

  const recommendations = hasAnswered
    ? recommendNeighborhoods(neighborhoods, budgetMap[budgetRange], preferWalkability)
    : []

  if (!city) {
    return (
      <div className="col-span-full">
        <article className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No city selected</h2>
          <p className="mt-2 text-sm text-slate-700">
            Please select a city in your profile first to find neighborhoods.
          </p>
        </article>
      </div>
    )
  }

  return (
    <>
      {/* Section Header */}
      <div className="col-span-full">
        <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            🏘️ Find Your Neighborhood
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Every neighborhood in {city} has its own unique character. The neighborhood you choose is one of the most important decisions 
            for your student life abroad — it affects your daily commute, social life, budget, and overall experience.
          </p>
          <p className="text-base text-slate-600 leading-relaxed mt-3">
            Let's find the perfect fit for <strong>you</strong>.
          </p>
        </article>
      </div>

      {/* Map Section */}
      <div className="col-span-full">
        {universityLocation && neighborhoods.length > 0 ? (
          <article className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                📍 {city} Neighborhoods Overview
              </h3>
              <p className="text-sm text-slate-600">
                See all student neighborhoods mapped and their distance from {universityLocation.name}.
              </p>
            </div>
            
            {/* Interactive Map */}
            <NeighborhoodMap
              neighborhoods={neighborhoods}
              universityLocation={universityLocation}
            />
          </article>
        ) : (
          <article className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              {!city ? '📍 City not selected' : '📍 Setting up map...'}
            </h3>
            <div className="mt-4 space-y-2 text-sm text-slate-700 bg-white p-4 rounded border border-slate-200">
              <p><strong>Debug Info:</strong></p>
              <p>• City: <code className="bg-slate-100 px-2 py-1 rounded">{city || 'Not set'}</code></p>
              <p>• University: <code className="bg-slate-100 px-2 py-1 rounded">{universityName || 'Not set'}</code></p>
              <p>• Neighborhoods Found: <code className="bg-slate-100 px-2 py-1 rounded">{neighborhoods.length}</code></p>
              <p>• University Location: <code className="bg-slate-100 px-2 py-1 rounded">{universityLocation ? 'Found' : 'Not found'}</code></p>
            </div>
            <p className="mt-4 text-xs text-slate-600">
              Check the browser console (F12) for detailed logs. Make sure you've selected both a city and university in your profile.
            </p>
          </article>
        )}
      </div>

      {/* Quick Reference Grid */}
      {universityLocation && neighborhoods.length > 0 && (
        <div className="col-span-full">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {neighborhoods.map((neighborhood) => (
                <div
                  key={neighborhood.id}
                  className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-lg mr-2">📍</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{neighborhood.name}</p>
                    <p className="text-xs text-slate-600">{neighborhood.distanceToUniversity}</p>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {neighborhood.avgRent}
                      </span>
                      <span className="text-xs">
                        🚶 {neighborhood.walkabilityScore}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* Questionnaire Section - Step by Step */}
      {!hasAnswered && (
        <div className="col-span-full">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  🎯 Tell us what matters to you
                </h3>
                <span className="text-sm font-medium text-slate-600">
                  Question {currentQuestion + 1} of 5
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question 1: Budget */}
            {currentQuestion === 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">💰 What's your budget?</h4>
                <div className="space-y-3">
                  {[
                    { value: '0-500' as const, label: 'Under €500' },
                    { value: '500-800' as const, label: '€500-800' },
                    { value: '800-1100' as const, label: '€800-1,100' },
                    { value: '1100+' as const, label: '€1,100+' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all" style={{
                      borderColor: budgetRange === option.value ? '#1e40af' : '#e2e8f0',
                      backgroundColor: budgetRange === option.value ? '#eff6ff' : 'white',
                    }}>
                      <input
                        type="radio"
                        name="budget"
                        value={option.value}
                        checked={budgetRange === option.value}
                        onChange={(e) => setBudgetRange(e.target.value as typeof budgetRange)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Walkability */}
            {currentQuestion === 1 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">🚶 Walkability or affordability?</h4>
                <div className="space-y-3">
                  {[
                    { value: true, label: 'Walkability', sub: 'Everything nearby' },
                    { value: false, label: 'Affordability', sub: 'I\'ll use transit' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all" style={{
                      borderColor: preferWalkability === option.value ? '#1e40af' : '#e2e8f0',
                      backgroundColor: preferWalkability === option.value ? '#eff6ff' : 'white',
                    }}>
                      <input
                        type="radio"
                        name="priority"
                        value={String(option.value)}
                        checked={preferWalkability === option.value}
                        onChange={(e) => setPreferWalkability(e.target.value === 'true')}
                        className="w-4 h-4"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-600">{option.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Nightlife */}
            {currentQuestion === 2 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">🌙 Nightlife preference?</h4>
                <div className="space-y-3">
                  {[
                    { value: 'vibrant' as const, label: 'Vibrant', sub: 'Bars, clubs, social' },
                    { value: 'quiet' as const, label: 'Quiet', sub: 'Peaceful, residential' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all" style={{
                      borderColor: nightlifePref === option.value ? '#1e40af' : '#e2e8f0',
                      backgroundColor: nightlifePref === option.value ? '#eff6ff' : 'white',
                    }}>
                      <input
                        type="radio"
                        name="nightlife"
                        value={option.value}
                        checked={nightlifePref === option.value}
                        onChange={(e) => setNightlifePref(e.target.value as typeof nightlifePref)}
                        className="w-4 h-4"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-600">{option.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 4: Community */}
            {currentQuestion === 3 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">👥 Community vibe?</h4>
                <div className="space-y-3">
                  {[
                    { value: 'mixed' as const, label: 'Mixed', sub: 'Students + locals' },
                    { value: 'student-heavy' as const, label: 'Student-heavy', sub: 'Lots of students' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all" style={{
                      borderColor: communityPref === option.value ? '#1e40af' : '#e2e8f0',
                      backgroundColor: communityPref === option.value ? '#eff6ff' : 'white',
                    }}>
                      <input
                        type="radio"
                        name="community"
                        value={option.value}
                        checked={communityPref === option.value}
                        onChange={(e) => setCommunityPref(e.target.value as typeof communityPref)}
                        className="w-4 h-4"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-600">{option.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 5: Vibe */}
            {currentQuestion === 4 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">✨ Neighborhood vibe?</h4>
                <div className="space-y-3">
                  {[
                    { value: 'emerging' as const, label: 'Emerging', sub: 'New, trendy, hip' },
                    { value: 'established' as const, label: 'Established', sub: 'Historic, classic' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all" style={{
                      borderColor: vibe === option.value ? '#1e40af' : '#e2e8f0',
                      backgroundColor: vibe === option.value ? '#eff6ff' : 'white',
                    }}>
                      <input
                        type="radio"
                        name="vibe"
                        value={option.value}
                        checked={vibe === option.value}
                        onChange={(e) => setVibe(e.target.value as typeof vibe)}
                        className="w-4 h-4"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-600">{option.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="flex-1 bg-slate-200 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:bg-slate-300 transition-all"
                >
                  Back
                </button>
              )}
              {currentQuestion < 4 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="flex-1 bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setHasAnswered(true)}
                  className="flex-1 bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all"
                >
                  See Recommendations
                </button>
              )}
            </div>
          </article>
        </div>
      )}

      {/* Recommendations Section */}
      {hasAnswered && (
        <div className="col-span-full">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              ⭐ Your Perfect Neighborhoods
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Based on your preferences: €{budgetMap[budgetRange]} budget, {preferWalkability ? 'walkability-focused' : 'affordability-focused'}, 
              {nightlifePref === 'vibrant' ? ' vibrant nightlife' : ' quiet atmosphere'}, 
              {communityPref === 'mixed' ? ' mixed community' : ' student-heavy'}, 
              and {vibe === 'emerging' ? 'emerging & trendy' : 'established & classic'} vibes
            </p>

            {recommendations.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-slate-600">
                  No neighborhoods match your budget. Consider increasing your budget or adjusting your preferences.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((neighborhood, index) => (
                  <div
                    key={neighborhood.id}
                    className="border-l-4 border-blue-700 p-6 bg-gradient-to-r from-blue-50 to-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl font-bold text-blue-700">#{index + 1}</span>
                          <h4 className="text-lg font-bold text-slate-900">{neighborhood.name}</h4>
                        </div>
                        <p className="text-sm text-slate-600">{neighborhood.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Rent</p>
                        <p className="text-lg font-bold text-slate-900">{neighborhood.avgRent}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Walkability</p>
                        <p className="text-lg font-bold text-slate-900">{neighborhood.walkabilityScore}/10 🚶</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Vibe</p>
                        <p className="text-sm font-semibold text-slate-900">{neighborhood.vibe}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Distance</p>
                        <p className="text-sm font-semibold text-slate-900">{neighborhood.distanceToUniversity}</p>
                      </div>
                    </div>

                    {/* Pros and Cons based on budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">✅ Why you'll love it:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {(budgetRange === '0-500' || budgetRange === '500-800'
                            ? neighborhood.prosWithLowBudget
                            : neighborhood.prosWithHighBudget
                          ).map((pro, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Consider:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {(budgetRange === '0-500' || budgetRange === '500-800'
                            ? neighborhood.consWithLowBudget
                            : neighborhood.consWithHighBudget
                          ).map((con, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exploration Call-to-Action */}
            {recommendations.length > 0 && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700 mb-3">
                  <strong>Next step:</strong> Visit these neighborhoods in person (or virtually on Google Maps/Street View) to get a real feel for the area. 
                  Talk to current students and check out local housing portals like Immobiliare.it or Idealista for actual listings.
                </p>
              </div>
            )}
          </article>
        </div>
      )}
    </>
  )
}
