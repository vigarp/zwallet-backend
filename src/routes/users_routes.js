// import modules
const express = require('express');
const route = express.Router();
// import modules from controllers
const usersController = require('../controllers/users_controller');
const walletsController = require('../controllers/wallets_controller');
const transactionsController = require('../controllers/transactions_controllers');
const { protect, isAdmin } = require('../middleware/auth');
// const upload = require('../middleware/upload'); //// disabled upload for herokuapp


// declare router

route
    .get('/', protect, usersController.getAllUser)
    .get('/:id', protect, usersController.detailUser)
    .put('/:id', protect, usersController.editUser)
    .put('/:id/picture', protect, /* upload.single('picture') */ usersController.editPicUser) // disabled upload for herokuapp
    .put('/:id/phone', protect, usersController.editPhoneUser)
    .delete('/:id/phone', protect, usersController.deletePhoneUser)
    .put('/:id/password', protect, usersController.editPassUser)
    .delete('/:id', protect, isAdmin, usersController.deleteUser)
    
    .post('/:id/topup', protect, walletsController.topUpWallet)
    .get('/:id/history', protect, transactionsController.showHistory)
    .post('/:id/transfer', protect, transactionsController.createTransfer)




module.exports = route;