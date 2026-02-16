import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'
import CostSlider from '../components/CostSlider'
import BigMacInfo from '../components/BigMacInfo'
import MonthlyCostsSummary from '../components/MonthlyCostsSummary'
import { getCityConfig } from '../lib/cityConfig'
import { fetchMe } from '../lib/api'
import type { UserProfile } from '../types/user'

export default function CostOfLivingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // State voor slider waarden - Fixed costs
  const [rentCost, setRentCost] = useState(0)
  const [utilitiesCost, setUtilitiesCost] = useState(0)
  const [internetCost, setInternetCost] = useState(0)
  const [mobileCost, setMobileCost] = useState(0)
  const [transportCost, setTransportCost] = useState(0)
  
  // State voor slider waarden - Variable costs
  const [groceriesCost, setGroceriesCost] = useState(0)
  const [diningOutCost, setDiningOutCost] = useState(0)
  const [entertainmentCost, setEntertainmentCost] = useState(0)
  const [clothingCost, setClothingCost] = useState(0)
  const [personalCareCost, setPersonalCareCost] = useState(0)
  const [booksCost, setBooksCost] = useState(0)

  // Haal user data op
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchMe()
        setProfile(data.profile || {})
        
        // Haal city config op en initialiseer defaults
        const city = data.profile?.destinationCity
        const config = getCityConfig(city)
        
        if (config) {
          setRentCost(config.rent.default)
          setUtilitiesCost(config.utilities.default)
          setInternetCost(config.internet.default)
          setMobileCost(config.mobile.default)
          setTransportCost(config.transport.default)
          setGroceriesCost(config.groceries.default)
          setDiningOutCost(config.diningOut.default)
          setEntertainmentCost(config.entertainment.default)
          setClothingCost(config.clothing.default)
          setPersonalCareCost(config.personalCare.default)
          setBooksCost(config.books.default)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const city = profile?.destinationCity
  const cityConfig = getCityConfig(city)

  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
        stepLabel="Step 12"
        title="Cost of Living"
        subtitle="Estimate expenses and build a realistic monthly budget."
        checklistPageType="cost-of-living"
        infoBox={
          <UserInfoBox
            title="Your Budget Information"
            fields={[
              { key: 'destinationCity', label: 'City' },
              { key: 'monthlyBudget', label: 'Monthly Budget' },
              { key: 'budgetCurrency', label: 'Currency' },
              { key: 'housingBudget', label: 'Housing Budget' },
              { key: 'accommodationType', label: 'Housing Type' },
            ]}
          />
        }
      >
        {/* Vaste maandelijkse kosten sectie */}
        {isLoading ? (
          <div className="col-span-full">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            </article>
          </div>
        ) : !city ? (
          <div className="col-span-full">
            <article className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">No city selected</h2>
              <p className="mt-2 text-sm text-slate-700">
                Please select a city in your profile first to view cost estimates.
              </p>
            </article>
          </div>
        ) : !cityConfig ? (
          <div className="col-span-full">
            <article className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">City not supported</h2>
              <p className="mt-2 text-sm text-slate-700">
                We don't have cost data available for {city} yet.
                We're working on adding more cities!
              </p>
            </article>
          </div>
        ) : (
          <>
            {/* Header tekst */}
            <div className="col-span-full">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Monthly Fixed Costs
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  These fixed costs are based on your chosen city: <span className="font-semibold text-blue-700">{city}</span>.
                  Adjust each cost item between low and high budget.
                  These are recurring monthly expenses.
                </p>
              </article>
            </div>

            {/* Big Mac Info */}
            <div className="col-span-full">
              <BigMacInfo city={city} />
            </div>

            {/* Sliders */}
            <div className="col-span-full">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
                <CostSlider
                  config={cityConfig.rent}
                  value={rentCost}
                  onChange={setRentCost}
                  id="rent-slider"
                />
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.utilities}
                    value={utilitiesCost}
                    onChange={setUtilitiesCost}
                    id="utilities-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.internet}
                    value={internetCost}
                    onChange={setInternetCost}
                    id="internet-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.mobile}
                    value={mobileCost}
                    onChange={setMobileCost}
                    id="mobile-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.transport}
                    value={transportCost}
                    onChange={setTransportCost}
                    id="transport-slider"
                  />
                </div>
              </article>
            </div>

            {/* Variable Costs section */}
            <div className="col-span-full mt-8">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Monthly Variable Costs
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  These costs vary based on your lifestyle and spending habits.
                  Adjust each item to match your expected spending.
                </p>
              </article>
            </div>

            {/* Variable cost sliders */}
            <div className="col-span-full">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
                <CostSlider
                  config={cityConfig.groceries}
                  value={groceriesCost}
                  onChange={setGroceriesCost}
                  id="groceries-slider"
                />
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.diningOut}
                    value={diningOutCost}
                    onChange={setDiningOutCost}
                    id="dining-out-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.entertainment}
                    value={entertainmentCost}
                    onChange={setEntertainmentCost}
                    id="entertainment-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.clothing}
                    value={clothingCost}
                    onChange={setClothingCost}
                    id="clothing-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.personalCare}
                    value={personalCareCost}
                    onChange={setPersonalCareCost}
                    id="personal-care-slider"
                  />
                </div>
                
                <div className="border-t border-slate-200 pt-8">
                  <CostSlider
                    config={cityConfig.books}
                    value={booksCost}
                    onChange={setBooksCost}
                    id="books-slider"
                  />
                </div>
              </article>
            </div>

            {/* Kostenoverzicht */}
            <div className="col-span-full">
              <MonthlyCostsSummary
                fixedCosts={{
                  rent: rentCost,
                  utilities: utilitiesCost,
                  internet: internetCost,
                  mobile: mobileCost,
                  transport: transportCost,
                }}
                variableCosts={{
                  groceries: groceriesCost,
                  diningOut: diningOutCost,
                  entertainment: entertainmentCost,
                  clothing: clothingCost,
                  personalCare: personalCareCost,
                  books: booksCost,
                }}
              />
            </div>
          </>
        )}
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
