import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import AppLayout from './components/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import MySituationPage from './pages/MySituationPage'
import UniversityApplicationPage from './pages/UniversityApplicationPage'
import StudentVisaPage from './pages/StudentVisaPage'
import BeforeDeparturePage from './pages/BeforeDeparturePage'
import ImmigrationRegistrationPage from './pages/ImmigrationRegistrationPage'
import ArrivalFirstDaysPage from './pages/ArrivalFirstDaysPage'
import HousingPage from './pages/HousingPage'
import LegalBankingInsurancePage from './pages/LegalBankingInsurancePage'
import HealthcarePage from './pages/HealthcarePage'
import InformationCentrePage from './pages/InformationCentrePage'
import DailyLifePage from './pages/DailyLifePage'
import CostOfLivingPage from './pages/CostOfLivingPage'
import OnboardingStart from './onboarding/pages/OnboardingStart'
import Step1Destination from './onboarding/pages/Step1Destination'
import Step2Origin from './onboarding/pages/Step2Origin'
import Step3Program from './onboarding/pages/Step3Program'
import Step4Admission from './onboarding/pages/Step4Admission'
import Step5Visa from './onboarding/pages/Step5Visa'
import Step6Budget from './onboarding/pages/Step6Budget'
import Step7Housing from './onboarding/pages/Step7Housing'
import Step8ReviewFinish from './onboarding/pages/Step8ReviewFinish'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthGate>
              <DashboardPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/university-application"
          element={
            <AuthGate>
              <UniversityApplicationPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/student-visa"
          element={
            <AuthGate>
              <StudentVisaPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/before-departure"
          element={
            <AuthGate>
              <BeforeDeparturePage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/immigration-registration"
          element={
            <AuthGate>
              <ImmigrationRegistrationPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/arrival-first-days"
          element={
            <AuthGate>
              <ArrivalFirstDaysPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/housing"
          element={
            <AuthGate>
              <HousingPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/legal-banking-insurance"
          element={
            <AuthGate>
              <LegalBankingInsurancePage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/healthcare"
          element={
            <AuthGate>
              <HealthcarePage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/information-centre"
          element={
            <AuthGate>
              <InformationCentrePage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/daily-life"
          element={
            <AuthGate>
              <DailyLifePage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/cost-of-living"
          element={
            <AuthGate>
              <CostOfLivingPage />
            </AuthGate>
          }
        />
        <Route
          path="/my-situation"
          element={
            <AuthGate>
              <MySituationPage />
            </AuthGate>
          }
        />
        <Route path="/onboarding" element={<OnboardingStart />} />
        <Route path="/onboarding/1" element={<Step1Destination />} />
        <Route path="/onboarding/2" element={<Step2Origin />} />
        <Route path="/onboarding/3" element={<Step3Program />} />
        <Route path="/onboarding/4" element={<Step4Admission />} />
        <Route path="/onboarding/5" element={<Step5Visa />} />
        <Route path="/onboarding/6" element={<Step6Budget />} />
        <Route path="/onboarding/7" element={<Step7Housing />} />
        <Route path="/onboarding/8" element={<Step8ReviewFinish />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
