import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appointmentsApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Table } from "../../components/Table";

export function DoctorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const appointments = useQuery({
    queryKey: ["appointments", "doctor"],
    queryFn: () => appointmentsApi.list()
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentsApi.status(id, status),
    onSuccess: () => queryClient.invalidateQueries(["appointments"])
  });

  return (
    <>
      <PageHeader
        title="Doctor Workspace"
        subtitle="Manage patient appointments, update visit status, examine patient history, write clinical notes, and issue prescriptions."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">My Appointments & Patient Queue</h2>
          <span className="text-xs text-slate-500 font-medium">{(appointments.data || []).length} Appointments</span>
        </div>

        <Table
          columns={[
            {
              key: "patientId",
              label: "Patient",
              render: (row) => row.patientId?.userId?.name || row.patientId?.name || "Patient"
            },
            { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
            { key: "startTime", label: "Slot", render: (row) => `${row.startTime} - ${row.endTime}` },
            { key: "reasonForVisit", label: "Reason for Visit" },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <select
                    value={row.status}
                    onChange={(e) => statusMutation.mutate({ id: row._id, status: e.target.value })}
                    className="rounded border border-clinic-line px-2 py-1 text-xs bg-white"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked In</option>
                    <option value="in-progress">In Consultation</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() =>
                      navigate("/doctor/chart", {
                        state: { patientId: row.patientId?._id || row.patientId, appointmentId: row._id }
                      })
                    }
                    className="rounded bg-clinic-teal px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Open Chart
                  </button>
                </div>
              )
            }
          ]}
          rows={appointments.data || []}
          empty="No appointments scheduled for your profile."
        />
      </div>
    </>
  );
}
