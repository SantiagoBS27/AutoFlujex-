const express = require('express');
const router = express.Router();
const { getAuthUrl, handleCallback } = require('../Controllers/gmail.controller');

router.get('/url', getAuthUrl);
router.get('/callback', handleCallback);

module.exports = router;