const express = require('express');
const {
  createOrderHandler,
  adminCreateOrderHandler,
  getMyOrdersHandler,
  getOrderHandler,
  getAllOrdersHandler,
  updateOrderHandler,
  cancelOrderHandler,
  assignOrderHandler,
  autoAssignOrderHandler,
  unassignOrderHandler,
  markFailedHandler,
  rescheduleHandler,
} = require('../controllers/orderController');
const { getTrackingTimelineHandler } = require('../controllers/trackingController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Admin-only routes
router.post('/admin', authorize(['admin']), adminCreateOrderHandler);
router.get('/admin', authorize(['admin']), getAllOrdersHandler);
router.put('/:id', authorize(['admin']), updateOrderHandler);
router.patch('/:id/assign', authorize(['admin']), assignOrderHandler);
router.post('/:id/auto-assign', authorize(['admin']), autoAssignOrderHandler);
router.patch('/:id/unassign', authorize(['admin']), unassignOrderHandler);
router.patch('/:id/fail', authorize(['admin']), markFailedHandler);

// Customer routes
router.post('/', createOrderHandler);
router.get('/my-orders', getMyOrdersHandler);
router.get('/:id', getOrderHandler);
router.patch('/:id/cancel', cancelOrderHandler);
router.patch('/:id/reschedule', rescheduleHandler);

// Shared route (admin + customer owner)
router.get('/:id/tracking', getTrackingTimelineHandler);

module.exports = router;
