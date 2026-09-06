const generateSlug = (name) => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8);

  return `${baseSlug}-${randomPart}`;
};

module.exports = generateSlug;