const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const { getAccounts, getTypes, getCurrencies, createAccount, getStats } = require('../controllers/home.controller');

router.get('/types', getTypes);
router.get('/currencies', getCurrencies);
router.post('/createAccount', verifyToken, createAccount);
router.get('/accounts', verifyToken, getAccounts);
router.get('/stats', verifyToken, getStats);

module.exports = router;