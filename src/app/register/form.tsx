"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {  
  AlertCircle
} from "lucide-react";
import authApi from "@/api/authApi";

export default function RegistrationForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nik: "",
    address: "",
    phoneNumber: "",
    role: "PACILIAN", 
    medicalHistory: "",
    speciality: "",
    workAddress: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const validateForm = () => {
    const errors: string[] = [];
  
    if (!form.email) {
      errors.push("Email wajib diisi.");
    } else if (!/^[^\s@]+@([^\s@.]+\.)+[^\s@.]+$/.test(form.email)) {
      errors.push("Email tidak valid.");
    }
    if (!form.password.trim()) {
      errors.push("Password wajib diisi.");
    }
    if (!form.name.trim()) {
      errors.push("Nama wajib diisi.");
    }
    if (!form.nik.match(/^\d{16}$/)) {
      errors.push("NIK harus terdiri dari 16 digit angka.");
    }
    if (!form.phoneNumber.match(/^\d{10,13}$/)) {
      errors.push("Nomor telepon harus 10–13 digit.");
    }
    if (!form.address.trim()) {
      errors.push("Alamat wajib diisi.");
    }
  
    if (form.role === "PACILIAN") {
      if (!form.medicalHistory.trim()) {
        errors.push("Riwayat medis wajib diisi.");
      }
    } else if (form.role === "CAREGIVER") {
      if (!form.speciality.trim()) {
        errors.push("Spesialisasi wajib diisi.");
      }
      if (!form.workAddress.trim()) {
        errors.push("Alamat tempat kerja wajib diisi.");
      }
    }
  
    return errors;
  };  

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
  
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(" "));
      setIsSubmitting(false);
      return;
    }
  
    let endpoint = form.role === "PACILIAN" ? "auth/register/pacilian" : "auth/register/caregiver";
    
    let payload;
    if (form.role === "PACILIAN") {
      payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        nik: form.nik,
        address: form.address,
        phoneNumber: form.phoneNumber,
        medicalHistory: form.medicalHistory
      };
    } else {
      payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        nik: form.nik,
        address: form.address,
        phoneNumber: form.phoneNumber,
        speciality: form.speciality,
        workAddress: form.workAddress
      };      
    }
  
    try {
      await authApi.post(endpoint, {
        json: payload
      }).json();
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
      setIsSubmitting(false);
    }
  };   

  return (
    <div className="w-full bg-gradient-to-b from-white to-white py-12 px-12 ">
      <div className="text-left mb-8">
        <h1 className="text-5xl font-bold text-blue-400">Register</h1>
      </div>
  
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
  
      <div className="space-y-6">
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">I am registering as:</label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="PACILIAN"
                checked={form.role === "PACILIAN"}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2">PACILIAN</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="CAREGIVER"
                checked={form.role === "CAREGIVER"}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2">CAREGIVER</span>
            </label>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">NIK (National ID)</label>
            <input
              type="text"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="1234567890123456"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="08123456789"
            />
          </div>
  
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Full address"
            />
          </div>
        </div>
  
        {form.role === "PACILIAN" && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Medical History</label>
            <textarea
              name="medicalHistory"
              value={form.medicalHistory}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Please share any relevant medical history or conditions"
            />
          </div>
        )}
  
        {form.role === "CAREGIVER" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Speciality</label>
              <input
                type="text"
                name="speciality"
                value={form.speciality}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="e.g. Cardiologist, Nurse, Pharmacist"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Work Address</label>
              <input
                type="text"
                name="workAddress"
                value={form.workAddress}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Hospital/Clinic Address"
              />
            </div>
          </div>
        )}
  
        <div className="flex items-center justify-between pt-2">
          <a href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-500">
            Already have an account?
          </a>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-400 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}