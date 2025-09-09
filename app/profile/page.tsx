"use client"

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      // Optionally add id: user.id if you have auth
    });
    setLoading(false);
    if (error) {
      setMessage("Error saving profile: " + error.message);
    } else {
      setMessage("Profile saved!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="First Name"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Last Name"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Email Address"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Phone Number"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        {message && <div className="mt-2 text-center text-sm">{message}</div>}
      </form>
    </div>
  );
}
