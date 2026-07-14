const express = require('express');
const {
  createAgentHandler,
  getAgentsHandler,
  getAgentHandler,
  updateAgentHandler,
  deleteAgentHandler,
  updateStatusHandler,
  updateAreasHandler,
} = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize(['admin']));

router.post('/', createAgentHandler);
router.get('/', getAgentsHandler);
router.get('/:id', getAgentHandler);
router.put('/:id', updateAgentHandler);
router.delete('/:id', deleteAgentHandler);
router.patch('/:id/status', updateStatusHandler);
router.patch('/:id/areas', updateAreasHandler);

module.exports = router;
