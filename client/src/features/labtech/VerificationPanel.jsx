import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { labOrdersApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Table } from "../../components/Table";

export function VerificationPanel() {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState("");

  const ordersQuery = useQuery({ queryKey: ["lab-orders"], queryFn: () => labOrdersApi.list() });

  const verifyMutation = useMutation({
    mutationFn: (id) => labOrdersApi.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["lab-orders"]);
      setMsg("Lab result verified!");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (id) => labOrdersApi.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["lab-orders"]);
      setMsg("Lab result released to patient medical record!");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const readyOrders = (ordersQuery.data || []).filter(
    (o) => o.status === "result-ready" || o.status === "verified" || o.status === "in-progress"
  );

  return (
    <>
      <PageHeader
        title="Lab Results Verification & Release"
        subtitle="Review completed laboratory findings, perform quality check verification, and publish released reports to patient chart records."
      />

      {msg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-medium">{msg}</div>}

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
            key: "resultData",
            label: "Recorded Result Data",
            render: (r) => (
              <div className="font-mono text-xs text-slate-700 bg-slate-50 p-1.5 rounded max-w-xs border border-slate-200">
                {typeof r.resultData === "object" ? JSON.stringify(r.resultData) : String(r.resultData || "Pending Data")}
              </div>
            )
          },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            label: "Verification & Release",
            render: (r) => (
              <div className="flex items-center gap-2">
                {r.status === "result-ready" && (
                  <button
                    onClick={() => verifyMutation.mutate(r._id)}
                    disabled={verifyMutation.isPending}
                    className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Verify Results
                  </button>
                )}
                {(r.status === "verified" || r.status === "result-ready") && (
                  <button
                    onClick={() => releaseMutation.mutate(r._id)}
                    disabled={releaseMutation.isPending}
                    className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Release Report
                  </button>
                )}
                {r.status === "completed" && <span className="text-xs text-emerald-700 font-bold">Released</span>}
              </div>
            )
          }
        ]}
        rows={readyOrders}
        empty="No lab results waiting for verification or release."
      />
    </>
  );
}
