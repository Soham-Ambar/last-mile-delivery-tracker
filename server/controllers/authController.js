const httpStatus = require('../utils/httpStatus');
const { AUTH_NOT_IMPLEMENTED } = require('../constants/messages');

async function register(req, res) {
  return res.status(httpStatus.NOT_IMPLEMENTED).json({
    status: 'error',
    message: AUTH_NOT_IMPLEMENTED,
  });
}

async function login(req, res) {
  return res.status(httpStatus.NOT_IMPLEMENTED).json({
    status: 'error',
    message: AUTH_NOT_IMPLEMENTED,
  });
}

async function logout(req, res) {
  return res.status(httpStatus.NOT_IMPLEMENTED).json({
    status: 'error',
    message: AUTH_NOT_IMPLEMENTED,
  });
}

async function profile(req, res) {
  return res.status(httpStatus.NOT_IMPLEMENTED).json({
    status: 'error',
    message: AUTH_NOT_IMPLEMENTED,
  });
}

module.exports = {
  register,
  login,
  logout,
  profile,
};
