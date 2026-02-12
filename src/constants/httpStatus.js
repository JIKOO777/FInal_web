// src/constants/httpStatus.js
// Единый список HTTP статусов (по просьбе: 200, 201, 300, 400, 401, 403, 404, 405, 500)

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  MULTIPLE_CHOICES: 300,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500
});
