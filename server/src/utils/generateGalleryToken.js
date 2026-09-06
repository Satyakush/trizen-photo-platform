const jwt = require("jsonwebtoken");

const generateGalleryToken = (gallery) => {
  return jwt.sign(
    {
      galleryId: gallery._id.toString(),
      type: "gallery",
    },
    process.env.GALLERY_TOKEN_SECRET,
    {
      expiresIn:
        process.env.GALLERY_TOKEN_EXPIRES_IN || "1h",
    }
  );
};

module.exports = generateGalleryToken;