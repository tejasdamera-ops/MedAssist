import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appointmentsApi, resourceApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Table } from "../../components/Table";
import { http } from "../../api/http";

const patientProfilesApi = resourceApi("patients");

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [msg, setMsg] = useState("");

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "Password123!",
    dob: "1995-05-15",
    gender: "female",
    bloodGroup: "O+"
  });

  const appointments = useQuery({ queryKey: ["appointments", "queue"], queryFn: () => appointmentsApi.list() });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentsApi.status(id, status),
    onSuccess: () => queryClient.invalidateQueries(["appointments"])
  });

  const registerPatientMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Create user account with role patient
      const userRes = await http.post("/users", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "patient"
      });
      const userId = userRes.data.data._id;

      // 2. Update patient profile with details
      const profileList = await patientProfilesApi.list();
      const profile = profileList.find((p) => (p.userId?._id || p.userId) === userId);
      if (profile) {
        await patientProfilesApi.update(profile._id, {
          dob: data.dob,
          gender: data.gender,
          bloodGroup: data.bloodGroup
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      setShowRegisterForm(false);
      setMsg("Patient registered successfully!");
      setPatientForm({
        name: "",
        email: "",
        phone: "",
        password: "Password123!",
        dob: "1995-05-15",
        gender: "female",
        bloodGroup: "O+"
      });
      setTimeout(() => setMsg(""), 3000);
    }
  });

  return (
    <>
      <PageHeader title="Receptionist Queue Board" subtitle="Manage daily appointment flow, check in arriving patients, register new walk-ins, and manage clinic queue." />

      {msg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{msg}</div>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/receptionist/appointments/new")}
            className="rounded-md bg-clinic-teal px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90"
          >
            + Book New Appointment
          </button>
          <button
            onClick={() => setShowRegisterForm(!showRegisterForm)}
            className="rounded-md border border-clinic-teal px-4 py-2 text-sm font-medium text-clinic-teal hover:bg-clinic-mint"
          >
            {showRegisterForm ? "Cancel Registration" : "+ Register New Patient"}
          </button>
        </div>
        <button
          onClick={() => navigate("/receptionist/billing")}
          className="rounded-md border border-clinic-line bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Go to Billing Desk →
        </button>
      </div>

      {/* Inline Registration Form */}
      {showRegisterForm && (
        <div className="mb-6 rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Register Walk-in Patient</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Rohan Sharma"
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="rohan@example.com"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                placeholder="555-0199"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                value={patientForm.dob}
                onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Blood Group</label>
              <input
                type="text"
                placeholder="O+"
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => registerPatientMutation.mutate(patientForm)}
            disabled={!patientForm.name || !patientForm.email || registerPatientMutation.isPending}
            className="rounded-md bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {registerPatientMutation.isPending ? "Registering..." : "Submit Registration"}
          </button>
        </div>
      )}

      {/* Appointment Queue Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800">Today's Appointment Queue</h3>
        <Table
          columns={[
            { key: "queueNumber", label: "Queue #", render: (r) => <span className="font-bold text-clinic-teal">#{r.queueNumber || 1}</span> },
            { key: "patientId", label: "Patient", render: (r) => r.patientId?.userId?.name || r.patientId?.name || "Patient" },
            { key: "doctorId", label: "Doctor", render: (r) => r.doctorId?.userId?.name || r.doctorId?.specialization || "Doctor" },
            { key: "startTime", label: "Slot", render: (r) => `${r.startTime} - ${r.endTime}` },
            { key: "reasonForVisit", label: "Reason" },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "actions",
              label: "Update Queue Status",
              render: (r) => (
                <select
                  value={r.status}
                  onChange={(e) => statusMutation.mutate({ id: r._id, status: e.target.value })}
                  className="rounded border border-clinic-line px-2 py-1 text-xs bg-white font-medium"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked In</option>
                  <option value="in-progress">In Consultation</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )
            }
          ]}
          rows={appointments.data || []}
          empty="No appointments in queue for today."
        />
      </div>
    </>
  );
}
