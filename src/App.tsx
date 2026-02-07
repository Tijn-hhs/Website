import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/dashboard/university-application"
          element={<UniversityApplicationPage />}
        />
        <Route path="/dashboard/student-visa" element={<StudentVisaPage />} />
        <Route
          path="/dashboard/before-departure"
          element={<BeforeDeparturePage />}
        />
        <Route
          path="/dashboard/immigration-registration"
          element={<ImmigrationRegistrationPage />}
        />
        <Route
          path="/dashboard/arrival-first-days"
          element={<ArrivalFirstDaysPage />}
        />
        <Route path="/dashboard/housing" element={<HousingPage />} />
        <Route
          path="/dashboard/legal-banking-insurance"
          element={<LegalBankingInsurancePage />}
        />
        <Route path="/dashboard/healthcare" element={<HealthcarePage />} />
        <Route
          path="/dashboard/information-centre"
          element={<InformationCentrePage />}
        />
        <Route path="/dashboard/daily-life" element={<DailyLifePage />} />
        <Route path="/dashboard/cost-of-living" element={<CostOfLivingPage />} />
        <Route path="/my-situation" element={<MySituationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
