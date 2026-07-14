function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value.replace(/\$[a-zA-Z0-9_]+/g, '').replace(/\.\$/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (!key.startsWith('$')) {
        clean[key] = sanitizeValue(value[key]);
      }
    }
    return clean;
  }
  return value;
}

function sanitize(req, _res, next) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) {
    const clean = {};
    for (const key of Object.keys(req.query)) {
      clean[key] = sanitizeValue(req.query[key]);
    }
    req.query = clean;
  }
  if (req.params) {
    const clean = {};
    for (const key of Object.keys(req.params)) {
      clean[key] = sanitizeValue(req.params[key]);
    }
    req.params = clean;
  }
  next();
}

module.exports = sanitize;
