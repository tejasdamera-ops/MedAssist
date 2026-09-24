import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, "Use at least 8 characters"),
  role: z.enum(["patient", "doctor", "receptionist", "labtech", "admin"])
});

const roleHome = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  labtech: "/labtech",
  patient: "/patient"
};

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "patient" }
  });

  async function onSubmit(values) {
    try {
      const user = await registerUser(values);
      navigate(roleHome[user.role], { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Could not reach the API. Start the server and MongoDB, then try again.";
      setError("root", { message });
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-md border border-clinic-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-clinic-teal">Create MedAssist Account</h1>
        <p className="mt-1 text-sm text-slate-600">Register a demo user and enter the correct role workspace.</p>

        <label className="mt-6 block text-sm font-medium">
          Full name
          <input className="mt-1 w-full rounded-md border border-clinic-line px-3 py-2" {...register("name")} />
        </label>
        {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>}

        <label className="mt-4 block text-sm font-medium">
          Email
          <input className="mt-1 w-full rounded-md border border-clinic-line px-3 py-2" {...register("email")} />
        </label>
        {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}

        <label className="mt-4 block text-sm font-medium">
          Phone
          <input className="mt-1 w-full rounded-md border border-clinic-line px-3 py-2" {...register("phone")} />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Role
          <select className="mt-1 w-full rounded-md border border-clinic-line px-3 py-2" {...register("role")}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="labtech">Lab Technician</option>
            <option value="admin">Clinic Admin</option>
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium">
          Password
          <input className="mt-1 w-full rounded-md border border-clinic-line px-3 py-2" type="password" {...register("password")} />
        </label>
        {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
        {errors.root && <p className="mt-3 text-sm text-rose-600">{errors.root.message}</p>}

        <button className="mt-6 w-full rounded-md bg-clinic-teal px-4 py-2 font-medium text-white disabled:opacity-60" disabled={isSubmitting}>
          Create account
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-medium text-clinic-teal hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
