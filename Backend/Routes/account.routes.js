const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const { getAccountDetail, getAccountEmails } = require('../controllers/account.controller');


router.get('/:id/emails', verifyToken, getAccountEmails);
router.get('/:id', verifyToken, getAccountDetail);

module.exports = router;