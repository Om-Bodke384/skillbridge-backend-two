const express = require('express');
const router = express.Router();
const c = require('./admin.controller');
const { protect, requireAdmin } = require('../../common/middleware/auth.middleware');

router.use(protect, requireAdmin);

router.get('/dashboard', c.getDashboard);
router.get('/users', c.getUsers);
router.patch('/users/:userId/role', c.changeRole);
router.patch('/users/:userId/status', c.toggleStatus);
router.delete('/users/:userId', c.deleteUser);
router.get('/communities', c.getCommunities);
router.patch('/communities/:communityId/status', c.toggleCommunity);

module.exports = router;
