const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  AUTH_NOT_IMPLEMENTED,
  AUTH_REGISTRATION_SUCCESS,
  AUTH_LOGIN_SUCCESS,
  AUTH_DUPLICATE_EMAIL,
  AUTH_INVALID_CREDENTIALS,
  AUTH_UNEXPECTED_ERROR,
} = require('../constants/messages');
const authService = require('../services/authService');
const registerSchema = require('../validators/auth/registerValidator');
const loginSchema = require('../validators/auth/loginValidator');

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(res, parsed.error.errors[0].message, httpStatus.BAD_REQUEST, parsed.error.errors);
  }

  try {
    const user = await authService.registerUser(parsed.data);
    return successResponse(res, AUTH_REGISTRATION_SUCCESS, {
      id: user.id, name: user.name, email: user.email, role: user.role,
    }, httpStatus.CREATED);
  } catch (error) {
    if (error.message === AUTH_DUPLICATE_EMAIL) {
      return errorResponse(res, AUTH_DUPLICATE_EMAIL, httpStatus.CONFLICT);
    }
    return errorResponse(res, AUTH_UNEXPECTED_ERROR, httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return errorResponse(res, parsed.error.errors[0].message, httpStatus.BAD_REQUEST, parsed.error.errors);
  }

  try {
    const { token, user } = await authService.loginUser(parsed.data);
    return successResponse(res, AUTH_LOGIN_SUCCESS, { token, user }, httpStatus.OK);
  } catch (error) {
    if (error.message === AUTH_INVALID_CREDENTIALS) {
      return errorResponse(res, AUTH_INVALID_CREDENTIALS, httpStatus.UNAUTHORIZED);
    }
    return errorResponse(res, AUTH_UNEXPECTED_ERROR, httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const logout = asyncHandler(async (_req, res) => {
  return successResponse(res, 'Logout successful', null, httpStatus.OK);
});

const profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user);
  return successResponse(res, 'Profile retrieved successfully', user, httpStatus.OK);
});

module.exports = { register, login, logout, profile };
