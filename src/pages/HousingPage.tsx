import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'
import FindYourNeighborhood from '../components/FindYourNeighborhood'
import { fetchMe } from '../lib/api'
import type { UserProfile } from '../types/user'

export default function HousingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchMe()
        setProfile(data.profile || {})
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
        stepLabel="Step 6"
        title="Find your apartment"
        subtitle="Discover the perfect neighborhood and secure a place to live."
        checklistPageType="housing"
        infoBox={
          <UserInfoBox
            title="Your Housing Information"
            fields={[
              { key: 'destinationCity', label: 'City' },
              { key: 'universityName', label: 'University' },
              { key: 'accommodationType', label: 'Housing Type' },
              { key: 'housingBudget', label: 'Budget' },
              { key: 'leaseStart', label: 'Lease Start', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'startDate', label: 'Program Start', formatter: (val) => val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Not set' },
            ]}
          />
        }
      >
        {isLoading ? (
          <div className="col-span-full">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            </article>
          </div>
        ) : (
          <FindYourNeighborhood profile={profile} />
        )}
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
