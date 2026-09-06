const galleryService = require("../services/gallery.service");

const createGallery = async (
  req,
  res,
  next
) => {
  try {
    const gallery =
      await galleryService.createGallery(
        req.params.eventId,
        req.user.id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Gallery created successfully",
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const getGallery = async (
  req,
  res,
  next
) => {
  try {
    const gallery =
      await galleryService.getGallery(
        req.params.galleryId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const updateGallery = async (
  req,
  res,
  next
) => {
  try {
    const gallery =
      await galleryService.updateGallery(
        req.params.galleryId,
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const publishGallery = async (
  req,
  res,
  next
) => {
  try {
    const gallery =
      await galleryService.publishGallery(
        req.params.galleryId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message: "Gallery published successfully",
      data: {
        id: gallery._id,
        slug: gallery.slug,
        isPublished: gallery.isPublished,
        publishedAt: gallery.publishedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyGalleryPin = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await galleryService.verifyGalleryPin(
        req.params.slug,
        req.body.pin
      );

    res.status(200).json({
      success: true,
      message: "Gallery PIN verified",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicGalleryPhotos = async (
  req,
  res,
  next
) => {
  try {
    const photos =
      await galleryService.getPublicGalleryPhotos(
        req.params.slug,
        req.gallery.id
      );

    res.status(200).json({
      success: true,
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGallery,
  getGallery,
  updateGallery,
  publishGallery,
  verifyGalleryPin,
  getPublicGalleryPhotos,
};