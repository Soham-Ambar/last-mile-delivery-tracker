const { z } = require('zod');

const markFailedValidator = z.object({
  failedReason: z.string().min(1, 'Failed reason is required').max(500, 'Failed reason must be under 500 characters'),
});

module.exports = markFailedValidator;
