const express = require('express');
const userAuth = require('../middleware/userAuth');
const { getUserData } = require('../controllers/user.controller');
const userRouter = express.Router();

userRouter.get('/data',userAuth,getUserData)


module.exports = userRouter;