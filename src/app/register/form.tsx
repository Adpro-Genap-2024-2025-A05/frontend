"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {  
  AlertCircle,
  PlusCircle,
  Trash2
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
    workingSchedules: [{ day: "MONDAY", startTime: "08:00", endTime: "16:00" }],
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const updatedSchedules = [...form.workingSchedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    setForm({ ...form, workingSchedules: updatedSchedules });
  };

  const addSchedule = () => {
    setForm({
      ...form,
      workingSchedules: [...form.workingSchedules, { day: "MONDAY", startTime: "08:00", endTime: "16:00" }]
    });
  };

  const removeSchedule = (index: number) => {
    if (form.workingSchedules.length > 1) {
      const updatedSchedules = form.workingSchedules.filter((_, i) => i !== index);
      setForm({ ...form, workingSchedules: updatedSchedules });
    }
  };
  
  const validateForm = () => {
    const errors: string[] = [];
  
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
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
      
      // Validate working schedules
      if (form.workingSchedules.length === 0) {
        errors.push("Minimal satu jadwal kerja harus ditambahkan.");
      } else {
        for (let i = 0; i < form.workingSchedules.length; i++) {
          const schedule = form.workingSchedules[i];
          if (!schedule.day) {
            errors.push(`Jadwal #${i+1}: Hari wajib dipilih.`);
          }
          if (!schedule.startTime) {
            errors.push(`Jadwal #${i+1}: Waktu mulai wajib diisi.`);
          }
          if (!schedule.endTime) {
            errors.push(`Jadwal #${i+1}: Waktu selesai wajib diisi.`);
          }
          
          // Check if end time is after start time
          if (schedule.startTime && schedule.endTime && schedule.startTime >= schedule.endTime) {
            errors.push(`Jadwal #${i+1}: Waktu selesai harus setelah waktu mulai.`);
          }
        }
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
  
    // Create the appropriate payload based on role
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
        workAddress: form.workAddress,
        workingSchedules: form.workingSchedules.map(s => ({
          dayOfWeek: s.day,
          timeChoices: [
            {
              startTime: s.startTime,
              endTime: s.endTime
            }
          ]
        }))
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

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

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
          <>
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
          
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Working Schedule</h3>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Schedule
                </button>
              </div>
              
              {form.workingSchedules.map((schedule, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-700">Schedule #{index + 1}</h4>
                    {form.workingSchedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Day</label>
                      <select
                        value={schedule.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">End Time</label>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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