const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const user = await authService.registerAdmin(req.body);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};