import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEvents } from "../../services/event.service";

function TeamDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
          "Failed to load assigned events."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const totalPhotos = useMemo(() => {
    return events.reduce(
      (total, event) =>
        total + (event.photoCount || 0),
      0
    );
  }, [events]);

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="text-sm text-slate-500">
            Loading your workspace...
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

            {/* GREETING */}

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                TEAM WORKSPACE
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Your Events
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
                Upload and manage the photos you've captured for your assigned events.
              </p>

            </div>

            {/* STATS */}

            <div className="flex gap-3">

              <div className="min-w-[110px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Events
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {events.length}
                </p>

              </div>

              <div className="min-w-[130px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Uploads
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalPhotos}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================
          CONTENT
      ================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

        {error && (
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

        {/* SECTION HEADER */}

        <div className="mb-5 flex items-end justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Workspace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Assigned Events
            </h2>

          </div>

          {events.length > 0 && (
            <span className="text-sm text-slate-400">
              {events.length} event
              {events.length !== 1
                ? "s"
                : ""}
            </span>
          )}

        </div>

        {/* =================================
            EMPTY STATE
        ================================= */}

        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-24 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              📅
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No events assigned yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When an admin assigns you to an event, it will appear here and you'll be able to upload photos.
            </p>

          </div>
        ) : (
          /* =================================
             EVENT GRID
          ================================= */

          <div className="grid gap-5 lg:grid-cols-2">

            {events.map((event) => (

              <button
                key={event._id}
                type="button"
                onClick={() =>
                  navigate(
                    `/team/events/${event._id}`
                  )
                }
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
              >

                {/* TOP ACCENT */}

                <div className="h-1.5 bg-slate-900" />

                <div className="p-6">

                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl transition group-hover:bg-slate-900 group-hover:text-white">
                        📷
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {event.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          📅{" "}
                          {formatDate(
                            event.eventDate
                          )}
                        </p>

                      </div>

                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-700">
                      ASSIGNED
                    </span>

                  </div>

                  {/* DESCRIPTION */}

                  {event.description && (
                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
                      {event.description}
                    </p>
                  )}

                  {/* FOOTER */}

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">
                        📷
                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-400">
                          Your uploads
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {event.photoCount || 0}{" "}
                          photos
                        </p>

                      </div>

                    </div>

                    <span className="flex items-center gap-1 text-sm font-bold text-slate-700 transition group-hover:translate-x-1">
                      Open Workspace
                      <span>→</span>
                    </span>

                  </div>

                </div>

              </button>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default TeamDashboard;