import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { AdminGate } from './components/AdminGate'
import AppLayout from './components/AppLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import MySituationPage from './pages/MySituationPage'
import UniversityApplicationPage from './pages/UniversityApplicationPage'
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

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Public Blog Routes */}
        <Route path="/blog" element={<BlogOverviewPage />} />
        <Route path="/blog/:postId" element={<BlogPostPage />} />
        
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
          path="/dashboard/codice-fiscale"
          element={
            <AuthGate>
              <CodiceFiscalePage />
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
          path="/dashboard/housing"
          element={
            <AuthGate>
              <HousingPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/banking"
          element={
            <AuthGate>
              <BankingPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/insurance"
          element={
            <AuthGate>
              <InsurancePage />
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
          path="/dashboard/cost-of-living"
          element={
            <AuthGate>
              <CostOfLivingPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/blog"
          element={
            <AuthGate>
              <BlogOverviewPage />
            </AuthGate>
          }
        />
        <Route
          path="/dashboard/blog/:postId"
          element={
            <AuthGate>
              <BlogPostPage />
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
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
