const jwt = require("jsonwebtoken");

const authenticateGallery = (
  req,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Gallery authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.GALLERY_TOKEN_SECRET
    );

    if (decoded.type !== "gallery") {
      return res.status(401).json({
        success: false,
        message: "Invalid gallery token",
      });
    }

    req.gallery = {
      id: decoded.galleryId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired gallery token",
    });
  }
};

module.exports = authenticateGallery;