const Event = require("../models/Event");
const Photo = require("../models/Photo");
const cloudinary = require("../config/cloudinary");

const checkEventAccess = async (eventId, user) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "admin") {
    if (event.createdBy.toString() !== user.id.toString()) {
      const error = new Error(
        "You are not authorized to access this event"
      );

      error.statusCode = 403;
      throw error;
    }

    return event;
  }

  const isAssigned = event.teamMembers.some(
    (memberId) =>
      memberId.toString() === user.id.toString()
  );

  if (!isAssigned) {
    const error = new Error(
      "You are not authorized to access this event"
    );

    error.statusCode = 403;
    throw error;
  }

  return event;
};

const uploadToCloudinary = (file, eventId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `trizen-photo-platform/events/${eventId}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      "Failed to delete Cloudinary image:",
      error.message
    );
  }
};

const uploadPhotos = async (
  eventId,
  user,
  files
) => {
  await checkEventAccess(eventId, user);

  if (!files || files.length === 0) {
    const error = new Error(
      "At least one photo is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const uploadedPhotos = [];

  try {
    for (const file of files) {
      const result = await uploadToCloudinary(
        file,
        eventId
      );

      const photo = await Photo.create({
        eventId,
        uploadedBy: user.id,
        filename: file.originalname,
        storageUrl: result.secure_url,
        storagePublicId: result.public_id,
        fileSize: file.size,
      });

      uploadedPhotos.push(photo);
    }

    return uploadedPhotos;
  } catch (error) {
    for (const photo of uploadedPhotos) {
      await deleteFromCloudinary(
        photo.storagePublicId
      );
    }

    throw error;
  }
};

const getEventPhotos = async (
  eventId,
  user
) => {
  await checkEventAccess(eventId, user);

  return Photo.find({ eventId })
    .populate(
      "uploadedBy",
      "name email role"
    )
    .sort({ createdAt: -1 });
};

const getMyPhotos = async (
  eventId,
  user
) => {
  await checkEventAccess(eventId, user);

  if (user.role !== "team_member") {
    const error = new Error(
      "This endpoint is only available to team members"
    );

    error.statusCode = 403;
    throw error;
  }

  return Photo.find({
    eventId,
    uploadedBy: user.id,
  }).sort({ createdAt: -1 });
};

module.exports = {
  checkEventAccess,
  uploadPhotos,
  getEventPhotos,
  getMyPhotos,
};