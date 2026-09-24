import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appointmentsApi, resourceApi } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { PageHeader } from "../components/PageHeader";
import { Calendar } from "../components/Calendar";

const doctorsApi = resourceApi("doctors");
const patientsApi = resourceApi("patients");
const deptsApi = resourceApi("departments");
const servicesApi = resourceApi("services");

const roleHome = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  labtech: "/labtech",
  patient: "/patient"
};

export function AppointmentBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("Routine consultation");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: doctorsApi.list });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: patientsApi.list });
  const deptsQuery = useQuery({ queryKey: ["departments"], queryFn: deptsApi.list });
  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: servicesApi.list });

  // Auto-set patient ID if user is a patient
  const patientProfile = (patientsQuery.data || []).find(
    (p) => (p.userId?._id || p.userId) === user?.id || (p.userId?._id || p.userId) === user?._id
  );

  const effectivePatientId = user?.role === "patient" ? patientProfile?._id : selectedPatientId;

  const availabilityQuery = useQuery({
    queryKey: ["availability", selectedDoctorId, selectedDate],
    queryFn: () => appointmentsApi.availability(selectedDoctorId, selectedDate),
    enabled: Boolean(selectedDoctorId && selectedDate)
  });

  const bookMutation = useMutation({
    mutationFn: (data) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setMsg("Appointment successfully booked!");
      setErrorMsg("");
      setTimeout(() => {
        navigate(roleHome[user?.role] || "/");
      }, 1500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || "Failed to book appointment.");
    }
  });

  function handleSubmit() {
    setErrorMsg("");
    if (!effectivePatientId) {
      setErrorMsg("Please select a patient.");
      return;
    }
    if (!selectedDoctorId) {
      setErrorMsg("Please select a doctor.");
      return;
    }
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot from the calendar below.");
      return;
    }

    const doctor = (doctorsQuery.data || []).find((d) => d._id === selectedDoctorId);
    const departmentId = doctor?.department?._id || doctor?.department || (deptsQuery.data?.[0]?._id);
    const serviceId = servicesQuery.data?.[0]?._id;

    bookMutation.mutate({
      patientId: effectivePatientId,
      doctorId: selectedDoctorId,
      departmentId,
      serviceId,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      reasonForVisit: reason
    });
  }

  return (
    <>
      <PageHeader
        title="Schedule Clinic Appointment"
        subtitle="Select doctor, target date, and available time slot to reserve a consultation."
      />

      {msg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-medium">{msg}</div>}
      {errorMsg && <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800 font-medium">{errorMsg}</div>}

      <div className="mb-6 grid gap-4 rounded-lg border border-clinic-line bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {/* Patient Selection if Admin / Receptionist */}
        {user?.role !== "patient" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Select Patient --</option>
              {(patientsQuery.data || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name || "Patient"} (Phone: {p.userId?.phone || "N/A"})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setSelectedSlot(null);
            }}
            className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Select Doctor --</option>
            {(doctorsQuery.data || []).map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.userId?.name || "Dr. MedAssist"} - {doc.specialization || "General"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
            }}
            className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit</label>
          <input
            type="text"
            placeholder="e.g. Regular checkup"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800">Doctor Slot Availability</h3>
        <Calendar
          availability={availabilityQuery.data?.availability || []}
          bookings={availabilityQuery.data?.bookings || []}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />

        {selectedSlot && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-900">
                Selected Slot: {selectedSlot.startTime} to {selectedSlot.endTime}
              </p>
              <p className="text-xs text-teal-700">Click below to finalize and confirm this appointment.</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={bookMutation.isPending}
              className="rounded-md bg-clinic-teal px-6 py-2 text-sm font-medium text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              {bookMutation.isPending ? "Confirming..." : "Confirm & Save Appointment"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
