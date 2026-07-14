const express = require('express');
const { getDashboardHandler } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router.get('/dashboard', getDashboardHandler);

module.exports = router;