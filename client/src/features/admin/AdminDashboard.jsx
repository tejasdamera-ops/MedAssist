import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi } from "../../api/resources";
import { PageHeader } from "../../components/PageHeader";
import { Table } from "../../components/Table";
import { http } from "../../api/http";

const usersApi = resourceApi("users");
const auditApi = resourceApi("audit-logs");
const deptApi = resourceApi("departments");
const serviceApi = resourceApi("services");

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [userSearch, setUserSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  // Forms state
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "Password123!", role: "patient", phone: "" });
  const [newDept, setNewDept] = useState({ name: "", description: "" });
  const [newService, setNewService] = useState({ name: "", department: "", price: 500, durationMins: 30 });
  const [userMsg, setUserMsg] = useState("");

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: usersApi.list });
  const auditsQuery = useQuery({ queryKey: ["audit"], queryFn: auditApi.list });
  const deptsQuery = useQuery({ queryKey: ["departments"], queryFn: deptApi.list });
  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: serviceApi.list });

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: (data) => http.post("/users", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setNewUser({ name: "", email: "", password: "Password123!", role: "patient", phone: "" });
      setUserMsg("User created successfully!");
      setTimeout(() => setUserMsg(""), 3000);
    },
    onError: (err) => setUserMsg(err.response?.data?.message || "Failed to create user")
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => usersApi.update(id, { isActive: !isActive }),
    onSuccess: () => queryClient.invalidateQueries(["users"])
  });

  // Department mutation
  const createDeptMutation = useMutation({
    mutationFn: (data) => deptApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      setNewDept({ name: "", description: "" });
    }
  });

  // Service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data) => serviceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      setNewService({ name: "", department: "", price: 500, durationMins: 30 });
    }
  });

  const filteredUsers = (usersQuery.data || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAudits = (auditsQuery.data || []).filter(
    (a) =>
      a.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.resourceType?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.userRole?.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Clinic Administration" subtitle="Manage clinic accounts, roles, departments, services, and system audit logs." />

      {/* Tabs */}
      <div className="mb-6 flex border-b border-clinic-line gap-4 text-sm font-medium">
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "users" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("users")}
        >
          Users & Access Control
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "depts" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("depts")}
        >
          Departments & Services
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "audits" ? "border-clinic-teal text-clinic-teal font-semibold" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("audits")}
        >
          Immutable Audit Logs
        </button>
      </div>

      {userMsg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{userMsg}</div>}

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search users by name, email, role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full max-w-sm rounded-md border border-clinic-line px-3 py-2 text-sm bg-white"
              />
              <span className="text-xs text-slate-500 font-medium">{filteredUsers.length} Users</span>
            </div>
            <Table
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                {
                  key: "role",
                  label: "Role",
                  render: (r) => (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium capitalize rounded bg-slate-100 text-slate-700">
                      {r.role}
                    </span>
                  )
                },
                { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
                {
                  key: "isActive",
                  label: "Status",
                  render: (r) => (
                    <button
                      onClick={() => toggleUserActiveMutation.mutate({ id: r._id, isActive: r.isActive })}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        r.isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </button>
                  )
                }
              ]}
              rows={filteredUsers}
            />
          </div>

          {/* Add User Form */}
          <div className="rounded-lg border border-clinic-line bg-white p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Create New Account</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Dr. Jane Doe"
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="jane@clinic.com"
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm bg-white"
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="labtech">Lab Technician</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="555-0199"
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Password</label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
            </div>
            <button
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={!newUser.name || !newUser.email || createUserMutation.isPending}
              className="w-full rounded-md bg-clinic-teal py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {createUserMutation.isPending ? "Creating..." : "Create User Account"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DEPTS & SERVICES */}
      {activeTab === "depts" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Departments Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Clinic Departments</h3>
            <Table
              columns={[
                { key: "name", label: "Department" },
                { key: "description", label: "Description" }
              ]}
              rows={deptsQuery.data || []}
            />

            <div className="rounded-lg border border-clinic-line bg-white p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">Add Department</h4>
              <input
                type="text"
                placeholder="Department Name (e.g. Pediatrics)"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
              <textarea
                placeholder="Description"
                value={newDept.description}
                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm min-h-16"
              />
              <button
                onClick={() => createDeptMutation.mutate(newDept)}
                disabled={!newDept.name}
                className="rounded-md bg-clinic-teal px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Add Department
              </button>
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Clinic Services & Pricing</h3>
            <Table
              columns={[
                { key: "name", label: "Service" },
                { key: "price", label: "Fee (₹)", render: (r) => `₹${r.price}` },
                { key: "durationMins", label: "Duration", render: (r) => `${r.durationMins} mins` }
              ]}
              rows={servicesQuery.data || []}
            />

            <div className="rounded-lg border border-clinic-line bg-white p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">Add Service</h4>
              <input
                type="text"
                placeholder="Service Name (e.g. ECG Scan)"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newService.durationMins}
                    onChange={(e) => setNewService({ ...newService, durationMins: Number(e.target.value) })}
                    className="w-full rounded border border-clinic-line px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => createServiceMutation.mutate(newService)}
                disabled={!newService.name}
                className="rounded-md bg-clinic-teal px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audits" && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search audit events by action, resource, role..."
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            className="w-full max-w-sm rounded-md border border-clinic-line px-3 py-2 text-sm bg-white"
          />
          <Table
            columns={[
              { key: "timestamp", label: "Time", render: (r) => new Date(r.timestamp || r.createdAt).toLocaleString() },
              { key: "action", label: "Action Code", render: (r) => <span className="font-mono text-xs text-clinic-teal">{r.action}</span> },
              { key: "resourceType", label: "Target Resource" },
              { key: "userRole", label: "User Role", render: (r) => <span className="capitalize">{r.userRole || r.role}</span> }
            ]}
            rows={filteredAudits}
            empty="No audit logs match your search filter."
          />
        </div>
      )}
    </>
  );
}
