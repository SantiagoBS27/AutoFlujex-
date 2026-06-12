const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const { getAccounts } = require('../controllers/home.controller');

router.get('/accounts', verifyToken, getAccounts);

module.exports = router;