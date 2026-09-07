import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  assignTeamMember,
  getEvent,
  getTeamMembers,
} from "../../services/event.service";

import {
  getEventPhotos,
  uploadPhotos,
} from "../../services/photo.service";

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

  const [event, setEvent] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
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

      const [eventResponse, membersResponse, photosResponse] =
        await Promise.all([
          getEvent(eventId),
          getTeamMembers(),
          getEventPhotos(eventId),
        ]);

      setEvent(eventResponse.data || eventResponse.event || null);

      setTeamMembers(
        membersResponse.data ||
          membersResponse.teamMembers ||
          membersResponse.users ||
          []
      );

      setPhotos(photosResponse || []);
    } catch (err) {
      console.error("Failed to load event data:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load event details."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        response.message || "Team member assigned successfully."
      );

      setSelectedMember("");

      await loadEventData();
    } catch (err) {
      console.error("Failed to assign team member:", err);

      setError(
        err.response?.data?.message ||
          "Failed to assign team member."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleFileChange = (event) => {
    setError("");
    setMessage("");

    const files = Array.from(event.target.files || []);

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
        `Each image must be 10 MB or smaller. "${oversizedFile.name}" is too large.`
      );
      return;
    }

    setSelectedFiles(files);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
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

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos((current) => {
      if (current.includes(photoId)) {
        return current.filter((id) => id !== photoId);
      }

      return [...current, photoId];
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(photos.map((photo) => photo._id));
  };

  const clearPhotoSelection = () => {
    setSelectedPhotos([]);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${
      units[index]
    }`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">
          Loading event...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Event not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/events")}
            className="mb-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Events
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {event.name}
          </h1>

          {event.description && (
            <p className="mt-2 text-gray-600">
              {event.description}
            </p>
          )}

          {event.eventDate && (
            <p className="mt-1 text-sm text-gray-500">
              Event Date:{" "}
              {new Date(event.eventDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Team Members */}
      <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Team Members
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Assign existing team members to this event.
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedMember}
            onChange={(e) =>
              setSelectedMember(e.target.value)
            }
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
          >
            <option value="">
              Select a team member
            </option>

            {teamMembers
              .filter(
                (member) =>
                  !(event.teamMembers || []).some(
                    (assignedMember) =>
                      (assignedMember._id || assignedMember) ===
                      member._id
                  )
              )
              .map((member) => (
                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name} ({member.email})
                </option>
              ))}
          </select>

          <button
            onClick={handleAssignMember}
            disabled={
              !selectedMember || isAssigning
            }
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {(event.teamMembers || []).length === 0 ? (
            <p className="text-sm text-gray-500">
              No team members assigned yet.
            </p>
          ) : (
            event.teamMembers.map((member) => {
              const memberId =
                member._id || member;

              const fullMember =
                typeof member === "object"
                  ? member
                  : teamMembers.find(
                      (item) => item._id === memberId
                    );

              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {fullMember?.name || "Team Member"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {fullMember?.email || ""}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    Assigned
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Admin Photo Upload */}
      <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Photos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload photos directly to this event as an Admin.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-gray-500 hover:bg-gray-50">
          <div className="text-4xl">📷</div>

          <p className="mt-3 font-medium text-gray-900">
            Click to select photos
          </p>

          <p className="mt-1 text-sm text-gray-500">
            JPEG, PNG or WEBP · Maximum 10 MB each · Maximum 20 photos
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {selectedFiles.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium text-gray-900">
                {selectedFiles.length} photo
                {selectedFiles.length > 1 ? "s" : ""} selected
              </p>

              <button
                onClick={handleClearFiles}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleRemoveFile(index)
                    }
                    className="ml-4 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-5 w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${selectedFiles.length} Photo${
                    selectedFiles.length > 1 ? "s" : ""
                  }`}
            </button>
          </div>
        )}
      </section>

      {/* Review Photos */}
      <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Review Photos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review all photos uploaded to this event.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={selectAllPhotos}
              disabled={photos.length === 0}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Select All
            </button>

            <button
              onClick={clearPhotoSelection}
              disabled={selectedPhotos.length === 0}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <span className="font-semibold">
            {photos.length}
          </span>{" "}
          total photo{photos.length !== 1 ? "s" : ""} ·{" "}
          <span className="font-semibold">
            {selectedPhotos.length}
          </span>{" "}
          selected
        </div>

        {photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
            <p className="text-gray-500">
              No photos uploaded yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Upload photos using the section above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const isSelected = selectedPhotos.includes(
                photo._id
              );

              return (
                <button
                  key={photo._id}
                  type="button"
                  onClick={() =>
                    togglePhotoSelection(photo._id)
                  }
                  className={`group relative overflow-hidden rounded-xl border-2 text-left transition ${
                    isSelected
                      ? "border-gray-900 ring-2 ring-gray-900/20"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={photo.storageUrl}
                    alt={photo.filename}
                    className="aspect-square w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                    <p className="truncate text-xs font-medium text-white">
                      {photo.filename}
                    </p>

                    <p className="mt-1 text-xs text-gray-300">
                      {formatFileSize(photo.fileSize)}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default EventDetail;