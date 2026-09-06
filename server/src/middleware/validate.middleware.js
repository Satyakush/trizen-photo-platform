const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = source === "params" ? req.params : req.body;

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field) {
          errors[field] = issue.message;
        }
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (source === "params") {
      req.params = result.data;
    } else {
      req.body = result.data;
    }

    next();
  };
};

module.exports = validate;