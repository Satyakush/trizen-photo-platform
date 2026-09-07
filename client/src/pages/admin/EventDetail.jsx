import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  assignTeamMember,
  removeTeamMember,
  getEvent,
  getGalleryByEventId,
  getTeamMembers,
} from "../../services/event.service";

import {
  getEventPhotos,
  uploadPhotos,
} from "../../services/photo.service";

import {
  createGallery,
  publishGallery,
} from "../../services/gallery.service";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("photos");

  const [event, setEvent] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [gallery, setGallery] = useState(null);
  const [galleryPin, setGalleryPin] = useState("");
  const [isGalleryMissing, setIsGalleryMissing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      setIsCopied(false);

      const [
        eventResponse,
        membersResponse,
        photosResponse,
      ] = await Promise.all([
        getEvent(eventId),
        getTeamMembers(),
        getEventPhotos(eventId),
      ]);

      setEvent(
        eventResponse.data ||
          eventResponse.event ||
          null
      );

      setTeamMembers(
        membersResponse.data ||
          membersResponse.teamMembers ||
          membersResponse.users ||
          []
      );

      setPhotos(photosResponse || []);

      /*
       * Gallery is optional.
       *
       * A 404 here simply means that this event
       * does not have a gallery yet.
       */
      try {
        const galleryResponse =
          await getGalleryByEventId(eventId);

        const existingGallery =
          galleryResponse.data ||
          galleryResponse.gallery ||
          null;

        setGallery(existingGallery);
        setIsGalleryMissing(!existingGallery);

        /*
         * Restore the gallery's selected photos.
         * photoIds may be populated Photo objects.
         */
        if (existingGallery?.photoIds) {
          setSelectedPhotos(
            existingGallery.photoIds.map((photo) =>
              typeof photo === "object"
                ? photo._id
                : photo
            )
          );
        } else {
          setSelectedPhotos([]);
        }
      } catch (galleryError) {
        if (galleryError.response?.status === 404) {
          setGallery(null);
          setIsGalleryMissing(true);
          setSelectedPhotos([]);
        } else {
          throw galleryError;
        }
      }
    } catch (err) {
      console.error("Failed to load event:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load event details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------
  // TEAM MEMBER
  // --------------------------------

  const handleAssignMember = async () => {
    if (!selectedMember) {
      setError("Please select a team member.");
      return;
    }

    try {
      setIsAssigning(true);
      setError("");
      setMessage("");

      const response = await assignTeamMember(
        eventId,
        selectedMember
      );

      setMessage(
        response.message ||
          "Team member assigned successfully."
      );

      setSelectedMember("");

      await loadEventData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to assign team member."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove?._id) return;

    try {
      setIsRemovingMember(true);
      setError("");
      setMessage("");

      const response = await removeTeamMember(
        eventId,
        memberToRemove._id
      );

      setMemberToRemove(null);
      setMessage(
        response.message ||
          "Team member removed from this event."
      );

      await loadEventData();
    } catch (err) {
      console.error("Failed to remove team member:", err);

      setError(
        err.response?.data?.message ||
          "Failed to remove team member."
      );
    } finally {
      setIsRemovingMember(false);
    }
  };

  // --------------------------------
  // FILE UPLOAD
  // --------------------------------

  const handleFileChange = (event) => {
    setError("");
    setMessage("");

    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    if (files.length > MAX_FILES) {
      setError(
        `You can upload a maximum of ${MAX_FILES} photos at once.`
      );
      return;
    }

    const invalidType = files.find(
      (file) => !ALLOWED_TYPES.includes(file.type)
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

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError("Please select at least one photo.");
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
      console.error("Photo upload failed:", err);

      setError(
        err.response?.data?.message ||
          "Photo upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // --------------------------------
  // PHOTO SELECTION
  // --------------------------------

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    );
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(
      photos.map((photo) => photo._id)
    );
  };

  const clearSelection = () => {
    setSelectedPhotos([]);
  };

  // --------------------------------
  // GALLERY
  // --------------------------------

  const handleCreateGallery = async () => {
    if (!selectedPhotos.length) {
      setError(
        "Select at least one photo for the gallery."
      );
      return;
    }

    if (!/^\d{4,6}$/.test(galleryPin)) {
      setError(
        "Gallery PIN must contain 4 to 6 digits."
      );
      return;
    }

    try {
      setIsCreatingGallery(true);
      setError("");
      setMessage("");

      const response = await createGallery(
        eventId,
        {
          photoIds: selectedPhotos,
          pin: galleryPin,
        }
      );

      const createdGallery =
        response.data ||
        response.gallery ||
        response;

      setGallery(createdGallery);
      setIsGalleryMissing(false);

      setActiveTab("gallery");

      setMessage(
        "Customer gallery created successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to create customer gallery."
      );
    } finally {
      setIsCreatingGallery(false);
    }
  };

  const handlePublishGallery = async () => {
    if (!gallery?._id) {
      setError("Gallery does not exist yet.");
      return;
    }

    try {
      setIsPublishing(true);
      setError("");
      setMessage("");

      const response = await publishGallery(
        gallery._id
      );

      const publishedGallery =
        response.data ||
        response.gallery ||
        response;

      setGallery((current) => ({
        ...current,
        ...publishedGallery,
        isPublished: true,
        publishedAt:
          publishedGallery.publishedAt ||
          new Date().toISOString(),
      }));

      setMessage(
        "Gallery published successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to publish gallery."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // --------------------------------
  // HELPERS
  // --------------------------------

  const assignedMembers = useMemo(() => {
    return event?.teamMembers || [];
  }, [event]);

  const availableMembers = useMemo(() => {
    return teamMembers.filter(
      (member) =>
        !assignedMembers.some(
          (assigned) =>
            (assigned._id || assigned) ===
            member._id
        )
    );
  }, [teamMembers, assignedMembers]);

  const galleryUrl = gallery?.slug
    ? `${window.location.origin}/gallery/${gallery.slug}`
    : "";

  const galleryPhotos = useMemo(() => {
    if (!gallery?.photoIds) return [];

    return gallery.photoIds
      .map((photo) => {
        if (typeof photo === "object") {
          return photo;
        }

        return photos.find(
          (item) => item._id === photo
        );
      })
      .filter(Boolean);
  }, [gallery, photos]);

  const copyGalleryLink = async () => {
    if (!galleryUrl) return;

    try {
      await navigator.clipboard.writeText(
        galleryUrl
      );

      setIsCopied(true);
      setMessage(
        "Gallery link copied to clipboard."
      );

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      setError(
        "Unable to copy gallery link."
      );
    }
  };

  const openGallery = () => {
    if (!galleryUrl) return;

    window.open(
      galleryUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

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

  // --------------------------------
  // LOADING
  // --------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500">
            Loading event workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="font-semibold text-red-600">
            Event not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <div className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-6">

          <button
            onClick={() =>
              navigate("/admin/events")
            }
            className="mb-5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Events
          </button>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-3">

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ACTIVE EVENT
                </span>

                {gallery?.isPublished && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    GALLERY LIVE
                  </span>
                )}

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {event.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">

                {event.eventDate && (
                  <span>
                    📅 {formatDate(event.eventDate)}
                  </span>
                )}

                <span>
                  📷 {photos.length} photos
                </span>

                <span>
                  👥 {assignedMembers.length} members
                </span>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Selected
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPhotos.length}
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Gallery
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {gallery?.isPublished
                    ? "Live"
                    : gallery
                    ? "Draft"
                    : "Not created"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* --------------------------------
          MAIN
      -------------------------------- */}

      <main className="mx-auto max-w-7xl px-6 py-6">

        {/* ALERTS */}

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span>✓ {message}</span>

            <button
              onClick={() => setMessage("")}
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
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* --------------------------------
            TABS
        -------------------------------- */}

        <div className="mb-6 flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

          {[
            {
              id: "overview",
              label: "Overview",
              icon: "◉",
            },
            {
              id: "photos",
              label: "Photos",
              icon: "▦",
              count: photos.length,
            },
            {
              id: "gallery",
              label: "Gallery",
              icon: "◇",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{tab.icon}</span>

              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}

        </div>

        {/* =================================
            OVERVIEW
        ================================= */}

        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* EVENT INFO */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Event
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Event Information
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-medium text-slate-400">
                    Event Name
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {event.name}
                  </p>
                </div>

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

                <div className="rounded-xl bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 leading-6 text-slate-700">
                    {event.description ||
                      "No description added for this event."}
                  </p>
                </div>

              </div>

            </div>

            {/* QUICK STATS */}

            <div className="space-y-4">

              <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

                <p className="text-sm text-slate-400">
                  Photos
                </p>

                <p className="mt-2 text-4xl font-bold">
                  {photos.length}
                </p>

                <button
                  onClick={() =>
                    setActiveTab("photos")
                  }
                  className="mt-5 text-sm font-semibold text-white underline underline-offset-4"
                >
                  Manage photos →
                </button>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-sm text-slate-400">
                  Team Members
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {assignedMembers.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  assigned to this event
                </p>

              </div>

            </div>

            {/* TEAM */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Collaboration
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Team Members
                  </h2>
                </div>

              </div>

              <div className="flex flex-col gap-4 md:flex-row">

                <div className="flex flex-1 gap-2">

                  <select
                    value={selectedMember}
                    onChange={(e) =>
                      setSelectedMember(
                        e.target.value
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="">
                      Assign a team member...
                    </option>

                    {availableMembers.map(
                      (member) => (
                        <option
                          key={member._id}
                          value={member._id}
                        >
                          {member.name} —{" "}
                          {member.email}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    onClick={
                      handleAssignMember
                    }
                    disabled={
                      !selectedMember ||
                      isAssigning
                    }
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isAssigning
                      ? "..."
                      : "Assign"}
                  </button>

                </div>

              </div>

              {assignedMembers.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {assignedMembers.map(
                    (member) => {
                      const memberId =
                        member._id ||
                        member;

                      const fullMember =
                        typeof member ===
                        "object"
                          ? member
                          : teamMembers.find(
                              (item) =>
                                item._id ===
                                memberId
                            );

                      return (
                        <div
                          key={memberId}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">
                            {(
                              fullMember?.name ||
                              "T"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {fullMember?.name ||
                                "Team Member"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {fullMember?.email ||
                                ""}
                            </p>
                          </div>

                          <div className="ml-auto flex items-center gap-2">
                            <span className="hidden text-xs font-semibold text-emerald-600 sm:inline">
                              Assigned
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setMemberToRemove({
                                  _id: memberId,
                                  name: fullMember?.name || "Team Member",
                                  email: fullMember?.email || "",
                                })
                              }
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No team members assigned yet.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* =================================
            PHOTOS
        ================================= */}

        {activeTab === "photos" && (
          <div>

            {/* PHOTO HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Event Photos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select the photos you want to publish in the customer gallery.
                </p>
              </div>

              <div className="flex gap-2">

                {photos.length > 0 && (
                  <>
                    <button
                      onClick={
                        selectAllPhotos
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Select All
                    </button>

                    {selectedPhotos.length >
                      0 && (
                      <button
                        onClick={
                          clearSelection
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Clear
                      </button>
                    )}
                  </>
                )}

                <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  + Upload Photos

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

            </div>

            {/* EXISTING GALLERY NOTICE */}

            {gallery?.isPublished && (
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="font-semibold text-blue-900">
                    This event already has a published gallery.
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    {galleryPhotos.length} photo
                    {galleryPhotos.length !== 1
                      ? "s"
                      : ""} currently published.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setActiveTab("gallery")
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View Gallery →
                </button>

              </div>
            )}

            {/* SELECTED FILES */}

            {selectedFiles.length > 0 && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

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
                    onClick={() =>
                      setSelectedFiles([])
                    }
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Cancel
                  </button>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  {selectedFiles.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex max-w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
                      >
                        <span className="max-w-[180px] truncate">
                          {file.name}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatFileSize(
                            file.size
                          )}
                        </span>

                        <button
                          onClick={() =>
                            removeSelectedFile(
                              index
                            )
                          }
                          className="font-bold text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}

                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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
            )}

            {/* PHOTO GRID */}

            {photos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  📷
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No photos yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Upload event photos and select the best ones to create your customer gallery.
                </p>

                <label className="mt-6 inline-block cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
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

                {photos.map((photo) => {

                  const isSelected =
                    selectedPhotos.includes(
                      photo._id
                    );

                  return (
                    <button
                      key={photo._id}
                      type="button"
                      onClick={() =>
                        togglePhotoSelection(
                          photo._id
                        )
                      }
                      className={`group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 text-left transition duration-200 ${
                        isSelected
                          ? "ring-4 ring-slate-900 ring-offset-2"
                          : "hover:-translate-y-0.5 hover:shadow-lg"
                      }`}
                    >

                      <img
                        src={
                          photo.storageUrl
                        }
                        alt={
                          photo.filename
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div
                        className={`absolute inset-0 transition ${
                          isSelected
                            ? "bg-slate-900/30"
                            : "bg-black/0 group-hover:bg-black/10"
                        }`}
                      />

                      <div
                        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                          isSelected
                            ? "border-white bg-slate-900 text-white"
                            : "border-white/80 bg-black/20 text-transparent"
                        }`}
                      >
                        ✓
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 opacity-0 transition group-hover:opacity-100">

                        <p className="truncate text-xs font-medium text-white">
                          {photo.filename}
                        </p>

                        <p className="mt-1 text-[10px] text-white/70">
                          {formatFileSize(
                            photo.fileSize
                          )}
                        </p>

                      </div>

                    </button>
                  );
                })}

              </div>
            )}

          </div>
        )}

        {/* =================================
            GALLERY
        ================================= */}

        {activeTab === "gallery" && (
          <div className="mx-auto max-w-4xl">

            {!gallery ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="bg-slate-900 px-6 py-10 text-center text-white md:px-12">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                    ✦
                  </div>

                  <h2 className="mt-5 text-2xl font-bold md:text-3xl">
                    Create Customer Gallery
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
                    Turn your selected event photos into a private gallery that can be shared with your customer.
                  </p>

                </div>

                <div className="p-6 md:p-10">

                  <div className="mb-8 flex items-center justify-between rounded-2xl bg-slate-50 p-5">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Photos selected
                      </p>

                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {selectedPhotos.length}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setActiveTab(
                          "photos"
                        )
                      }
                      className="text-sm font-semibold text-slate-700 underline underline-offset-4"
                    >
                      Change selection
                    </button>

                  </div>

                  <div className="mx-auto max-w-md">

                    <label className="text-sm font-semibold text-slate-800">
                      Gallery PIN
                    </label>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Customers will enter this PIN before they can view the gallery.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={galleryPin}
                      onChange={(e) =>
                        setGalleryPin(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="4–6 digit PIN"
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-slate-400 focus:bg-white"
                    />

                    <button
                      onClick={
                        handleCreateGallery
                      }
                      disabled={
                        isCreatingGallery ||
                        selectedPhotos.length ===
                          0 ||
                        !galleryPin
                      }
                      className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isCreatingGallery
                        ? "Creating..."
                        : "Create Gallery"}
                    </button>

                  </div>

                </div>

              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                {/* GALLERY STATUS */}

                <div
                  className={`px-6 py-10 text-center text-white md:px-12 ${
                    gallery.isPublished
                      ? "bg-emerald-700"
                      : "bg-slate-900"
                  }`}
                >

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
                    {gallery.isPublished
                      ? "✓"
                      : "🔒"}
                  </div>

                  <h2 className="mt-5 text-2xl font-bold md:text-3xl">
                    {gallery.isPublished
                      ? "Gallery is Live"
                      : "Gallery Ready"}
                  </h2>

                  <p className="mt-3 text-sm text-white/75">
                    {gallery.isPublished
                      ? "Your customer can now access the published photos."
                      : "Your gallery has been created and is ready to publish."}
                  </p>

                </div>

                <div className="space-y-6 p-6 md:p-10">

                  {/* STATUS */}

                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Status
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {gallery.isPublished
                          ? "Published"
                          : "Draft"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        gallery.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {gallery.isPublished
                        ? "LIVE"
                        : "DRAFT"}
                    </span>

                  </div>

                  {/* PIN */}

                  <div className="rounded-2xl border border-slate-100 p-5">

                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Customer PIN
                    </p>

                    {galleryPin ? (
                      <p className="mt-2 text-3xl font-bold tracking-[0.35em] text-slate-900">
                        {galleryPin}
                      </p>
                    ) : (
                      <p className="mt-2 font-semibold text-slate-700">
                        Protected PIN
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-500">
                      The PIN is securely stored and cannot be recovered after leaving this page.
                    </p>

                  </div>

                  {/* LINK */}

                  {gallery.slug && (
                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <p className="text-sm font-semibold text-slate-800">
                          Shareable Gallery Link
                        </p>

                        {gallery.isPublished && (
                          <span className="text-xs font-semibold text-emerald-600">
                            ● LIVE
                          </span>
                        )}

                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">

                        <input
                          type="text"
                          readOnly
                          value={
                            galleryUrl
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                        />

                        <button
                          onClick={
                            copyGalleryLink
                          }
                          className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isCopied
                            ? "✓ Copied"
                            : "Copy Link"}
                        </button>

                      </div>

                      {gallery.isPublished && (
                        <button
                          onClick={openGallery}
                          className="mt-3 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          View Customer Gallery →
                        </button>
                      )}

                    </div>
                  )}

                  {/* GALLERY PHOTOS */}

                  <div className="border-t border-slate-100 pt-6">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Published Gallery Photos
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {galleryPhotos.length} photo
                          {galleryPhotos.length !== 1
                            ? "s"
                            : ""}{" "}
                          selected for this gallery.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setActiveTab(
                            "photos"
                          )
                        }
                        className="text-sm font-semibold text-slate-700 underline underline-offset-4"
                      >
                        Manage Photos
                      </button>

                    </div>

                    {galleryPhotos.length > 0 ? (
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                        {galleryPhotos.map(
                          (photo) => (
                            <div
                              key={photo._id}
                              className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                            >
                              <img
                                src={
                                  photo.storageUrl
                                }
                                alt={
                                  photo.filename
                                }
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />

                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                <p className="truncate text-xs font-medium text-white">
                                  {photo.filename}
                                </p>
                              </div>
                            </div>
                          )
                        )}

                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                        <p className="text-sm text-slate-500">
                          No photos selected for this gallery.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* PUBLISH */}

                  {!gallery.isPublished && (
                    <button
                      onClick={
                        handlePublishGallery
                      }
                      disabled={isPublishing}
                      className="w-full rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPublishing
                        ? "Publishing Gallery..."
                        : "Publish Gallery →"}
                    </button>
                  )}

                  {gallery.isPublished && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">

                      <p className="font-semibold text-emerald-800">
                        ✓ Gallery published successfully
                      </p>

                      <p className="mt-1 text-sm text-emerald-700">
                        Share the link and PIN with your customer.
                      </p>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* =================================
          REMOVE TEAM MEMBER MODAL
      ================================= */}

      {memberToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-member-title"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
              ⚠
            </div>

            <h2
              id="remove-member-title"
              className="mt-5 text-xl font-bold text-slate-900"
            >
              Remove team member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="font-semibold text-slate-800">
                {memberToRemove.name}
              </span>{" "}
              will no longer have access to this event. Their account and
              existing uploaded photos will remain unchanged.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={isRemovingMember}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemoveMember}
                disabled={isRemovingMember}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRemovingMember
                  ? "Removing..."
                  : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================
          FLOATING SELECTION BAR
      ================================= */}

      {activeTab === "photos" &&
        selectedPhotos.length > 0 &&
        !gallery && (
          <div className="fixed inset-x-0 bottom-5 z-50 px-4">

            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-2xl ring-1 ring-white/10">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-bold">
                  {selectedPhotos.length}
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">
                    Photos selected
                  </p>

                  <p className="text-xs text-slate-400">
                    Ready to create a customer gallery
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={clearSelection}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Clear
                </button>

                <button
                  onClick={() =>
                    setActiveTab("gallery")
                  }
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Create Gallery →
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default EventDetail;