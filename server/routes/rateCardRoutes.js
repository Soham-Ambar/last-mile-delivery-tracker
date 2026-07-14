const express = require('express');
const {
  createRateCardHandler,
  getRateCardsHandler,
  getRateCardHandler,
  updateRateCardHandler,
  deleteRateCardHandler,
} = require('../controllers/rateCardController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router.post('/', createRateCardHandler);
router.get('/', getRateCardsHandler);
router.get('/:id', getRateCardHandler);
router.put('/:id', updateRateCardHandler);
router.delete('/:id', deleteRateCardHandler);

module.exports = router;
