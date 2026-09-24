import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleRoute } from "./auth/RoleRoute";
import { Login } from "./features/Login";
import { Register } from "./features/Register";
import { Home } from "./features/Home";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { DoctorDashboard } from "./features/doctor/DoctorDashboard";
import { PatientChart } from "./features/doctor/PatientChart";
import { ReceptionistDashboard } from "./features/receptionist/ReceptionistDashboard";
import { BillingDesk } from "./features/receptionist/BillingDesk";
import { LabDashboard } from "./features/labtech/LabDashboard";
import { VerificationPanel } from "./features/labtech/VerificationPanel";
import { PatientDashboard } from "./features/patient/PatientDashboard";
import { PatientInvoices } from "./features/patient/PatientInvoices";
import { AppointmentBooking } from "./features/AppointmentBooking";
import { Forbidden, NotFound } from "./features/Errors";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/403" element={<Forbidden />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<RoleRoute allowed={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminDashboard />} />
          </Route>
          <Route element={<RoleRoute allowed={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/chart" element={<PatientChart />} />
          </Route>
          <Route element={<RoleRoute allowed={["receptionist"]} />}>
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/billing" element={<BillingDesk />} />
            <Route path="/receptionist/appointments/new" element={<AppointmentBooking />} />
          </Route>
          <Route element={<RoleRoute allowed={["labtech"]} />}>
            <Route path="/labtech" element={<LabDashboard />} />
            <Route path="/labtech/verification" element={<VerificationPanel />} />
          </Route>
          <Route element={<RoleRoute allowed={["patient"]} />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/invoices" element={<PatientInvoices />} />
            <Route path="/patient/appointments/new" element={<AppointmentBooking />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
