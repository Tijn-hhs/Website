import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthGate } from './components/AuthGate'
import { AdminGate } from './components/AdminGate'
import AppLayout from './components/AppLayout'
import DashboardLayout from './components/DashboardLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import MySituationPage from './pages/MySituationPage'
import UniversityApplicationPage from './pages/UniversityApplicationPage'
import FundingScholarshipPage from './pages/FundingScholarshipPage'
import StudentVisaPage from './pages/StudentVisaPage'
import CodiceFiscalePage from './pages/CodiceFiscalePage'
import BeforeDeparturePage from './pages/BeforeDeparturePage'
import ImmigrationRegistrationPage from './pages/ImmigrationRegistrationPage'
import HousingPage from './pages/HousingPage'
import BankingPage from './pages/BankingPage'
import InsurancePage from './pages/InsurancePage'
import HealthcarePage from './pages/HealthcarePage'
import InformationCentrePage from './pages/InformationCentrePage'
import CostOfLivingPage from './pages/CostOfLivingPage'
import BuddySystemPage from './pages/BuddySystemPage'
import AISupportPage from './pages/AISupportPage'
import FindYourPeersPage from './pages/FindYourPeersPage'
import BlogOverviewPage from './pages/BlogOverviewPage'
import BlogPostPage from './pages/BlogPostPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingStart from './onboarding/pages/OnboardingStart'
import Step0Welcome from './onboarding/pages/Step0Welcome'
import Step1Destination from './onboarding/pages/Step1Destination'
import Step2Origin from './onboarding/pages/Step2Origin'
import Step3Program from './onboarding/pages/Step3Program'
import Step3bApplication from './onboarding/pages/Step3bApplication'
import Step5Visa from './onboarding/pages/Step5Visa'
import Step6Budget from './onboarding/pages/Step6Budget'
import Step8ReviewFinish from './onboarding/pages/Step8ReviewFinish'
import OnboardingBuildingPage from './pages/OnboardingBuildingPage'
import ModuleGate from './components/ModuleGate'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Public Blog Routes */}
        <Route path="/blog" element={<BlogOverviewPage />} />
        <Route path="/blog/:postId" element={<BlogPostPage />} />
        
        {/* ── Dashboard pages — shared persistent sidebar/layout ── */}
        <Route element={<AuthGate><DashboardLayout /></AuthGate>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/university-application" element={<UniversityApplicationPage />} />
          <Route path="/dashboard/funding-scholarships" element={<FundingScholarshipPage />} />
          <Route path="/dashboard/student-visa" element={<ModuleGate moduleRoute="/dashboard/student-visa"><StudentVisaPage /></ModuleGate>} />
          <Route path="/dashboard/codice-fiscale" element={<CodiceFiscalePage />} />
          <Route path="/dashboard/before-departure" element={<BeforeDeparturePage />} />
          <Route path="/dashboard/immigration-registration" element={<ModuleGate moduleRoute="/dashboard/immigration-registration"><ImmigrationRegistrationPage /></ModuleGate>} />
          <Route path="/dashboard/housing" element={<HousingPage />} />
          <Route path="/dashboard/banking" element={<BankingPage />} />
          <Route path="/dashboard/insurance" element={<InsurancePage />} />
          <Route path="/dashboard/healthcare" element={<HealthcarePage />} />
          <Route path="/dashboard/information-centre" element={<InformationCentrePage />} />
          <Route path="/dashboard/cost-of-living" element={<CostOfLivingPage />} />
          <Route path="/dashboard/buddy-system" element={<BuddySystemPage />} />
          <Route path="/dashboard/ai-support" element={<AISupportPage />} />
          <Route path="/dashboard/find-your-peers" element={<FindYourPeersPage />} />
          <Route path="/my-situation" element={<MySituationPage />} />
        </Route>
        {/* Blog pages — use their own Header, no sidebar */}
        <Route path="/dashboard/blog" element={<AuthGate><BlogOverviewPage /></AuthGate>} />
        <Route path="/dashboard/blog/:postId" element={<AuthGate><BlogPostPage /></AuthGate>} />
        {/* ── Admin (hidden from all navigation) ── */}
        <Route
          path="/internal/mgmt"
          element={
            <AdminGate>
              <AdminDashboardPage />
            </AdminGate>
          }
        />

        <Route path="/onboarding" element={<OnboardingStart />} />
        <Route path="/onboarding/0" element={<Step0Welcome />} />
        <Route path="/onboarding/1" element={<Step1Destination />} />
        <Route path="/onboarding/2" element={<Step2Origin />} />
        <Route path="/onboarding/3" element={<Step3Program />} />
        <Route path="/onboarding/3b" element={<Step3bApplication />} />
        <Route path="/onboarding/5" element={<Step5Visa />} />
        <Route path="/onboarding/6" element={<Step6Budget />} />
        <Route path="/onboarding/8" element={<Step8ReviewFinish />} />
        <Route path="/onboarding/building" element={<OnboardingBuildingPage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
