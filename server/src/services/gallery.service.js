const bcrypt = require("bcryptjs");

const Gallery = require("../models/Gallery");
const Event = require("../models/Event");
const Photo = require("../models/Photo");

const generateSlug = require("../utils/generateSlug");
const generateGalleryToken = require("../utils/generateGalleryToken");

const checkAdminEventAccess = async (
  eventId,
  adminId
) => {
  const event = await Event.findOne({
    _id: eventId,
    createdBy: adminId,
  });

  if (!event) {
    const error = new Error(
      "Event not found or you are not authorized to manage it"
    );

    error.statusCode = 404;
    throw error;
  }

  return event;
};

const createGallery = async (
  eventId,
  adminId,
  { photoIds, pin }
) => {
  await checkAdminEventAccess(
    eventId,
    adminId
  );

  const existingGallery =
    await Gallery.findOne({ eventId });

  if (existingGallery) {
    const error = new Error(
      "A gallery already exists for this event"
    );

    error.statusCode = 409;
    throw error;
  }

  const photos = await Photo.find({
    _id: { $in: photoIds },
    eventId,
  });

  if (photos.length !== photoIds.length) {
    const error = new Error(
      "One or more selected photos do not belong to this event"
    );

    error.statusCode = 400;
    throw error;
  }

  const pinHash = await bcrypt.hash(pin, 12);

  const event = await Event.findById(eventId);

  const gallery = await Gallery.create({
    eventId,
    photoIds,
    slug: generateSlug(event.name),
    pinHash,
    createdBy: adminId,
  });

  return Gallery.findById(gallery._id).populate(
    "photoIds"
  );
};

const getGallery = async (
  galleryId,
  adminId
) => {
  const gallery = await Gallery.findOne({
    _id: galleryId,
    createdBy: adminId,
  }).populate("photoIds");

  if (!gallery) {
    const error = new Error(
      "Gallery not found or you are not authorized to access it"
    );

    error.statusCode = 404;
    throw error;
  }

  return gallery;
};

const updateGallery = async (
  galleryId,
  adminId,
  { photoIds, pin }
) => {
  const gallery = await Gallery.findOne({
    _id: galleryId,
    createdBy: adminId,
  });

  if (!gallery) {
    const error = new Error(
      "Gallery not found or you are not authorized to update it"
    );

    error.statusCode = 404;
    throw error;
  }

  if (gallery.isPublished) {
    const error = new Error(
      "Published galleries cannot be modified"
    );

    error.statusCode = 400;
    throw error;
  }

  const photos = await Photo.find({
    _id: { $in: photoIds },
    eventId: gallery.eventId,
  });

  if (photos.length !== photoIds.length) {
    const error = new Error(
      "One or more selected photos do not belong to this event"
    );

    error.statusCode = 400;
    throw error;
  }

  gallery.photoIds = photoIds;

  if (pin) {
    gallery.pinHash = await bcrypt.hash(
      pin,
      12
    );
  }

  await gallery.save();

  return Gallery.findById(gallery._id).populate(
    "photoIds"
  );
};

const publishGallery = async (
  galleryId,
  adminId
) => {
  const gallery = await Gallery.findOne({
    _id: galleryId,
    createdBy: adminId,
  });

  if (!gallery) {
    const error = new Error(
      "Gallery not found or you are not authorized to publish it"
    );

    error.statusCode = 404;
    throw error;
  }

  if (gallery.photoIds.length === 0) {
    const error = new Error(
      "Cannot publish a gallery without photos"
    );

    error.statusCode = 400;
    throw error;
  }

  if (gallery.isPublished) {
    const error = new Error(
      "Gallery is already published"
    );

    error.statusCode = 409;
    throw error;
  }

  gallery.isPublished = true;
  gallery.publishedAt = new Date();

  await gallery.save();

  return gallery;
};

const verifyGalleryPin = async (
  slug,
  pin
) => {
  const gallery = await Gallery.findOne({
    slug,
  });

  if (!gallery || !gallery.isPublished) {
    const error = new Error(
      "Gallery not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const isPinValid = await bcrypt.compare(
    pin,
    gallery.pinHash
  );

  if (!isPinValid) {
    const error = new Error(
      "Incorrect gallery PIN"
    );

    error.statusCode = 401;
    throw error;
  }

  const token =
    generateGalleryToken(gallery);

  return {
    token,
    gallery: {
      id: gallery._id,
      slug: gallery.slug,
      eventId: gallery.eventId,
    },
  };
};

const getPublicGalleryPhotos = async (
  slug,
  galleryId
) => {
  const gallery = await Gallery.findOne({
    _id: galleryId,
    slug,
    isPublished: true,
  });

  if (!gallery) {
    const error = new Error(
      "Gallery not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return Photo.find({
    _id: { $in: gallery.photoIds },
  })
    .populate(
      "uploadedBy",
      "name"
    )
    .sort({ createdAt: -1 });
};

module.exports = {
  createGallery,
  getGallery,
  updateGallery,
  publishGallery,
  verifyGalleryPin,
  getPublicGalleryPhotos,
};