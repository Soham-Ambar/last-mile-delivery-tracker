function parsePagination(query) {
  const hasPage = query.page !== undefined && query.page !== '';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const sortField = query.sort || 'createdAt';
  const sortDir = query.order === 'asc' ? 1 : -1;
  const sort = sortField.startsWith('-')
    ? { [sortField.slice(1)]: -1 }
    : { [sortField]: sortDir };

  return { page, limit, skip, sort, paginate: hasPage };
}

function paginatedResponse(items, total, page, limit) {
  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: items.length,
  };
}

module.exports = { parsePagination, paginatedResponse };