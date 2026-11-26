import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { TrustStrip } from './components/sections/TrustStrip';
import { Services } from './components/sections/Services';
import { BusinessProblem } from './components/sections/BusinessProblem';
import { Solutions } from './components/sections/Solutions';
import { Projects as PublicProjects } from './components/sections/Projects';
import { Process } from './components/sections/Process';
import { Technology } from './components/sections/Technology';
import { Audience } from './components/sections/Audience';
import { WhyUs } from './components/sections/WhyUs';
import { Contact } from './components/sections/Contact';

import PublicSurvey from './pages/PublicSurvey';
// Dashboard Imports
import Layout from './dashboard/components/Layout';
import DashboardHome from './dashboard/pages/DashboardHome';
import Leads from './dashboard/pages/Leads';
import LeadDetails from './dashboard/pages/LeadDetails';
import Tasks from './dashboard/pages/Tasks';
import TaskDetails from './dashboard/pages/TaskDetails';
import Login from './dashboard/pages/Login';
import DashboardProjects from './dashboard/pages/Projects';
import ProjectDetails from './dashboard/pages/ProjectDetails';
import Clients from './dashboard/pages/Clients';
import ClientDetails from './dashboard/pages/ClientDetails';
import AnalyticsLayout from './dashboard/pages/analytics/AnalyticsLayout';
import AnalyticsOverview from './dashboard/pages/analytics/AnalyticsOverview';
import AnalyticsLeads from './dashboard/pages/analytics/AnalyticsLeads';
import AnalyticsClients from './dashboard/pages/analytics/AnalyticsClients';
import AnalyticsProjects from './dashboard/pages/analytics/AnalyticsProjects';
import AnalyticsTasks from './dashboard/pages/analytics/AnalyticsTasks';
import AnalyticsFinance from './dashboard/pages/analytics/AnalyticsFinance';
import AnalyticsServices from './dashboard/pages/analytics/AnalyticsServices';
import AnalyticsQuotations from './dashboard/pages/analytics/AnalyticsQuotations';
import DashboardServices from './dashboard/pages/Services';
import ServiceDetails from './dashboard/pages/ServiceDetails';
import Quotations from './dashboard/pages/Quotations';
import QuotationDetails from './dashboard/pages/QuotationDetails';
import FinanceLayout from './dashboard/pages/finance/FinanceLayout';
import FinanceOverview from './dashboard/pages/finance/FinanceOverview';
import FinanceInvoices from './dashboard/pages/finance/FinanceInvoices';
import FinanceInvoiceDetails from './dashboard/pages/finance/FinanceInvoiceDetails';
import FinancePayments from './dashboard/pages/finance/FinancePayments';
import FinancePaymentDetails from './dashboard/pages/finance/FinancePaymentDetails';
import FinanceOutstanding from './dashboard/pages/finance/FinanceOutstanding';
import FinanceTransactions from './dashboard/pages/finance/FinanceTransactions';
import FinanceReports from './dashboard/pages/finance/FinanceReports';
import CommunicationsLayout from './dashboard/pages/communications/CommunicationsLayout';
import CommunicationsList from './dashboard/pages/communications/CommunicationsList';
import CommunicationForm from './dashboard/pages/communications/CommunicationForm';
import CommunicationDetails from './dashboard/pages/communications/CommunicationDetails';
import FollowUpsList from './dashboard/pages/communications/FollowUpsList';
import CommunicationTemplates from './dashboard/pages/communications/CommunicationTemplates';
import ClientAssets from './dashboard/pages/ClientAssets';
import Settings from './dashboard/pages/Settings';
import Profile from './dashboard/pages/Profile';
import Help from './dashboard/pages/Help';
import Surveys from './dashboard/pages/Surveys';
import SurveyDetails from './dashboard/pages/SurveyDetails';
import ReportsLayout from './dashboard/pages/reports/ReportsLayout';
import ReportsList from './dashboard/pages/reports/ReportsList';
import ReportBuilder from './dashboard/pages/reports/ReportBuilder';
import ReportViewer from './dashboard/pages/reports/ReportViewer';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

const PublicWebsite = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <TrustStrip />
      <Services />
      <BusinessProblem />
      <Solutions />
      <PublicProjects />
      <Process />
      <Technology />
      <Audience />
      <WhyUs />
      <Contact />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<PublicWebsite />} />
        <Route path="/survey/:id" element={<PublicSurvey />} />
        
        {/* Dashboard Authentication */}
        <Route path="/admin" element={<Login />} />
        
        {/* Dashboard Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          <Route path="projects" element={<DashboardProjects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="surveys/:id" element={<SurveyDetails />} />
          <Route path="services" element={<DashboardServices />} />
          <Route path="services/:id" element={<ServiceDetails />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/:id" element={<QuotationDetails />} />
          
          <Route path="finance" element={<FinanceLayout />}>
            <Route index element={<FinanceOverview />} />
            <Route path="invoices" element={<FinanceInvoices />} />
            <Route path="invoices/:id" element={<FinanceInvoiceDetails />} />
            <Route path="payments" element={<FinancePayments />} />
            <Route path="payments/:id" element={<FinancePaymentDetails />} />
            <Route path="outstanding" element={<FinanceOutstanding />} />
            <Route path="transactions" element={<FinanceTransactions />} />
            <Route path="reports" element={<FinanceReports />} />
          </Route>

          <Route path="analytics" element={<AnalyticsLayout />}>
            <Route index element={<AnalyticsOverview />} />
            <Route path="leads" element={<AnalyticsLeads />} />
            <Route path="clients" element={<AnalyticsClients />} />
            <Route path="projects" element={<AnalyticsProjects />} />
            <Route path="tasks" element={<AnalyticsTasks />} />
            <Route path="finance" element={<AnalyticsFinance />} />
            <Route path="services" element={<AnalyticsServices />} />
            <Route path="quotations" element={<AnalyticsQuotations />} />
          </Route>
          
          <Route path="reports" element={<ReportsLayout />}>
            <Route index element={<ReportsList />} />
            <Route path="create" element={<ReportBuilder />} />
            <Route path=":id" element={<ReportViewer />} />
          </Route>
          
          <Route path="communications" element={<CommunicationsLayout />}>
            <Route index element={<CommunicationsList />} />
            <Route path="add" element={<CommunicationForm />} />
            <Route path="templates" element={<CommunicationTemplates />} />
            <Route path="follow-ups" element={<FollowUpsList />} />
            <Route path=":id" element={<CommunicationDetails />} />
            <Route path=":id/edit" element={<CommunicationForm />} />
          </Route>
          <Route path="assets" element={<ClientAssets />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
