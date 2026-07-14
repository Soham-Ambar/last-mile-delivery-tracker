const express = require('express');
const {
  createAreaHandler,
  getAreasHandler,
  getAreaHandler,
  getActiveAreasHandler,
  updateAreaHandler,
  deleteAreaHandler,
} = require('../controllers/areaController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/public', getActiveAreasHandler);

router.use(authorize(['admin']));

router.post('/', createAreaHandler);
router.get('/', getAreasHandler);
router.get('/:areaId', getAreaHandler);
router.put('/:areaId', updateAreaHandler);
router.delete('/:areaId', deleteAreaHandler);

module.exports = router;
