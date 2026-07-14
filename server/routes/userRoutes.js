const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email phone')
      .sort('name')
      .lean();
    return successResponse(res, 'Customers fetched successfully', customers, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, httpStatus.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
