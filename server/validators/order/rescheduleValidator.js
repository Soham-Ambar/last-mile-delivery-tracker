const { z } = require('zod');

const rescheduleValidator = z.object({
  newDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});

module.exports = rescheduleValidator;
