const Order = require('../models/Order');
const User = require('../models/User');
const Agent = require('../models/Agent');

function dateRange(range, startDate, endDate) {
  const now = new Date();
  let start, end;
  if (range === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (range === '7days') {
    start = new Date(now);
    start.setDate(start.getDate() - 7);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (range === '30days') {
    start = new Date(now);
    start.setDate(start.getDate() - 30);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

async function getDashboardData(range = '30days', startDate, endDate) {
  const { start, end } = dateRange(range, startDate, endDate);

  const [
    overview,
    revenueResult,
    deliveryStats,
    topPickupZones,
    topDeliveryZones,
    topAgents,
    ordersPerDay,
    revenuePerDay,
    statusDistribution,
  ] = await Promise.all([
    getOverview(start, end),
    getRevenue(start, end),
    getDeliveryStats(),
    getTopPickupZones(start, end),
    getTopDeliveryZones(start, end),
    getTopAgents(),
    getOrdersPerDay(start, end),
    getRevenuePerDay(start, end),
    getStatusDistribution(),
  ]);

  const dailyOrders = ordersPerDay.reduce((sum, item) => sum + item.count, 0);
  const weeklyStart = new Date();
  weeklyStart.setDate(weeklyStart.getDate() - 7);
  const weeklyOrders = ordersPerDay
    .filter((item) => new Date(item.date) >= weeklyStart)
    .reduce((sum, item) => sum + item.count, 0);
  const monthlyOrders = ordersPerDay.reduce((sum, item) => sum + item.count, 0);

  const dailyRev = revenuePerDay.reduce((sum, item) => sum + item.revenue, 0);
  const weeklyRev = revenuePerDay
    .filter((item) => new Date(item.date) >= weeklyStart)
    .reduce((sum, item) => sum + item.revenue, 0);
  const monthlyRev = revenuePerDay.reduce((sum, item) => sum + item.revenue, 0);

  return {
    overview: {
      totalOrders: overview.totalOrders,
      totalCustomers: overview.totalCustomers,
      totalAgents: overview.totalAgents,
      activeAgents: overview.activeAgents,
      inactiveAgents: overview.inactiveAgents,
      pendingOrders: overview.pendingOrders,
      assignedOrders: overview.assignedOrders,
      inTransitOrders: overview.inTransitOrders,
      deliveredOrders: overview.deliveredOrders,
      cancelledOrders: overview.cancelledOrders,
      failedOrders: overview.failedOrders,
    },
    revenue: {
      todayRevenue: revenueResult.todayRevenue,
      weeklyRevenue: weeklyRev,
      monthlyRevenue: monthlyRev,
      totalRevenue: revenueResult.totalRevenue,
    },
    delivery: deliveryStats,
    orders: {
      dailyOrders,
      weeklyOrders,
      monthlyOrders,
    },
    topZones: {
      pickupZones: topPickupZones,
      deliveryZones: topDeliveryZones,
    },
    topAgents,
    charts: {
      ordersPerDay,
      revenuePerDay,
      statusDistribution,
    },
  };
}

async function getOverview(start, end) {
  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  const [orderStats, totalCustomers, totalAgents, activeAgents, inactiveAgents] = await Promise.all([
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          assignedOrders: { $sum: { $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0] } },
          inTransitOrders: {
            $sum: {
              $cond: [{ $in: ['$status', ['PickedUp', 'InTransit', 'OutForDelivery']] }, 1, 0],
            },
          },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          failedOrders: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
        },
      },
    ]),
    User.countDocuments({ role: 'customer', isActive: true }),
    Agent.countDocuments({ isActive: true }),
    Agent.countDocuments({ status: 'Available', isActive: true }),
    Agent.countDocuments({ status: { $in: ['Busy', 'Offline'] }, isActive: true }),
  ]);

  const stats = orderStats[0] || {};
  return {
    totalOrders: stats.totalOrders || 0,
    totalCustomers,
    totalAgents,
    activeAgents,
    inactiveAgents,
    pendingOrders: stats.pendingOrders || 0,
    assignedOrders: stats.assignedOrders || 0,
    inTransitOrders: stats.inTransitOrders || 0,
    deliveredOrders: stats.deliveredOrders || 0,
    cancelledOrders: stats.cancelledOrders || 0,
    failedOrders: stats.failedOrders || 0,
  };
}

async function getRevenue(start, end) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todayRev, totalRev] = await Promise.all([
    Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
    ]),
  ]);

  return {
    todayRevenue: todayRev[0]?.revenue || 0,
    totalRevenue: totalRev[0]?.revenue || 0,
  };
}

async function getDeliveryStats() {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
        failedOrders: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
        avgAttempts: { $avg: '$deliveryAttempt' },
      },
    },
  ]);

  const s = stats[0] || { totalOrders: 0, deliveredOrders: 0, failedOrders: 0, avgAttempts: 0 };
  const totalDeliveredOrFailed = s.deliveredOrders + s.failedOrders || 1;

  const deliveryTimes = await Order.aggregate([
    { $match: { status: 'Delivered' } },
    {
      $project: {
        deliveryTime: {
          $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 3600000],
        },
      },
    },
    { $group: { _id: null, avgHours: { $avg: '$deliveryTime' } } },
  ]);

  return {
    averageDeliveryTime: Math.round((deliveryTimes[0]?.avgHours || 0) * 100) / 100,
    successfulDeliveryRate: Math.round((s.deliveredOrders / totalDeliveredOrFailed) * 10000) / 100,
    failedDeliveryRate: Math.round((s.failedOrders / totalDeliveredOrFailed) * 10000) / 100,
    averageAttemptsPerOrder: Math.round((s.avgAttempts || 0) * 100) / 100,
  };
}

async function getTopPickupZones(start, end) {
  const zones = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$pickupZone', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'zones',
        localField: '_id',
        foreignField: '_id',
        as: 'zone',
      },
    },
    { $unwind: { path: '$zone', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        zoneId: '$_id',
        name: { $ifNull: ['$zone.name', 'Unknown'] },
        count: 1,
      },
    },
  ]);
  return zones;
}

async function getTopDeliveryZones(start, end) {
  const zones = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$deliveryZone', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'zones',
        localField: '_id',
        foreignField: '_id',
        as: 'zone',
      },
    },
    { $unwind: { path: '$zone', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        zoneId: '$_id',
        name: { $ifNull: ['$zone.name', 'Unknown'] },
        count: 1,
      },
    },
  ]);
  return zones;
}

async function getTopAgents() {
  const agents = await Agent.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'assignedAgent',
        as: 'orders',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        status: 1,
        vehicleType: 1,
        totalOrders: { $size: '$orders' },
        completedOrders: {
          $size: {
            $filter: {
              input: '$orders',
              as: 'o',
              cond: { $eq: ['$$o.status', 'Delivered'] },
            },
          },
        },
        failedOrders: {
          $size: {
            $filter: {
              input: '$orders',
              as: 'o',
              cond: { $eq: ['$$o.status', 'Failed'] },
            },
          },
        },
      },
    },
    { $sort: { completedOrders: -1 } },
    { $limit: 10 },
  ]);

  return agents.map((a) => ({
    _id: a._id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    status: a.status,
    vehicleType: a.vehicleType,
    totalOrders: a.totalOrders,
    completedOrders: a.completedOrders,
    failedOrders: a.failedOrders,
  }));
}

async function getOrdersPerDay(start, end) {
  const pipeline = [
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ];

  const results = await Order.aggregate(pipeline);

  return fillMissingDates(results, start, end, 'date', 'count', 0);
}

async function getRevenuePerDay(start, end) {
  const pipeline = [
    { $match: { status: 'Delivered', createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: 1 } },
  ];

  const results = await Order.aggregate(pipeline);

  return fillMissingDates(results, start, end, 'date', 'revenue', 0);
}

async function getStatusDistribution() {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, status: '$_id', count: 1 } },
  ]);

  const allStatuses = ['Pending', 'Confirmed', 'Assigned', 'PickedUp', 'InTransit', 'OutForDelivery', 'Failed', 'Delivered', 'Cancelled'];
  const map = {};
  stats.forEach((s) => { map[s.status] = s.count; });
  return allStatuses.map((s) => ({ status: s, count: map[s] || 0 }));
}

function fillMissingDates(results, start, end, dateField, valueField, defaultValue) {
  const filled = [];
  const map = {};
  results.forEach((r) => { map[r[dateField]] = r[valueField]; });

  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    filled.push({
      [dateField]: dateStr,
      [valueField]: map[dateStr] !== undefined ? map[dateStr] : defaultValue,
    });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}

module.exports = { getDashboardData };