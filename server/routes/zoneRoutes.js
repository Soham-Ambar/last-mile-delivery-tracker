const express = require('express');
const {
  createZoneHandler,
  getZonesHandler,
  getZoneHandler,
  updateZoneHandler,
  deleteZoneHandler,
} = require('../controllers/zoneController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router.post('/', createZoneHandler);
router.get('/', getZonesHandler);
router.get('/:zoneId', getZoneHandler);
router.put('/:zoneId', updateZoneHandler);
router.delete('/:zoneId', deleteZoneHandler);

module.exports = router;
