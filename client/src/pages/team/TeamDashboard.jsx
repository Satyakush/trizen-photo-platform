import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getEvents } from "../../services/event.service";

const TeamDashboard = () => {
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
          "Failed to load assigned events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Trizen Photos
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Team Member
            </span>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            My Events
          </h2>

          <p className="mt-2 text-gray-500">
            Events assigned to you.
          </p>
        </div>

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
          <div className="rounded-xl border border-dashed bg-white p-10 text-center">
            <h3 className="font-semibold text-gray-900">
              No events assigned
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              You don't have any assigned events yet.
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {event.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {event.description || "No description"}
              </p>

              <p className="mt-4 text-sm text-gray-600">
                Event date:{" "}
                {new Date(
                  event.eventDate
                ).toLocaleDateString()}
              </p>

              <Link
                to={`/team/events/${event._id}`}
                className="mt-5 block rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800"
              >
                Open Event
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeamDashboard;