const express = require('express');
const router = express.Router();
const driversController  = require('../controllers/driver.ctrl');
const verifyToken = require('../services/verifyToken')

router.post('/register', driversController.register);

router.post('/login', driversController.login);

router.post('/update', verifyToken, driversController.addDetails);

router.get('/checkBooking', verifyToken, driversController.checkBooking);

module.exports = router;
