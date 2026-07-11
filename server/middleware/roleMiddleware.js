const httpStatus = require('../utils/httpStatus');
const { AUTH_UNAUTHORIZED } = require('../constants/messages');

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: 'error',
        message: AUTH_UNAUTHORIZED,
      });
    }

    next();
  };
}

module.exports = { authorize };
