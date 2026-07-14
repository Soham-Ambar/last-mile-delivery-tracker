const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../services/notificationService');

const getNotificationsHandler = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const result = await getNotifications(req.user.id, page, limit);
  return successResponse(res, 'Notifications fetched', result, httpStatus.OK);
});

const getUnreadCountHandler = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user.id);
  return successResponse(res, 'Unread count fetched', { count }, httpStatus.OK);
});

const markAsReadHandler = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user.id);
  if (!notification) {
    return errorResponse(res, 'Notification not found', httpStatus.NOT_FOUND);
  }
  return successResponse(res, 'Notification marked as read', notification, httpStatus.OK);
});

const markAllAsReadHandler = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.id);
  return successResponse(res, 'All notifications marked as read', null, httpStatus.OK);
});

const deleteNotificationHandler = asyncHandler(async (req, res) => {
  const notification = await deleteNotification(req.params.id, req.user.id);
  if (!notification) {
    return errorResponse(res, 'Notification not found', httpStatus.NOT_FOUND);
  }
  return successResponse(res, 'Notification deleted', null, httpStatus.OK);
});

module.exports = {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
};
