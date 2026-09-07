import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEvents,
  createEvent,
  deleteEvent,
} from "../../services/event.service";

function AdminDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);
  const [isCreating, setIsCreating] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [eventToDelete, setEventToDelete] =
    useState(null);
  const [isDeleting, setIsDeleting] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
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
        "Failed to load dashboard:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // STATS
  // --------------------------------

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return [...events]
      .filter(
        (event) =>
          event.eventDate &&
          new Date(event.eventDate) >= now
      )
      .sort(
        (a, b) =>
          new Date(a.eventDate) -
          new Date(b.eventDate)
      );
  }, [events]);

  const recentEvents = useMemo(() => {
    const now = new Date();

    return [...events]
      .filter(
        (event) =>
          event.eventDate &&
          new Date(event.eventDate) < now
      )
      .sort(
        (a, b) =>
          new Date(b.eventDate) -
          new Date(a.eventDate)
      )
      .slice(0, 3);
  }, [events]);

  const totalTeamMembers = useMemo(() => {
    const memberIds = new Set();

    events.forEach((event) => {
      (event.teamMembers || []).forEach(
        (member) => {
          memberIds.add(
            member._id || member
          );
        }
      );
    });

    return memberIds.size;
  }, [events]);

  // --------------------------------
  // FORM
  // --------------------------------

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      eventDate: "",
    });
  };

  const closeCreateModal = () => {
    if (isCreating) return;

    setShowCreateModal(false);
    resetForm();
    setError("");
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Event name is required.");
      return;
    }

    if (!formData.eventDate) {
      setError("Event date is required.");
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      setMessage("");

      const response = await createEvent({
        name: formData.name.trim(),
        description:
          formData.description.trim(),
        eventDate: formData.eventDate,
      });

      const createdEvent =
        response.data ||
        response.event ||
        null;

      setShowCreateModal(false);
      resetForm();

      setMessage(
        response.message ||
          "Event created successfully."
      );

      if (createdEvent) {
        setEvents((current) => [
          createdEvent,
          ...current,
        ]);
      } else {
        await loadDashboard();
      }
    } catch (err) {
      console.error(
        "Failed to create event:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create event."
      );
    } finally {
      setIsCreating(false);
    }
  };

  // --------------------------------
  // DELETE EVENT
  // --------------------------------

  const openDeleteModal = (
    event,
    clickEvent
  ) => {
    clickEvent?.stopPropagation();

    setEventToDelete(event);
    setShowDeleteModal(true);
    setError("");
    setMessage("");
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;

    setShowDeleteModal(false);
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
            event._id !== eventToDelete._id
        )
      );

      setShowDeleteModal(false);
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

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
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
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================
          HERO
      ================================= */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold tracking-wide text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                ADMIN WORKSPACE
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
                Manage events, your photography team, and customer galleries from one place.
              </p>
            </div>

            <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
            >
              + Create Event
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

        {error &&
          !showCreateModal &&
          !showDeleteModal && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <span>{error}</span>

              <button
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
            STATS
        ================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                📅
              </div>

              <span className="text-xs font-bold text-slate-400">
                TOTAL
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Events
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                👥
              </div>

              <span className="text-xs font-bold text-slate-400">
                TEAM
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Team Members
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {totalTeamMembers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                ✦
              </div>

              <span className="text-xs font-bold text-slate-400">
                UPCOMING
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Upcoming Events
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {upcomingEvents.length}
            </p>
          </div>

          {/* CREATE CARD */}

          <button
            onClick={() =>
              setShowCreateModal(true)
            }
            className="group rounded-2xl bg-slate-900 p-6 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                +
              </div>

              <span className="text-xs font-bold text-slate-400">
                QUICK ACTION
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-400">
              Start something new
            </p>

            <p className="mt-1 text-lg font-bold">
              Create Event

              <span className="ml-2 transition group-hover:ml-3">
                →
              </span>
            </p>
          </button>
        </div>

        {/* =================================
            MAIN AREA
        ================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* UPCOMING EVENTS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Schedule
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Upcoming Events
                </h2>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/admin/events?filter=upcoming"
                  )
                }
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
              >
                View all →
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  📅
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  No upcoming events
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first event to get started.
                </p>

                <button
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  + Create Event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(
                  (event) => (
                    <div
                      key={event._id}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/events/${event._id}`
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                          📷
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">
                            {event.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(
                              event.eventDate
                            )}
                          </p>
                        </div>

                        <div className="hidden text-right sm:block">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
                            {getEventStatus(
                              event
                            )}
                          </span>

                          <p className="mt-2 text-xs text-slate-400">
                            {(event.teamMembers ||
                              []).length}{" "}
                            member
                            {(event.teamMembers ||
                              []).length !== 1
                              ? "s"
                              : ""}
                          </p>
                        </div>

                        <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-900">
                          →
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(clickEvent) =>
                          openDeleteModal(
                            event,
                            clickEvent
                          )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete event"
                        aria-label={`Delete ${event.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* QUICK ACTIONS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Quick Actions
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  setShowCreateModal(true)
                }
                className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  +
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Create Event
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Start a new photography project
                  </p>
                </div>

                <span className="text-slate-400 transition group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/admin/team-members"
                  )
                }
                className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  👥
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Team Members
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage your photography team
                  </p>
                </div>

                <span className="text-slate-400 transition group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                onClick={() =>
                  navigate("/admin/events")
                }
                className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                  ✦
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Manage Events
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    View all photography projects
                  </p>
                </div>

                <span className="text-slate-400 transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </section>
        </div>

        {/* =================================
            RECENT EVENTS
        ================================= */}

        {events.length > 0 && (
          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Projects
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Recent Events
                </h2>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/admin/events?filter=recent"
                  )
                }
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                See all →
              </button>
            </div>

            {recentEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  ✦
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  No completed events yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Completed photography projects will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentEvents.map((event) => (
                  <div
                    key={event._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/events/${event._id}`
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
                        title="Open event"
                        aria-label={`Open ${event.name}`}
                      >
                        📷
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/events/${event._id}`
                            )
                          }
                          className="text-slate-300 transition hover:text-slate-900"
                          title="Open event"
                          aria-label={`Open ${event.name}`}
                        >
                          ↗
                        </button>

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

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/events/${event._id}`
                        )
                      }
                      className="mt-5 block w-full text-left"
                    >
                      <h3 className="truncate font-bold text-slate-900">
                        {event.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(
                          event.eventDate
                        )}
                      </p>

                      <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
                        <span>
                          👥{" "}
                          {(event.teamMembers ||
                            []).length}{" "}
                          members
                        </span>

                        <span className="ml-auto">
                          Open →
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* =================================
          CREATE EVENT MODAL
      ================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeCreateModal}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    New Project
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Create Event
                  </h2>
                </div>

                <button
                  onClick={closeCreateModal}
                  disabled={isCreating}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateEvent}
              className="p-6"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* NAME */}

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Event Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Sharma Wedding"
                  maxLength={100}
                  autoFocus
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              {/* DATE */}

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-800">
                  Event Date
                </label>

                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">
                    Description
                  </label>

                  <span className="text-xs text-slate-400">
                    {formData.description.length}/500
                  </span>
                </div>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add some details about this event..."
                  maxLength={500}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              {/* ACTIONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreating}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating
                    ? "Creating..."
                    : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================
          DELETE EVENT MODAL
      ================================= */}

      {showDeleteModal && eventToDelete && (
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

export default AdminDashboard;