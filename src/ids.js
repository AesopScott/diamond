export function normalizeId(value, label = "id") {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string`);
  }

  const id = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!id) throw new Error(`${label} cannot be empty`);
  return id;
}

export function makeId(prefix, value) {
  return `${normalizeId(prefix, "prefix")}-${normalizeId(value, "value")}`;
}
