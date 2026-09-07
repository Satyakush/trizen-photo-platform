import { useState } from "react";

import { createEvent } from "../../services/event.service";

const CreateEventForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    eventDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await createEvent(form);

      setForm({
        name: "",
        description: "",
        eventDate: "",
      });

      onCreated();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 text-lg font-semibold">
        Create Event
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Event name"
          required
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-300"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows="3"
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-300"
        />

        <input
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-300"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
};

export default CreateEventForm;