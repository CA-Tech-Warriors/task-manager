// Owner: D (card D-5). Render can use this as its health check.
const router = require('express').Router();
const { state } = require('../db');

router.get('/', (req, res) => {
  res.json({ status: 'ok', database: state.connected ? 'connected' : 'not connected' });
});

module.exports = router;
