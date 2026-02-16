import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'
import CostSlider from '../components/CostSlider'
import BigMacInfo from '../components/BigMacInfo'
import MonthlyCostsSummary from '../components/MonthlyCostsSummary'
import { getCityConfig } from '../lib/cityConfig'
import { fetchMe, saveProfile } from '../lib/api'
import type { UserProfile } from '../types/user'
import type { CostSliderConfig } from '../lib/cityConfig'

export default function CostOfLivingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Housing type selection
  const [housingType, setHousingType] = useState<string>('shared-room')
  
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
          // Load saved housing type or use default
          const savedHousingType = data.profile?.housingType || 'shared-room'
          setHousingType(savedHousingType)
          
          // Get the housing type config for defaults
          const housingTypeConfig = config.housingTypes.find(ht => ht.id === savedHousingType)
          const defaultRent = housingTypeConfig?.default ?? config.rent.default
          
          // Use saved values if they exist, otherwise use defaults
          setRentCost(data.profile?.rentCost ?? defaultRent)
          setUtilitiesCost(data.profile?.utilitiesCost ?? config.utilities.default)
          setInternetCost(data.profile?.internetCost ?? config.internet.default)
          setMobileCost(data.profile?.mobileCost ?? config.mobile.default)
          setTransportCost(data.profile?.transportCost ?? config.transport.default)
          setGroceriesCost(data.profile?.groceriesCost ?? config.groceries.default)
          setDiningOutCost(data.profile?.diningOutCost ?? config.diningOut.default)
          setEntertainmentCost(data.profile?.entertainmentCost ?? config.entertainment.default)
          setClothingCost(data.profile?.clothingCost ?? config.clothing.default)
          setPersonalCareCost(data.profile?.personalCareCost ?? config.personalCare.default)
          setBooksCost(data.profile?.booksCost ?? config.books.default)
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

  // Update rent cost when housing type changes
  useEffect(() => {
    if (isLoading || !cityConfig) return
    
    const housingTypeConfig = cityConfig.housingTypes.find(ht => ht.id === housingType)
    if (housingTypeConfig) {
      setRentCost(housingTypeConfig.default)
    }
  }, [housingType, cityConfig, isLoading])

  // Debounced save function
  const debouncedSave = useCallback(async (costData: Partial<UserProfile>) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set a new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        await saveProfile(costData)
        console.log('Cost data saved successfully')
      } catch (error) {
        console.error('Error saving cost data:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000) // Wait 1 second after last change before saving
  }, [])

  // Save cost data whenever any cost value changes
  useEffect(() => {
    // Don't save during initial load
    if (isLoading) return

    const costData = {
      housingType,
      rentCost,
      utilitiesCost,
      internetCost,
      mobileCost,
      transportCost,
      groceriesCost,
      diningOutCost,
      entertainmentCost,
      clothingCost,
      personalCareCost,
      booksCost,
    }

    debouncedSave(costData)

    // Cleanup function to clear timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [
    housingType,
    rentCost,
    utilitiesCost,
    internetCost,
    mobileCost,
    transportCost,
    groceriesCost,
    diningOutCost,
    entertainmentCost,
    clothingCost,
    personalCareCost,
    booksCost,
    isLoading,
    debouncedSave,
  ])

  // Get dynamic rent config based on selected housing type
  const getRentConfig = (): CostSliderConfig => {
    if (!cityConfig) {
      return {
        min: 0,
        max: 0,
        default: 0,
        step: 10,
        label: 'Rent',
        description: '',
      }
    }
    
    const housingTypeConfig = cityConfig.housingTypes.find(ht => ht.id === housingType)
    if (housingTypeConfig) {
      return {
        min: housingTypeConfig.min,
        max: housingTypeConfig.max,
        default: housingTypeConfig.default,
        step: 10,
        label: cityConfig.rent.label,
        description: cityConfig.rent.description,
      }
    }
    
    return cityConfig.rent
  }

  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
        stepLabel="Step 12"
        title="Cost of Living"
        subtitle={
          <div className="flex items-center gap-2">
            <span>Estimate expenses and build a realistic monthly budget.</span>
            {isSaving && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            )}
          </div>
        }
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
            {/* Big Mac Info */}
            <div className="col-span-full">
              <BigMacInfo city={city} />
            </div>

            {/* Two-column layout for Fixed and Variable costs */}
            <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fixed Costs Column */}
              <div className="space-y-6">
                {/* Fixed Costs Header */}
                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Monthly Fixed Costs
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    These fixed costs are based on your chosen city: <span className="font-semibold text-blue-700">{city}</span>.
                    Adjust each cost item between low and high budget.
                  </p>
                </article>

                {/* Fixed Cost Sliders */}
                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
                  {/* Rent with housing type selection */}
                  <div className="space-y-4">
                    <CostSlider
                      config={getRentConfig()}
                      value={rentCost}
                      onChange={setRentCost}
                      id="rent-slider"
                    />
                    
                    {/* Housing type options */}
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Housing Type
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {cityConfig.housingTypes.map((option) => (
                          <label
                            key={option.id}
                            className={`
                              flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all
                              ${
                                housingType === option.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name="housingType"
                              value={option.id}
                              checked={housingType === option.id}
                              onChange={(e) => setHousingType(e.target.value)}
                              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-900">
                                  {option.label}
                                </span>
                                <span className="text-xs text-slate-500">
                                  €{option.min}-{option.max}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {option.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {/* Link to housing page */}
                      <Link
                        to="/dashboard/housing"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Find out more about housing
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
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

              {/* Variable Costs Column */}
              <div className="space-y-6">
                {/* Variable Costs Header */}
                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Monthly Variable Costs
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    These costs vary based on your lifestyle and spending habits.
                    Adjust each item to match your expected spending.
                  </p>
                </article>

                {/* Variable Cost Sliders */}
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
