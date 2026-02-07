import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
