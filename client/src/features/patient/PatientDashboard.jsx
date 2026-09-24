import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appointmentsApi, patientApi, prescriptionsApi, resourceApi, labOrdersApi } from "../../api/resources";
import { useAuth } from "../../auth/AuthContext";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";

const patientProfilesApi = resourceApi("patients");

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("timeline");

  const profilesQuery = useQuery({ queryKey: ["patients"], queryFn: patientProfilesApi.list });
  const patientProfile = (profilesQuery.data || []).find(
    (p) => (p.userId?._id || p.userId) === user?.id || (p.userId?._id || p.userId) === user?._id
  );
  const patientId = patientProfile?._id;

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: () => appointmentsApi.list()
  });

  const notesQuery = useQuery({
    queryKey: ["notes", patientId],
    queryFn: () => patientApi.notes(patientId),
    enabled: Boolean(patientId)
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: () => patientApi.prescriptions(patientId),
    enabled: Boolean(patientId)
  });

  const labQuery = useQuery({
    queryKey: ["lab-orders"],
    queryFn: () => labOrdersApi.list()
  });

  const [aiExplanations, setAiExplanations] = useState({});

  const aiExplainMutation = useMutation({
    mutationFn: (rxId) => prescriptionsApi.aiExplain(rxId),
    onSuccess: (data, rxId) => {
      setAiExplanations((prev) => ({ ...prev, [rxId]: data.data?.explanation || data.message || "Explanation generated." }));
    }
  });

  const myLabOrders = (labQuery.data || []).filter(
    (o) => (o.patientId?._id || o.patientId) === patientId
  );

  return (
    <>
      <PageHeader
        title="My Health Portal"
        subtitle="Access your clinical visits, medical notes, prescribed medications with AI explanations, lab reports, and upcoming appointments."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex border-b border-clinic-line gap-4 text-sm font-medium">
          <button
            className={`pb-2 border-b-2 transition-colors ${activeTab === "timeline" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("timeline")}
          >
            My Appointments
          </button>
          <button
            className={`pb-2 border-b-2 transition-colors ${activeTab === "notes" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("notes")}
          >
            Doctor Notes
          </button>
          <button
            className={`pb-2 border-b-2 transition-colors ${activeTab === "prescriptions" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("prescriptions")}
          >
            Prescriptions & AI Explanations
          </button>
          <button
            className={`pb-2 border-b-2 transition-colors ${activeTab === "labs" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("labs")}
          >
            Lab Test Results
          </button>
        </div>

        <button
          onClick={() => navigate("/patient/appointments/new")}
          className="rounded-md bg-clinic-teal px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90"
        >
          + Book New Appointment
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === "timeline" && (
        <div className="space-y-3">
          {(appointmentsQuery.data || []).length === 0 ? (
            <div className="rounded-md border border-clinic-line bg-white p-6 text-sm text-slate-600">No appointments found.</div>
          ) : (
            (appointmentsQuery.data || []).map((item) => (
              <article key={item._id} className="rounded-lg border border-clinic-line bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(item.date).toLocaleDateString()} at {item.startTime}
                  </p>
                  <h3 className="font-semibold text-slate-800 mt-0.5">{item.reasonForVisit || "Clinic Visit"}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Doctor: {item.doctorId?.userId?.name || item.doctorId?.specialization || "Doctor"}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </article>
            ))
          )}
        </div>
      )}

      {/* TAB 2: DOCTOR NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          {(notesQuery.data || []).length === 0 ? (
            <div className="rounded-md border border-clinic-line bg-white p-6 text-sm text-slate-600">No medical consultation notes found.</div>
          ) : (
            (notesQuery.data || []).map((note) => (
              <div key={note._id} className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-3">
                <div className="flex justify-between border-b pb-2 text-xs text-slate-500 font-medium">
                  <span>Date: {new Date(note.createdAt).toLocaleDateString()}</span>
                  <span>Vitals: BP {note.vitals?.bp || "N/A"}, Pulse {note.vitals?.pulse || "N/A"} bpm</span>
                </div>
                <p className="text-sm">
                  <strong className="text-slate-800">Chief Complaint:</strong> {note.chiefComplaint}
                </p>
                <p className="text-sm">
                  <strong className="text-slate-800">Diagnosis:</strong> {note.diagnosis?.join(", ")}
                </p>
                <p className="text-sm">
                  <strong className="text-slate-800">Treatment Plan:</strong> {note.treatmentPlan}
                </p>

                {note.aiSummary && note.reviewedByDoctor && (
                  <div className="mt-3 rounded border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900">
                    <span className="font-semibold block mb-1">Doctor-Verified AI Summary:</span>
                    <p>{note.aiSummary}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PRESCRIPTIONS & AI EXPLANATIONS */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          {(prescriptionsQuery.data || []).length === 0 ? (
            <div className="rounded-md border border-clinic-line bg-white p-6 text-sm text-slate-600">No active prescriptions found.</div>
          ) : (
            (prescriptionsQuery.data || []).map((rx) => (
              <div key={rx._id} className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-3">
                <div className="flex justify-between border-b pb-2 text-xs text-slate-500 font-medium">
                  <span>Prescription Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2">
                  {rx.medications?.map((med, idx) => (
                    <div key={idx} className="rounded bg-slate-50 p-3 text-sm border border-slate-200">
                      <h4 className="font-semibold text-clinic-teal">{med.name} - {med.dosage}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Frequency:</strong> {med.frequency} | <strong>Duration:</strong> {med.duration}
                      </p>
                      {med.instructions && <p className="text-xs text-slate-500 mt-1">Instructions: {med.instructions}</p>}
                    </div>
                  ))}
                </div>

                {/* AI Explanation Tool */}
                <div className="border-t pt-3">
                  {aiExplanations[rx._id] ? (
                    <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                      <span className="font-semibold block mb-1">🤖 Patient-Friendly Medication Guide (AI Generated):</span>
                      <p className="leading-relaxed">{aiExplanations[rx._id]}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => aiExplainMutation.mutate(rx._id)}
                      disabled={aiExplainMutation.isPending}
                      className="rounded border border-clinic-teal px-3 py-1.5 text-xs font-medium text-clinic-teal hover:bg-clinic-mint"
                    >
                      {aiExplainMutation.isPending ? "Generating Explanation..." : "⚡ Explain Medications in Simple Terms (AI Assistance)"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: LAB RESULTS */}
      {activeTab === "labs" && (
        <div className="space-y-4">
          {myLabOrders.length === 0 ? (
            <div className="rounded-md border border-clinic-line bg-white p-6 text-sm text-slate-600">No lab reports found.</div>
          ) : (
            myLabOrders.map((lab) => (
              <div key={lab._id} className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800">{lab.testName} ({lab.testCode})</h3>
                    <p className="text-xs text-slate-500">Priority: {lab.priority}</p>
                  </div>
                  <StatusBadge status={lab.status} />
                </div>

                {lab.status === "completed" || lab.status === "verified" || lab.status === "result-ready" ? (
                  <div className="rounded bg-slate-50 p-3 font-mono text-xs text-slate-800 border border-slate-200">
                    <span className="font-semibold block text-slate-600 mb-1 font-sans">Lab Result Data:</span>
                    {typeof lab.resultData === "object" ? JSON.stringify(lab.resultData, null, 2) : String(lab.resultData)}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Sample collected. Lab results are currently being processed by the lab team.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
