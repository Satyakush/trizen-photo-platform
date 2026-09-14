const requireSetupKey = (req, res, next) => {
  const configuredKey = process.env.ADMIN_SETUP_KEY;
  const providedKey = req.get("x-admin-setup-key");

  if (!configuredKey || providedKey !== configuredKey) {
    return res.status(403).json({
      success: false,
      message: "Admin registration is not available",
    });
  }

  next();
};

module.exports = requireSetupKey;
