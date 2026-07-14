const express = require('express');
const {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotificationsHandler);
router.get('/unread-count', getUnreadCountHandler);
router.patch('/:id/read', markAsReadHandler);
router.patch('/read-all', markAllAsReadHandler);
router.delete('/:id', deleteNotificationHandler);

module.exports = router;
