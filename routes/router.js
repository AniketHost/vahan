const express = require('express');
const router = express.Router();

const { createQr, qrList , checkQr } = require('../controller/qr.controller');
const { login, me, logout, userLogin } = require('../controller/auth.controller');
const { registerUser, registerAdmin } = require('../controller/register.controller');

const { notifyOwner} = require('../controller/owner.controller')



router.post('/auth/login', login);
router.post('/auth/userLogin', userLogin);
router.get('/auth/me', me);
router.post('/auth/logout', logout);

router.post('/auth/register', registerUser);
router.post('/auth/registerAdmin', registerAdmin);

router.get('/list', qrList);
router.get('/check/:qrId', checkQr);
router.post('/create', createQr);

router.post('/notifyOwner',notifyOwner)



module.exports = router;