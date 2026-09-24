import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { labOrdersApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Table } from "../../components/Table";

export function LabDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resultInput, setResultInput] = useState("Hemoglobin: 13.5 g/dL, WBC: 7200/uL, Platelets: 260k/uL");

  const ordersQuery = useQuery({ queryKey: ["lab-orders"], queryFn: () => labOrdersApi.list() });

  const collectMutation = useMutation({
    mutationFn: (id) => labOrdersApi.collect(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["lab-orders"]);
      setMsg("Sample collected successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const resultMutation = useMutation({
    mutationFn: ({ id, resultData }) => labOrdersApi.result(id, { note: resultData }),
    onSuccess: () => {
      queryClient.invalidateQueries(["lab-orders"]);
      setSelectedOrder(null);
      setMsg("Test results recorded!");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  return (
    <>
      <PageHeader
        title="Lab Order Queue"
        subtitle="Track incoming lab requests, collect biological samples, enter test values, and forward completed lab tests for verification."
      />

      {msg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-medium">{msg}</div>}

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate("/labtech/verification")}
          className="rounded-md bg-clinic-teal px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90"
        >
          Go to Verification & Release Panel →
        </button>
      </div>

      {/* Result Entry Modal / Drawer */}
      {selectedOrder && (
        <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-teal-900">
            Enter Result Data: {selectedOrder.testName} ({selectedOrder.testCode})
          </h3>
          <p className="text-xs text-teal-700">Patient: {selectedOrder.patientId?.userId?.name || "Patient Profile"}</p>
          <textarea
            value={resultInput}
            onChange={(e) => setResultInput(e.target.value)}
            className="w-full rounded border border-clinic-line bg-white p-3 text-sm min-h-20"
            placeholder="e.g. Hemoglobin: 13.5 g/dL, WBC: 7200/uL, Platelets: 260k/uL"
          />
          <div className="flex gap-2">
            <button
              onClick={() => resultMutation.mutate({ id: selectedOrder._id, resultData: resultInput })}
              disabled={resultMutation.isPending}
              className="rounded bg-clinic-teal px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {resultMutation.isPending ? "Saving..." : "Save Results"}
            </button>
            <button
              onClick={() => setSelectedOrder(null)}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Table
        columns={[
          { key: "testName", label: "Test Name", render: (r) => <span className="font-semibold">{r.testName}</span> },
          { key: "testCode", label: "Code", render: (r) => <span className="font-mono text-xs text-slate-500">{r.testCode}</span> },
          {
            key: "patientId",
            label: "Patient",
            render: (r) => r.patientId?.userId?.name || r.patientId?.name || "Patient"
          },
          {
            key: "priority",
            label: "Priority",
            render: (r) => (
              <span
                className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded ${
                  r.priority === "stat"
                    ? "bg-rose-100 text-rose-800"
                    : r.priority === "urgent"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {r.priority}
              </span>
            )
          },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            label: "Lab Action",
            render: (r) => (
              <div className="flex items-center gap-2">
                {r.status === "requested" && (
                  <button
                    onClick={() => collectMutation.mutate(r._id)}
                    disabled={collectMutation.isPending}
                    className="rounded bg-clinic-teal px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Collect Sample
                  </button>
                )}
                {(r.status === "sample-collected" || r.status === "in-progress") && (
                  <button
                    onClick={() => setSelectedOrder(r)}
                    className="rounded bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Enter Results
                  </button>
                )}
                {(r.status === "result-ready" || r.status === "verified" || r.status === "completed") && (
                  <span className="text-xs text-emerald-700 font-medium">✓ Result Processed</span>
                )}
              </div>
            )
          }
        ]}
        rows={ordersQuery.data || []}
        empty="No lab test orders found."
      />
    </>
  );
}
