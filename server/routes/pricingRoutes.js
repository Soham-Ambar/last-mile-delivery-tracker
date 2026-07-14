const express = require('express');
const { pricingEstimateHandler } = require('../controllers/pricingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/estimate', pricingEstimateHandler);

module.exports = router;
