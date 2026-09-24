import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi, medicalNotesApi, prescriptionsApi, labOrdersApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { Table } from "../../components/Table";
import { StatusBadge } from "../../components/StatusBadge";
import { FileUpload } from "../../components/FileUpload";

const patientProfilesApi = resourceApi("patients");

export function PatientChart() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: patientProfilesApi.list });
  const [selectedPatientId, setSelectedPatientId] = useState(location.state?.patientId || "");
  const appointmentId = location.state?.appointmentId || "";
  const [activeTab, setActiveTab] = useState("note");
  const [msg, setMsg] = useState("");

  // Select initial patient if loaded
  useEffect(() => {
    if (!selectedPatientId && patientsQuery.data && patientsQuery.data.length > 0) {
      setSelectedPatientId(patientsQuery.data[0]._id);
    }
  }, [patientsQuery.data, selectedPatientId]);

  const selectedPatient = (patientsQuery.data || []).find((p) => p._id === selectedPatientId);

  // Queries for medical history
  const notesQuery = useQuery({
    queryKey: ["notes", selectedPatientId],
    queryFn: () => medicalNotesApi.getByPatient(selectedPatientId),
    enabled: Boolean(selectedPatientId)
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions", selectedPatientId],
    queryFn: () => prescriptionsApi.getByPatient(selectedPatientId),
    enabled: Boolean(selectedPatientId)
  });

  const labOrdersQuery = useQuery({
    queryKey: ["lab-orders"],
    queryFn: () => labOrdersApi.list()
  });

  // Clinical Note Form State
  const [noteForm, setNoteForm] = useState({
    chiefComplaint: "",
    examinationFindings: "",
    bp: "120/80",
    pulse: 75,
    temp: 98.6,
    weight: 70,
    height: 170,
    spo2: 98,
    diagnosis: "",
    treatmentPlan: ""
  });

  // Prescription Form State
  const [medForm, setMedForm] = useState({
    name: "Paracetamol",
    dosage: "500mg",
    frequency: "Twice daily after meals",
    duration: "5 days",
    instructions: "Drink plenty of water"
  });

  // Lab Order Form State
  const [labForm, setLabForm] = useState({
    testName: "Complete Blood Count (CBC)",
    testCode: "CBC",
    priority: "routine"
  });

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: (data) =>
      medicalNotesApi.create({
        patientId: selectedPatientId,
        appointmentId: appointmentId || undefined,
        chiefComplaint: data.chiefComplaint,
        examinationFindings: data.examinationFindings,
        vitals: {
          bp: data.bp,
          pulse: Number(data.pulse),
          temp: Number(data.temp),
          weight: Number(data.weight),
          height: Number(data.height),
          spo2: Number(data.spo2)
        },
        diagnosis: data.diagnosis ? data.diagnosis.split(",").map((s) => s.trim()) : ["General evaluation"],
        treatmentPlan: data.treatmentPlan
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notes", selectedPatientId]);
      setMsg("Medical note recorded!");
      setNoteForm({
        chiefComplaint: "",
        examinationFindings: "",
        bp: "120/80",
        pulse: 75,
        temp: 98.6,
        weight: 70,
        height: 170,
        spo2: 98,
        diagnosis: "",
        treatmentPlan: ""
      });
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const createAiSummaryMutation = useMutation({
    mutationFn: (noteId) => medicalNotesApi.aiSummary(noteId),
    onSuccess: () => queryClient.invalidateQueries(["notes", selectedPatientId])
  });

  const approveAiSummaryMutation = useMutation({
    mutationFn: (noteId) => medicalNotesApi.approveAiSummary(noteId, true),
    onSuccess: () => queryClient.invalidateQueries(["notes", selectedPatientId])
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: () =>
      prescriptionsApi.create({
        patientId: selectedPatientId,
        medications: [medForm]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["prescriptions", selectedPatientId]);
      setMsg("Prescription saved!");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const createLabOrderMutation = useMutation({
    mutationFn: () =>
      labOrdersApi.create({
        patientId: selectedPatientId,
        testName: labForm.testName,
        testCode: labForm.testCode,
        priority: labForm.priority
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["lab-orders"]);
      setMsg("Lab test ordered!");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const patientLabOrders = (labOrdersQuery.data || []).filter(
    (order) => order.patientId?._id === selectedPatientId || order.patientId === selectedPatientId
  );

  return (
    <>
      <PageHeader
        title="Patient Medical Chart"
        subtitle="Review patient clinical history, record vital signs, compose medical notes, generate AI summaries, issue prescriptions, and order lab tests."
      />

      {/* Patient Selector Banner */}
      <div className="mb-6 rounded-lg border border-clinic-line bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Select Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="rounded border border-clinic-line px-3 py-1.5 text-sm bg-white font-medium"
          >
            {(patientsQuery.data || []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.userId?.name || "Patient"} (Blood Group: {p.bloodGroup || "N/A"})
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>
              <strong>DOB:</strong> {selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString() : "N/A"}
            </span>
            <span>
              <strong>Blood Group:</strong> {selectedPatient.bloodGroup || "N/A"}
            </span>
            <span>
              <strong>Allergies:</strong> {selectedPatient.allergies?.join(", ") || "None"}
            </span>
            <span>
              <strong>Conditions:</strong> {selectedPatient.chronicConditions?.join(", ") || "None"}
            </span>
          </div>
        )}
      </div>

      {msg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{msg}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Interactive Forms & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-Tabs */}
          <div className="flex border-b border-clinic-line gap-4 text-sm font-medium">
            <button
              className={`pb-2 border-b-2 transition-colors ${activeTab === "note" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab("note")}
            >
              Write Medical Note
            </button>
            <button
              className={`pb-2 border-b-2 transition-colors ${activeTab === "prescription" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab("prescription")}
            >
              Create Prescription
            </button>
            <button
              className={`pb-2 border-b-2 transition-colors ${activeTab === "lab" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab("lab")}
            >
              Order Lab Test
            </button>
          </div>

          {/* TAB 1: MEDICAL NOTE */}
          {activeTab === "note" && (
            <div className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800">New Clinical Consultation Note</h3>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Persistent fever, cough, and body pain for 3 days"
                  value={noteForm.chiefComplaint}
                  onChange={(e) => setNoteForm({ ...noteForm, chiefComplaint: e.target.value })}
                  className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                />
              </div>

              {/* Vitals Grid */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Patient Vitals</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">BP</span>
                    <input
                      type="text"
                      value={noteForm.bp}
                      onChange={(e) => setNoteForm({ ...noteForm, bp: e.target.value })}
                      className="w-full rounded border border-clinic-line px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Pulse (bpm)</span>
                    <input
                      type="number"
                      value={noteForm.pulse}
                      onChange={(e) => setNoteForm({ ...noteForm, pulse: e.target.value })}
                      className="w-full rounded border border-clinic-line px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Temp (°F)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={noteForm.temp}
                      onChange={(e) => setNoteForm({ ...noteForm, temp: e.target.value })}
                      className="w-full rounded border border-clinic-line px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Weight (kg)</span>
                    <input
                      type="number"
                      value={noteForm.weight}
                      onChange={(e) => setNoteForm({ ...noteForm, weight: e.target.value })}
                      className="w-full rounded border border-clinic-line px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Height (cm)</span>
                    <input
                      type="number"
                      value={noteForm.height}
                      onChange={(e) => setNoteForm({ ...noteForm, height: e.target.value })}
                      className="w-full rounded border border-clinic-line px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">SpO2 (%)</span>
                    <input
                      type="number"
                      value={noteForm.spo2}
                      onChange={(e) => setNoteForm({ ...noteForm, spo2: e.target.value })}
                      className="w-full rounded border border-clinic-line px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Examination Findings</label>
                <textarea
                  placeholder="Detailed physical exam findings..."
                  value={noteForm.examinationFindings}
                  onChange={(e) => setNoteForm({ ...noteForm, examinationFindings: e.target.value })}
                  className="w-full rounded border border-clinic-line px-3 py-2 text-sm min-h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Diagnosis (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Bronchitis, Mild Dehydration"
                  value={noteForm.diagnosis}
                  onChange={(e) => setNoteForm({ ...noteForm, diagnosis: e.target.value })}
                  className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Treatment Plan</label>
                <textarea
                  placeholder="Medication regimen, rest, follow-up advice..."
                  value={noteForm.treatmentPlan}
                  onChange={(e) => setNoteForm({ ...noteForm, treatmentPlan: e.target.value })}
                  className="w-full rounded border border-clinic-line px-3 py-2 text-sm min-h-20"
                />
              </div>

              <button
                onClick={() => createNoteMutation.mutate(noteForm)}
                disabled={!noteForm.chiefComplaint || createNoteMutation.isPending}
                className="rounded-md bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {createNoteMutation.isPending ? "Saving Note..." : "Save Medical Note"}
              </button>
            </div>
          )}

          {/* TAB 2: PRESCRIPTION */}
          {activeTab === "prescription" && (
            <div className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800">New Medication Prescription</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Medication Name</label>
                  <input
                    type="text"
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={medForm.frequency}
                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                    className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                  <input
                    type="text"
                    value={medForm.duration}
                    onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })}
                    className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={medForm.instructions}
                  onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
                  className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => createPrescriptionMutation.mutate()}
                disabled={!medForm.name || createPrescriptionMutation.isPending}
                className="rounded-md bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {createPrescriptionMutation.isPending ? "Issuing..." : "Issue Prescription"}
              </button>
            </div>
          )}

          {/* TAB 3: LAB ORDER */}
          {activeTab === "lab" && (
            <div className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800">Order Laboratory Test</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Test Name</label>
                  <input
                    type="text"
                    value={labForm.testName}
                    onChange={(e) => setLabForm({ ...labForm, testName: e.target.value })}
                    className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Test Code</label>
                  <input
                    type="text"
                    value={labForm.testCode}
                    onChange={(e) => setLabForm({ ...labForm, testCode: e.target.value })}
                    className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Priority Level</label>
                <select
                  value={labForm.priority}
                  onChange={(e) => setLabForm({ ...labForm, priority: e.target.value })}
                  className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT (Immediate)</option>
                </select>
              </div>
              <button
                onClick={() => createLabOrderMutation.mutate()}
                disabled={!labForm.testName || createLabOrderMutation.isPending}
                className="rounded-md bg-clinic-teal px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {createLabOrderMutation.isPending ? "Ordering..." : "Submit Lab Order"}
              </button>
            </div>
          )}

          {/* Clinical Attachments Upload */}
          <div className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-3">Attach Patient Records & Scans</h3>
            <FileUpload />
          </div>
        </div>

        {/* Right Col: Patient Record History & AI Summaries */}
        <div className="space-y-6">
          {/* Past Notes & AI Summary */}
          <div className="rounded-lg border border-clinic-line bg-white p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Medical History & AI Summaries</h3>
            {(notesQuery.data || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No medical notes recorded yet for this patient.</p>
            ) : (
              (notesQuery.data || []).map((note) => (
                <div key={note._id} className="rounded border border-slate-200 p-3 text-xs space-y-2 bg-slate-50">
                  <div className="flex justify-between items-center text-slate-500 font-medium">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <span>Vitals: BP {note.vitals?.bp || "N/A"}</span>
                  </div>
                  <p>
                    <strong>Complaint:</strong> {note.chiefComplaint}
                  </p>
                  <p>
                    <strong>Diagnosis:</strong> {note.diagnosis?.join(", ")}
                  </p>
                  <p>
                    <strong>Plan:</strong> {note.treatmentPlan}
                  </p>

                  {/* AI Summary Section */}
                  <div className="mt-2 border-t pt-2 space-y-1.5">
                    {note.aiSummary ? (
                      <div className="p-2 rounded bg-teal-50 border border-teal-200 text-teal-900">
                        <span className="font-semibold block mb-0.5">AI Clinical Summary:</span>
                        <p>{note.aiSummary}</p>
                        {note.reviewedByDoctor ? (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ✓ Reviewed & Approved by Doctor
                          </span>
                        ) : (
                          <button
                            onClick={() => approveAiSummaryMutation.mutate(note._id)}
                            className="mt-1.5 rounded bg-clinic-teal px-2 py-0.5 text-[10px] font-medium text-white hover:opacity-90"
                          >
                            Approve AI Summary
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => createAiSummaryMutation.mutate(note._id)}
                        disabled={createAiSummaryMutation.isPending}
                        className="rounded border border-clinic-teal px-2 py-1 text-[11px] font-medium text-clinic-teal hover:bg-clinic-mint"
                      >
                        {createAiSummaryMutation.isPending ? "Generating AI Summary..." : "⚡ Generate AI Clinical Summary"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Prescriptions */}
          <div className="rounded-lg border border-clinic-line bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Active Prescriptions</h3>
            {(prescriptionsQuery.data || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No prescriptions issued yet.</p>
            ) : (
              (prescriptionsQuery.data || []).map((p) => (
                <div key={p._id} className="rounded border border-slate-200 p-2.5 text-xs bg-slate-50 space-y-1">
                  <span className="text-[10px] text-slate-500 block">{new Date(p.createdAt).toLocaleDateString()}</span>
                  {p.medications?.map((med, idx) => (
                    <div key={idx} className="font-medium text-slate-800">
                      • {med.name} ({med.dosage}) - {med.frequency} for {med.duration}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Patient Lab Orders */}
          <div className="rounded-lg border border-clinic-line bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Lab Test Orders</h3>
            {patientLabOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No lab tests ordered yet.</p>
            ) : (
              patientLabOrders.map((lab) => (
                <div key={lab._id} className="flex items-center justify-between rounded border border-slate-200 p-2.5 text-xs bg-slate-50">
                  <div>
                    <span className="font-semibold block">{lab.testName}</span>
                    <span className="text-[10px] text-slate-500 capitalize">Priority: {lab.priority}</span>
                  </div>
                  <StatusBadge status={lab.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
