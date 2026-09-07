import { useEffect, useState } from "react";

import AdminLayout from "../../components/layout/AdminLayout";
import CreateEventForm from "../../components/admin/CreateEventForm";
import EventCard from "../../components/admin/EventCard";

import { getEvents } from "../../services/event.service";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEvents();

      setEvents(response.events || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your photography events and galleries.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CreateEventForm onCreated={loadEvents} />

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">
            Your Events
          </h2>

          {loading && (
            <p className="text-gray-500">
              Loading events...
            </p>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center text-gray-500">
              No events created yet.
            </div>
          )}

          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
              />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;