import { http } from "./http";

export const authApi = {
  login: (payload) => http.post("/auth/login", payload).then((res) => res.data),
  register: (payload) => http.post("/auth/register", payload).then((res) => res.data),
  logout: () => http.post("/auth/logout").then((res) => res.data)
};

export const appointmentsApi = {
  list: (params) => http.get("/appointments", { params }).then((res) => res.data.data),
  create: (payload) => http.post("/appointments", payload).then((res) => res.data),
  availability: (doctorId, date) =>
    http.get(`/appointments/doctor/${doctorId}/availability`, { params: { date } }).then((res) => res.data.data),
  status: (id, status) => http.patch(`/appointments/${id}/status`, { status }).then((res) => res.data),
  cancel: (id, cancelReason) => http.patch(`/appointments/${id}/cancel`, { cancelReason }).then((res) => res.data)
};

export const invoicesApi = {
  list: (params) => http.get("/invoices", { params }).then((res) => res.data.data),
  create: (payload) => http.post("/invoices", payload).then((res) => res.data),
  addPayment: (id, payload) => http.patch(`/invoices/${id}/payment`, payload).then((res) => res.data)
};

export const medicalNotesApi = {
  getByPatient: (patientId) => http.get(`/medical-notes/patient/${patientId}`).then((res) => res.data.data),
  create: (payload) => http.post("/medical-notes", payload).then((res) => res.data),
  aiSummary: (id) => http.post(`/medical-notes/${id}/ai-summary`).then((res) => res.data),
  approveAiSummary: (id, reviewedByDoctor) =>
    http.patch(`/medical-notes/${id}/approve-ai-summary`, { reviewedByDoctor }).then((res) => res.data)
};

export const prescriptionsApi = {
  getByPatient: (patientId) => http.get(`/prescriptions/patient/${patientId}`).then((res) => res.data.data),
  create: (payload) => http.post("/prescriptions", payload).then((res) => res.data),
  aiExplain: (id) => http.post(`/prescriptions/${id}/ai-explain`).then((res) => res.data)
};

export const labOrdersApi = {
  list: (params) => http.get("/lab-orders", { params }).then((res) => res.data.data),
  create: (payload) => http.post("/lab-orders", payload).then((res) => res.data),
  collect: (id) => http.patch(`/lab-orders/${id}/collect`).then((res) => res.data),
  result: (id, resultData) => http.patch(`/lab-orders/${id}/result`, { resultData }).then((res) => res.data),
  verify: (id) => http.patch(`/lab-orders/${id}/verify`).then((res) => res.data),
  release: (id) => http.patch(`/lab-orders/${id}/release`).then((res) => res.data)
};

export const resourceApi = (resource) => ({
  list: () => http.get(`/${resource}`).then((res) => res.data.data),
  create: (payload) => http.post(`/${resource}`, payload).then((res) => res.data),
  update: (id, payload) => http.patch(`/${resource}/${id}`, payload).then((res) => res.data)
});

export const patientApi = {
  notes: (patientId) => http.get(`/medical-notes/patient/${patientId}`).then((res) => res.data.data),
  prescriptions: (patientId) => http.get(`/prescriptions/patient/${patientId}`).then((res) => res.data.data),
  invoices: (patientId) => http.get(`/invoices/patient/${patientId}`).then((res) => res.data.data)
};
