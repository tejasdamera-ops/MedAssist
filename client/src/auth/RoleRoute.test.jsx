import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { RoleRoute } from "./RoleRoute";

vi.mock("../api/resources", () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn()
  }
}));

function seedUser(user) {
  localStorage.setItem("medassist_user", JSON.stringify(user));
}

describe("RoleRoute", () => {
  it("renders allowed role content", () => {
    seedUser({ id: "1", name: "Admin", role: "admin" });
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route element={<RoleRoute allowed={["admin"]} />}>
              <Route path="/admin" element={<div>Admin screen</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin screen")).toBeInTheDocument();
  });

  it("redirects disallowed roles to 403", () => {
    seedUser({ id: "2", name: "Patient", role: "patient" });
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route element={<RoleRoute allowed={["admin"]} />}>
              <Route path="/admin" element={<div>Admin screen</div>} />
            </Route>
            <Route path="/403" element={<div>Forbidden</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });
});
