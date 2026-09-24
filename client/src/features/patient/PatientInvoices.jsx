import { useQuery } from "@tanstack/react-query";
import { patientApi, resourceApi } from "../../api/resources";
import { useAuth } from "../../auth/AuthContext";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Table } from "../../components/Table";

const patientProfilesApi = resourceApi("patients");

export function PatientInvoices() {
  const { user } = useAuth();
  const profilesQuery = useQuery({ queryKey: ["patients"], queryFn: patientProfilesApi.list });
  const patientProfile = (profilesQuery.data || []).find(
    (p) => (p.userId?._id || p.userId) === user?.id || (p.userId?._id || p.userId) === user?._id
  );
  const patientId = patientProfile?._id;

  const invoicesQuery = useQuery({
    queryKey: ["invoices", patientId],
    queryFn: () => patientApi.invoices(patientId),
    enabled: Boolean(patientId)
  });

  return (
    <>
      <PageHeader
        title="My Billing & Invoices"
        subtitle="Review medical charges, line item services, payment history, and current account balances."
      />

      <Table
        columns={[
          { key: "createdAt", label: "Invoice Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
          {
            key: "items",
            label: "Billed Items",
            render: (r) => (r.items || []).map((i) => `${i.description} (₹${i.amount})`).join(", ")
          },
          { key: "subtotal", label: "Subtotal", render: (r) => `₹${r.subtotal}` },
          { key: "discount", label: "Discount", render: (r) => `₹${r.discount || 0}` },
          { key: "total", label: "Total Bill", render: (r) => <span className="font-bold text-clinic-teal">₹{r.total}</span> },
          {
            key: "paid",
            label: "Amount Paid",
            render: (r) => {
              const paid = (r.paymentHistory || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
              return `₹${paid}`;
            }
          },
          { key: "status", label: "Payment Status", render: (r) => <StatusBadge status={r.status} /> }
        ]}
        rows={invoicesQuery.data || []}
        empty="No billing invoices issued to your patient account."
      />
    </>
  );
}
