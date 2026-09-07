import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getEvents,
  deleteEvent,
} from "../../services/event.service";

function Events() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [eventToDelete, setEventToDelete] =
    useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getEvents();

      setEvents(
        response.data ||
          response.events ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load events:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load events."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // FILTER
  // --------------------------------

  const filter =
    new URLSearchParams(location.search).get(
      "filter"
    );

  const now = new Date();

  const filteredEvents = useMemo(() => {
    if (filter === "upcoming") {
      return [...events]
        .filter(
          (event) =>
            event.eventDate &&
            new Date(event.eventDate) >=
              new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.eventDate) -
            new Date(b.eventDate)
        );
    }

    if (filter === "recent") {
      return [...events]
        .filter(
          (event) =>
            event.eventDate &&
            new Date(event.eventDate) < new Date()
        )
        .sort(
          (a, b) =>
            new Date(b.eventDate) -
            new Date(a.eventDate)
        );
    }

    return [...events].sort(
      (a, b) =>
        new Date(b.eventDate || 0) -
        new Date(a.eventDate || 0)
    );
  }, [events, filter]);

  const pageTitle =
    filter === "upcoming"
      ? "Upcoming Events"
      : filter === "recent"
      ? "Recent Events"
      : "All Events";

  const pageDescription =
    filter === "upcoming"
      ? "View and manage all upcoming photography projects."
      : filter === "recent"
      ? "View and manage your completed photography projects."
      : "Manage all of your photography projects from one place.";

  // --------------------------------
  // DELETE
  // --------------------------------

  const openDeleteModal = (
    event,
    clickEvent
  ) => {
    clickEvent?.stopPropagation();

    setEventToDelete(event);
    setError("");
    setMessage("");
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;

    setEventToDelete(null);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete?._id) return;

    try {
      setIsDeleting(true);
      setError("");
      setMessage("");

      const response = await deleteEvent(
        eventToDelete._id
      );

      setEvents((current) =>
        current.filter(
          (event) =>
            event._id !==
            eventToDelete._id
        )
      );

      setEventToDelete(null);

      setMessage(
        response.message ||
          "Event deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete event:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete event."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------
  // HELPERS
  // --------------------------------

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventStatus = (event) => {
    if (!event.eventDate) {
      return "ACTIVE";
    }

    return new Date(event.eventDate) >=
      new Date()
      ? "UPCOMING"
      : "COMPLETED";
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="text-sm text-slate-500">
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================
          HEADER
      ================================= */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                className="mb-4 text-sm font-semibold text-slate-400 transition hover:text-slate-900"
              >
                ← Dashboard
              </button>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Projects
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {pageTitle}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {pageDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* =================================
          CONTENT
      ================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* SUCCESS */}

        {message && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span>
              ✓ {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
              className="text-emerald-500 hover:text-emerald-800"
            >
              ×
            </button>
          </div>
        )}

        {/* ERROR */}

        {error && !eventToDelete && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-500 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================
            SUMMARY
        ================================= */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1
                ? "event"
                : "events"}
            </p>
          </div>
        </div>

        {/* =================================
            EMPTY STATE
        ================================= */}

        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📷
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {filter === "upcoming"
                ? "No upcoming events"
                : filter === "recent"
                ? "No recent events"
                : "No events yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {filter === "upcoming"
                ? "There are currently no upcoming photography projects."
                : filter === "recent"
                ? "Completed photography projects will appear here."
                : "Create your first photography event to start uploading photos and building customer galleries."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          /* =================================
             EVENTS GRID
          ================================= */

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const status =
                getEventStatus(event);

              const memberCount =
                (event.teamMembers || [])
                  .length;

              return (
                <div
                  key={event._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between p-5">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/events/${event._id}`
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200"
                      title="Open event"
                    >
                      📷
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          status === "UPCOMING"
                            ? "bg-blue-50 text-blue-700"
                            : status ===
                              "COMPLETED"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {status}
                      </span>

                      <button
                        type="button"
                        onClick={(clickEvent) =>
                          openDeleteModal(
                            event,
                            clickEvent
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete event"
                        aria-label={`Delete ${event.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* CARD BODY */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/events/${event._id}`
                      )
                    }
                    className="block w-full px-5 pb-5 text-left"
                  >
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      {event.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(
                        event.eventDate
                      )}
                    </p>

                    {event.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-400">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
                      <span>
                        👥 {memberCount}{" "}
                        {memberCount === 1
                          ? "member"
                          : "members"}
                      </span>

                      <span className="ml-auto font-semibold text-slate-500 transition group-hover:text-slate-900">
                        Open →
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =================================
          DELETE MODAL
      ================================= */}

      {eventToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeDeleteModal}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-6 pb-6 pt-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
                🗑️
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Delete this event?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to permanently delete{" "}
                <span className="font-semibold text-slate-800">
                  {eventToDelete.name}
                </span>
                .
              </p>

              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  This action cannot be undone.
                </p>

                <ul className="mt-2 space-y-1 text-xs leading-5 text-red-700">
                  <li>
                    • The event will be deleted.
                  </li>

                  <li>
                    • Its photos will be permanently removed.
                  </li>

                  <li>
                    • Its customer gallery will be removed.
                  </li>

                  <li>
                    • Stored images will be deleted from Cloudinary.
                  </li>
                </ul>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting
                    ? "Deleting..."
                    : "Delete Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;