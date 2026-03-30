const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');

router.post('/register', userController.registerUser);
router.post('/verify', userController.verifyUser);
router.post('/login', userController.loginUser);
router.get('/all', userController.getAllUsers);

module.exports = router;