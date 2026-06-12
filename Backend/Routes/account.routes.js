const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const { getAccountDetail } = require('../controllers/account.controller');

router.get('/:id', verifyToken, getAccountDetail);

module.exports = router;