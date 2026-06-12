const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const { getAccounts, getTypes, getCurrencies, createAccount, getStats, getProviders, saveEmailCredential, getEmails, getAlerts } = require('../controllers/home.controller');


router.get('/types', getTypes);
router.get('/currencies', getCurrencies);
router.post('/createAccount', verifyToken, createAccount);
router.post('/connectEmail', verifyToken, saveEmailCredential);
router.get('/accounts', verifyToken, getAccounts);
router.get('/stats', verifyToken, getStats);
router.get('/providers', verifyToken, getProviders);
router.get('/emails', verifyToken, getEmails);
router.get('/alerts', verifyToken, getAlerts);

module.exports = router;