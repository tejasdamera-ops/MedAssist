import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi, resourceApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Table } from "../../components/Table";

const patientProfilesApi = resourceApi("patients");
const serviceProfilesApi = resourceApi("services");

export function BillingDesk() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("invoices");
  const [msg, setMsg] = useState("");

  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: () => invoicesApi.list() });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: patientProfilesApi.list });
  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: serviceProfilesApi.list });

  // Invoice creation state
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: "",
    items: [{ description: "General Consultation", amount: 750 }],
    tax: 0,
    discount: 0
  });

  // Payment recording state
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    amount: 500,
    method: "card"
  });

  // Calculations for preview
  const subtotal = invoiceForm.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const total = Math.max(subtotal + Number(invoiceForm.tax || 0) - Number(invoiceForm.discount || 0), 0);

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setMsg("Invoice generated successfully!");
      setInvoiceForm({
        patientId: "",
        items: [{ description: "General Consultation", amount: 750 }],
        tax: 0,
        discount: 0
      });
      setTimeout(() => setMsg(""), 3000);
    }
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ invoiceId, amount, method }) => invoicesApi.addPayment(invoiceId, { amount: Number(amount), method }),
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setMsg("Payment recorded successfully!");
      setPaymentForm({ invoiceId: "", amount: 500, method: "card" });
      setTimeout(() => setMsg(""), 3000);
    }
  });

  return (
    <>
      <PageHeader title="Billing & Payment Desk" subtitle="Generate patient invoices, apply line items and discounts, record cash/card/UPI/insurance payments, and track receivables." />

      {msg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{msg}</div>}

      {/* Tabs */}
      <div className="mb-6 flex border-b border-clinic-line gap-4 text-sm font-medium">
        <button
          className={`pb-2 border-b-2 transition-colors ${activeTab === "invoices" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("invoices")}
        >
          All Patient Invoices
        </button>
        <button
          className={`pb-2 border-b-2 transition-colors ${activeTab === "create" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("create")}
        >
          + Create New Invoice
        </button>
        <button
          className={`pb-2 border-b-2 transition-colors ${activeTab === "payment" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("payment")}
        >
          💳 Record Payment
        </button>
      </div>

      {/* TAB 1: INVOICES LIST */}
      {activeTab === "invoices" && (
        <Table
          columns={[
            {
              key: "patientId",
              label: "Patient Name",
              render: (r) => r.patientId?.userId?.name || r.patientId?.name || "Patient"
            },
            { key: "total", label: "Total Amount (₹)", render: (r) => `₹${r.total}` },
            {
              key: "paid",
              label: "Paid",
              render: (r) => {
                const paid = (r.paymentHistory || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                return `₹${paid}`;
              }
            },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <button
                  onClick={() => {
                    setPaymentForm({ invoiceId: r._id, amount: r.total, method: "card" });
                    setActiveTab("payment");
                  }}
                  className="rounded bg-clinic-teal px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                >
                  Record Payment
                </button>
              )
            }
          ]}
          rows={invoicesQuery.data || []}
          empty="No billing invoices found."
        />
      )}

      {/* TAB 2: CREATE INVOICE */}
      {activeTab === "create" && (
        <div className="max-w-2xl rounded-lg border border-clinic-line bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Generate Patient Bill</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Patient</label>
            <select
              value={invoiceForm.patientId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, patientId: e.target.value })}
              className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Choose Patient --</option>
              {(patientsQuery.data || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name || "Patient"} (Phone: {p.userId?.phone || "N/A"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Quick Service or Add Custom Item</label>
            <select
              onChange={(e) => {
                const svc = (servicesQuery.data || []).find((s) => s._id === e.target.value);
                if (svc) {
                  setInvoiceForm({
                    ...invoiceForm,
                    items: [...invoiceForm.items, { description: svc.name, amount: svc.price }]
                  });
                }
              }}
              className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white mb-2"
            >
              <option value="">-- Add Service Item from Catalog --</option>
              {(servicesQuery.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - ₹{s.price}
                </option>
              ))}
            </select>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">Bill Items</label>
            {invoiceForm.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const next = [...invoiceForm.items];
                    next[idx].description = e.target.value;
                    setInvoiceForm({ ...invoiceForm, items: next });
                  }}
                  className="flex-1 rounded border border-clinic-line px-3 py-1.5 text-sm"
                  placeholder="Item description"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const next = [...invoiceForm.items];
                    next[idx].amount = Number(e.target.value);
                    setInvoiceForm({ ...invoiceForm, items: next });
                  }}
                  className="w-28 rounded border border-clinic-line px-3 py-1.5 text-sm"
                  placeholder="Amount ₹"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = invoiceForm.items.filter((_, i) => i !== idx);
                    setInvoiceForm({ ...invoiceForm, items: next });
                  }}
                  className="text-rose-600 text-xs font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tax Amount (₹)</label>
              <input
                type="number"
                value={invoiceForm.tax}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: Number(e.target.value) })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                value={invoiceForm.discount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: Number(e.target.value) })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="rounded border bg-slate-50 p-3 text-sm flex justify-between font-semibold">
            <span>Subtotal: ₹{subtotal}</span>
            <span className="text-clinic-teal font-bold">Total Bill: ₹{total}</span>
          </div>

          <button
            onClick={() => createInvoiceMutation.mutate(invoiceForm)}
            disabled={!invoiceForm.patientId || invoiceForm.items.length === 0 || createInvoiceMutation.isPending}
            className="w-full rounded-md bg-clinic-teal py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {createInvoiceMutation.isPending ? "Generating Invoice..." : "Confirm & Issue Invoice"}
          </button>
        </div>
      )}

      {/* TAB 3: RECORD PAYMENT */}
      {activeTab === "payment" && (
        <div className="max-w-md rounded-lg border border-clinic-line bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Record Payment</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Unpaid/Partial Invoice</label>
            <select
              value={paymentForm.invoiceId}
              onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
              className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Choose Invoice --</option>
              {(invoicesQuery.data || [])
                .filter((inv) => inv.status !== "paid")
                .map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.patientId?.userId?.name || "Patient"} - Total ₹{inv.total} ({inv.status})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Amount (₹)</label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full rounded border border-clinic-line px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full rounded border border-clinic-line px-3 py-2 text-sm bg-white"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI / Net Banking</option>
              <option value="insurance">Insurance Claim</option>
            </select>
          </div>

          <button
            onClick={() => addPaymentMutation.mutate(paymentForm)}
            disabled={!paymentForm.invoiceId || !paymentForm.amount || addPaymentMutation.isPending}
            className="w-full rounded-md bg-clinic-teal py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {addPaymentMutation.isPending ? "Recording..." : "Record Payment & Update Status"}
          </button>
        </div>
      )}
    </>
  );
}
