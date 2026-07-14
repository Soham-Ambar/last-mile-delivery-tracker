const httpStatus = require('../utils/httpStatus');

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
}

module.exports = { authorize };
