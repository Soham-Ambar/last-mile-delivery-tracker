const { verifyAccessToken } = require('../utils/jwt');
const httpStatus = require('../utils/httpStatus');
const { AUTH_UNAUTHORIZED, AUTH_TOKEN_INVALID } = require('../constants/messages');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: 'error',
      message: AUTH_UNAUTHORIZED,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: 'error',
      message: AUTH_TOKEN_INVALID,
    });
  }
}

module.exports = authMiddleware;
