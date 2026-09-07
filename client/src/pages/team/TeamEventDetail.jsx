import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getEvent } from "../../services/event.service";

import {
  getMyPhotos,
  uploadPhotos,
} from "../../services/photo.service";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function TeamEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [activeTab, setActiveTab] = useState("photos");

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [eventResponse, photoResponse] =
        await Promise.all([
          getEvent(eventId),
          getMyPhotos(eventId),
        ]);

      setEvent(
        eventResponse.data ||
          eventResponse.event ||
          null
      );

      setPhotos(photoResponse || []);
    } catch (err) {
      console.error(
        "Failed to load event:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load event."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // FILE SELECTION
  // --------------------------------

  const handleFileChange = (event) => {
    setError("");
    setMessage("");

    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    if (files.length > MAX_FILES) {
      setError(
        `You can upload a maximum of ${MAX_FILES} photos at once.`
      );
      return;
    }

    const invalidType = files.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type)
    );

    if (invalidType) {
      setError(
        "Only JPEG, PNG, and WEBP images are allowed."
      );
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFile) {
      setError(
        `"${oversizedFile.name}" is larger than 10 MB.`
      );
      return;
    }

    setSelectedFiles(files);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  // --------------------------------
  // UPLOAD
  // --------------------------------

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError(
        "Please select at least one photo."
      );
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setMessage("");

      const response = await uploadPhotos(
        eventId,
        selectedFiles
      );

      setMessage(
        response.message ||
          `${selectedFiles.length} photo(s) uploaded successfully.`
      );

      setSelectedFiles([]);

      await loadEventData();
    } catch (err) {
      console.error(
        "Photo upload failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Photo upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // --------------------------------
  // HELPERS
  // --------------------------------

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";

    const units = [
      "B",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.min(
      Math.floor(
        Math.log(bytes) / Math.log(1024)
      ),
      units.length - 1
    );

    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(1)} ${units[index]}`;
  };

  const formatDate = (date) => {
    if (!date) return "";

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

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-8 text-center">

          <p className="font-semibold text-red-600">
            Event not found.
          </p>

          <button
            onClick={() =>
              navigate("/team")
            }
            className="mt-4 text-sm font-semibold text-slate-700 underline"
          >
            Back to My Events
          </button>

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

        <div className="mx-auto max-w-7xl px-6 py-6">

          <button
            onClick={() =>
              navigate("/team")
            }
            className="mb-5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to My Events
          </button>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  ASSIGNED EVENT
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {event.name}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">

                {event.eventDate && (
                  <span>
                    📅 {formatDate(
                      event.eventDate
                    )}
                  </span>
                )}

                <span>
                  📷 {photos.length} uploaded
                </span>

              </div>

            </div>

            {/* STATS */}

            <div className="flex gap-2">

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  My Photos
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {photos.length}
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-bold text-emerald-600">
                  Assigned
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================
          CONTENT
      ================================= */}

      <main className="mx-auto max-w-7xl px-6 py-6">

        {/* ALERTS */}

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

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

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

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
            TABS
        ================================= */}

        <div className="mb-6 flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

          <button
            onClick={() =>
              setActiveTab("overview")
            }
            className={`flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() =>
              setActiveTab("photos")
            }
            className={`flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition ${
              activeTab === "photos"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            My Photos
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                activeTab === "photos"
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {photos.length}
            </span>
          </button>

        </div>

        {/* =================================
            OVERVIEW
        ================================= */}

        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* EVENT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Event
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {event.name}
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-medium text-slate-400">
                    Event Date
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {formatDate(
                      event.eventDate
                    ) || "Not specified"}
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-medium text-slate-400">
                    Your Uploads
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {photos.length} photos
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-5 sm:col-span-2">

                  <p className="text-xs font-medium text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 leading-6 text-slate-700">
                    {event.description ||
                      "No description provided for this event."}
                  </p>

                </div>

              </div>

            </div>

            {/* QUICK ACTION */}

            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                📷
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Ready to upload?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add your event photos here. Your uploads will be available to the event admin for review.
              </p>

              <button
                onClick={() =>
                  setActiveTab("photos")
                }
                className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Manage My Photos →
              </button>

            </div>

          </div>
        )}

        {/* =================================
            PHOTOS
        ================================= */}

        {activeTab === "photos" && (
          <div>

            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  My Photos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Photos you have uploaded to this event.
                </p>

              </div>

              <label className="cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">

                + Upload Photos

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </label>

            </div>

            {/* UPLOAD QUEUE */}

            {selectedFiles.length > 0 && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">

                <div className="border-b border-blue-100 bg-blue-50 px-5 py-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="font-semibold text-blue-900">
                        Ready to upload
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        {selectedFiles.length} photo
                        {selectedFiles.length >
                        1
                          ? "s"
                          : ""}{" "}
                        selected
                      </p>

                    </div>

                    <button
                      onClick={
                        clearSelectedFiles
                      }
                      className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

                <div className="p-5">

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

                    {selectedFiles.map(
                      (file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >

                          {/* PREVIEW */}

                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">

                            <img
                              src={URL.createObjectURL(
                                file
                              )}
                              alt={
                                file.name
                              }
                              className="h-full w-full object-cover"
                            />

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium text-slate-800">
                              {file.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatFileSize(
                                file.size
                              )}
                            </p>

                          </div>

                          <button
                            onClick={() =>
                              removeSelectedFile(
                                index
                              )
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            ×
                          </button>

                        </div>
                      )
                    )}

                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400">
                      JPEG, PNG or WEBP · Max 10 MB each · Max 20 photos
                    </p>

                    <button
                      onClick={
                        handleUpload
                      }
                      disabled={
                        isUploading
                      }
                      className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUploading
                        ? "Uploading..."
                        : `Upload ${selectedFiles.length} Photo${
                            selectedFiles.length >
                            1
                              ? "s"
                              : ""
                          }`}
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* PHOTO GRID */}

            {photos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  📷
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No photos uploaded yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Upload your event photos here. They will be available to the admin for review.
                </p>

                <label className="mt-6 inline-block cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">

                  Upload First Photos

                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />

                </label>

              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                {photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >

                    <img
                      src={photo.storageUrl}
                      alt={photo.filename}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* HOVER INFO */}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-12 opacity-0 transition group-hover:opacity-100">

                      <p className="truncate text-xs font-medium text-white">
                        {photo.filename}
                      </p>

                      <p className="mt-1 text-[10px] text-white/70">
                        {formatFileSize(
                          photo.fileSize
                        )}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}

export default TeamEventDetail;