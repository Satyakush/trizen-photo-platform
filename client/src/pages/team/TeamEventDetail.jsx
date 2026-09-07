import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AdminLayout from "../../components/layout/AdminLayout";

import { getEvent } from "../../services/event.service";
import { getEventPhotos } from "../../services/photo.service";

import {
  createGallery,
  publishGallery,
  updateGallery,
} from "../../services/gallery.service";

const EventDetail = () => {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const [gallery, setGallery] = useState(null);
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [error, setError] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventResponse, photoResponse] =
        await Promise.all([
          getEvent(eventId),
          getEventPhotos(eventId),
        ]);

      setEvent(eventResponse.event);

      // Backend returns { success: true, data: [...] }
      setPhotos(
        photoResponse.data ||
          photoResponse.photos ||
          []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load event"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const togglePhoto = (photoId) => {
    setSelectedPhotos((current) => {
      if (current.includes(photoId)) {
        return current.filter((id) => id !== photoId);
      }

      return [...current, photoId];
    });
  };

  const selectAll = () => {
    setSelectedPhotos(photos.map((photo) => photo._id));
  };

  const clearSelection = () => {
    setSelectedPhotos([]);
  };

  const handleCreateGallery = async () => {
    if (selectedPhotos.length === 0) {
      setGalleryError(
        "Select at least one photo before creating the gallery."
      );
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setGalleryError(
        "PIN must contain 4 to 6 digits."
      );
      return;
    }

    try {
      setGalleryLoading(true);
      setGalleryError("");
      setSuccess("");

      const response = await createGallery(eventId, {
        photoIds: selectedPhotos,
        pin,
      });

      setGallery(response.gallery || response.data);

      setSuccess("Gallery created successfully.");
    } catch (error) {
      setGalleryError(
        error.response?.data?.message ||
          "Failed to create gallery"
      );
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleUpdateGallery = async () => {
    if (!gallery) return;

    if (selectedPhotos.length === 0) {
      setGalleryError(
        "Select at least one photo for the gallery."
      );
      return;
    }

    try {
      setGalleryLoading(true);
      setGalleryError("");
      setSuccess("");

      const response = await updateGallery(
        gallery._id,
        {
          photoIds: selectedPhotos,
          ...(pin
            ? {
                pin,
              }
            : {}),
        }
      );

      setGallery(response.gallery || response.data);

      setSuccess("Gallery updated successfully.");
    } catch (error) {
      setGalleryError(
        error.response?.data?.message ||
          "Failed to update gallery"
      );
    } finally {
      setGalleryLoading(false);
    }
  };

  const handlePublishGallery = async () => {
    if (!gallery) return;

    try {
      setPublishing(true);
      setGalleryError("");
      setSuccess("");

      const response = await publishGallery(
        gallery._id
      );

      const publishedGallery =
        response.gallery || response.data;

      setGallery(
        publishedGallery || {
          ...gallery,
          isPublished: true,
          publishedAt: new Date().toISOString(),
        }
      );

      setSuccess("Gallery published successfully.");
    } catch (error) {
      setGalleryError(
        error.response?.data?.message ||
          "Failed to publish gallery"
      );
    } finally {
      setPublishing(false);
    }
  };

  const copyGalleryLink = async () => {
    if (!gallery?.slug) return;

    const url = `${window.location.origin}/gallery/${gallery.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setSuccess("Gallery link copied.");
    } catch {
      setSuccess(url);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-500">
          Loading event...
        </p>
      </AdminLayout>
    );
  }

  if (error && !event) {
    return (
      <AdminLayout>
        <Link
          to="/admin"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Back */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {event.name}
          </h1>

          {event.description && (
            <p className="mt-2 text-gray-600">
              {event.description}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Event Date:{" "}
            {new Date(
              event.eventDate
            ).toLocaleDateString()}
          </p>
        </div>

        {/* Team Members */}
        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Team Members
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Members assigned to this event.
          </p>

          <div className="mt-5">
            {event.teamMembers?.length === 0 ? (
              <p className="text-sm text-gray-500">
                No team members assigned.
              </p>
            ) : (
              <div className="space-y-3">
                {event.teamMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                      Assigned
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Photo Review */}
        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Review Photos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the photos you want to publish in
                the customer gallery.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                disabled={photos.length === 0}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedPhotos.length === 0}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mb-5 rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-sm font-medium text-gray-900">
              {selectedPhotos.length}
            </span>{" "}
            <span className="text-sm text-gray-500">
              of {photos.length} photos selected
            </span>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-10 text-center text-gray-500">
              No photos have been uploaded to this event
              yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => {
                const isSelected =
                  selectedPhotos.includes(photo._id);

                return (
                  <button
                    type="button"
                    key={photo._id}
                    onClick={() =>
                      togglePhoto(photo._id)
                    }
                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition ${
                      isSelected
                        ? "border-gray-900"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo.storageUrl}
                      alt={photo.filename}
                      className="h-52 w-full object-cover transition group-hover:scale-105"
                    />

                    {/* Selection overlay */}
                    <div
                      className={`absolute inset-0 transition ${
                        isSelected
                          ? "bg-black/20"
                          : "bg-transparent group-hover:bg-black/10"
                      }`}
                    />

                    {/* Checkbox */}
                    <div className="absolute left-3 top-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-white"
                        }`}
                      >
                        {isSelected && "✓"}
                      </div>
                    </div>

                    {/* Filename */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
                      <p className="truncate text-xs text-white">
                        {photo.filename}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Gallery Management */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {gallery
                ? "Gallery Management"
                : "Create Customer Gallery"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {gallery
                ? gallery.isPublished
                  ? "This gallery has been published."
                  : "Review the gallery before publishing it."
                : "Create a PIN-protected gallery from your selected photos."}
            </p>
          </div>

          {galleryError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {galleryError}
            </div>
          )}

          {/* PIN */}
          {!gallery && (
            <div className="mb-6 max-w-sm">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gallery PIN
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) =>
                  setPin(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 4-6 digit PIN"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-300"
              />

              <p className="mt-1 text-xs text-gray-500">
                Customers will need this PIN to access the
                gallery.
              </p>
            </div>
          )}

          {gallery && (
            <div className="space-y-5">
              {/* Gallery Status */}
              <div className="rounded-xl bg-gray-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Status
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {gallery.isPublished
                        ? "Published"
                        : "Unpublished"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      gallery.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {gallery.isPublished
                      ? "Live"
                      : "Draft"}
                  </span>
                </div>
              </div>

              {/* Gallery Link */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gallery Link
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={`${window.location.origin}/gallery/${gallery.slug}`}
                    className="flex-1 rounded-lg border bg-gray-50 px-4 py-3 text-sm"
                  />

                  <button
                    type="button"
                    onClick={copyGalleryLink}
                    className="rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* PIN */}
              <div className="max-w-sm">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gallery PIN
                </label>

                <input
                  type="password"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="Enter new PIN"
                  disabled={gallery.isPublished}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  PIN changes are available while the gallery
                  is unpublished.
                </p>
              </div>

              {/* Actions */}
              {!gallery.isPublished && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleUpdateGallery}
                    disabled={
                      galleryLoading ||
                      selectedPhotos.length === 0
                    }
                    className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    {galleryLoading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishGallery}
                    disabled={
                      publishing ||
                      selectedPhotos.length === 0
                    }
                    className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {publishing
                      ? "Publishing..."
                      : "Publish Gallery"}
                  </button>
                </div>
              )}

              {gallery.isPublished && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  This gallery is live. Customers can access
                  it using the gallery link and PIN.
                </div>
              )}
            </div>
          )}

          {!gallery && (
            <button
              type="button"
              onClick={handleCreateGallery}
              disabled={
                galleryLoading ||
                selectedPhotos.length === 0
              }
              className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {galleryLoading
                ? "Creating Gallery..."
                : `Create Gallery (${selectedPhotos.length} Photos)`}
            </button>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default EventDetail;