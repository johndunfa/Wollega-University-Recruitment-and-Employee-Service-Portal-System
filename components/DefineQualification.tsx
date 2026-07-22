'use client';

import { useEffect, useState } from 'react';

type Qualification = {
  _id?: string;
  title: string;
  level: string;
  description?: string;
};

export default function DefineQualification() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [form, setForm] = useState<Qualification>({ title: '', level: '', description: '' });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    const res = await fetch('/api/qualifications');
    const data = await res.json();
    setQualifications(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId ? `/api/qualifications/${editId}` : '/api/qualifications';
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', level: '', description: '' });
    setEditId(null);
    fetchQualifications();
  };

  const handleEdit = (q: Qualification) => {
    setForm(q);
    setEditId(q._id!);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this qualification?')) {
      await fetch(`/api/qualifications/${id}`, { method: 'DELETE' });
      fetchQualifications();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Define Qualifications</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg shadow">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Qualification Title"
          required
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="level"
          value={form.level}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Level</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="PhD">PhD</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Update' : 'Add'} Qualification
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {qualifications.map((q) => (
          <li key={q._id} className="p-4 border rounded flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{q.title}</h3>
              <p className="text-sm text-gray-600">Level: {q.level}</p>
              {q.description && <p className="text-sm mt-1">{q.description}</p>}
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(q)} className="text-blue-600 underline">Edit</button>
              <button onClick={() => handleDelete(q._id!)} className="text-red-600 underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
