const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Each image must be 10 MB or smaller",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 20 photos at once",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Photo upload failed",
    });
  }

  if (
    err.message ===
    "Only JPEG, PNG, and WEBP images are allowed"
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

module.exports = errorHandler;
