const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.ctrl')
const verifyToken = require('../services/verifyToken');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/request/:passenger', verifyToken, userController.request);

router.post('/arrived', verifyToken, userController.arrived)


module.exports = router;
