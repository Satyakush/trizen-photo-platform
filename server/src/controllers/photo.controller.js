const photoService = require("../services/photo.service");

const uploadPhotos = async (req, res, next) => {
  try {
    const photos = await photoService.uploadPhotos(
      req.params.eventId,
      req.user,
      req.files
    );

    res.status(201).json({
      success: true,
      message: "Photos uploaded successfully",
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

const getEventPhotos = async (req, res, next) => {
  try {
    const photos =
      await photoService.getEventPhotos(
        req.params.eventId,
        req.user
      );

    res.status(200).json({
      success: true,
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

const getMyPhotos = async (req, res, next) => {
  try {
    const photos =
      await photoService.getMyPhotos(
        req.params.eventId,
        req.user
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
  uploadPhotos,
  getEventPhotos,
  getMyPhotos,
};