const createError = require('http-errors');
const handleResponse = require('../helpers/common');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// import modules from models
const usersModel = require('../models/users_model');
const walletsModel = require('../models/wallets_model');

// create controller for register user
const addUser = async (req, res, next) => {
    try {
        const randomId = Math.floor(Math.random() * 999);
        const randomIdWallet = 'W-' + Math.floor(Math.random() * 999);
        const { username, email, password, phone } = req.body;
        const emailRegistered = await usersModel.findUser('email', email);
        const phoneRegistered = await usersModel.findUser('phone', phone);
        if (username === undefined || email === undefined || password === undefined || phone === undefined || username === '' || email === '' || password === '') {
            return next(createError(403, 'registration failed, please check the input'));
        } else if (emailRegistered.length > 0) {
            return next(createError(403, 'email already registered'));
        } else if (phoneRegistered.length > 0) {
            return next(createError(403, 'phone already registered'));
        } else {
            const passwordHash = await bcrypt.hash(password, 10);
            const dataUSer = {
                id: randomId,
                username: username,
                email: email,
                password: passwordHash,
                phone: phone
            };
            await usersModel.addUser(dataUSer);
            await walletsModel.addWallet(randomIdWallet, dataUSer.id);
            const resultUser = {
                id_user: dataUSer.id,
                id_wallet: randomIdWallet,
                username: dataUSer.username,
                email: dataUSer.email
            }
            handleResponse.response(res, resultUser, 201, 'user successfully registered');
        }
    } catch (error) {
        console.log(error)
        next(createError(500, new createError.InternalServerError()));
    }
}
// create controller for login user
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const [userRegistered] = await usersModel.findUser('email', email);
        if (!userRegistered) {
            return next(createError(403, 'email/password wrong'))
        } else {
            const resultHash = await bcrypt.compare(password, userRegistered.password)
            if (!resultHash) return next(createError(403, 'email/password wrong'));
            const secretKey = process.env.SECRET_KEY_JWT;
            const payload = {
                email: userRegistered.email,
                username: userRegistered.username,
                role: userRegistered.role
            };
            const verifyOptions = {
                expiresIn: '1 days'
            };
            const token = jwt.sign(payload, secretKey, verifyOptions);
            const { id, username, email, phone, picture } = userRegistered;
            const result = {
                id,
                username,
                email,
                phone,
                picture,
                token: token
            };
            handleResponse.response(res, result, 200, 'successfully login');
        }
    } catch (error) {
        console.log(error);
        next(createError(500, new createError.InternalServerError()));
    }
}

// create controller for detail user
const detailUser = async (req, res, next) => {
    try {
        const idUser = req.params.id;
        const [resultUser] = await usersModel.detailUser(idUser);
        const [resultWallet] = await walletsModel.seeWallet(idUser);
        if (resultUser === undefined) {
            res.json({
                message: `User not registered with id: ${idUser}`
            });
        } else {
            resultUser.id_wallet = resultWallet.id
            resultUser.balance = resultWallet.balance
            handleResponse.response(res, resultUser, 200, 'successfully fetched from server');
        }
    } catch (error) {
        console.log(error);
        next(createError(500, new createError.InternalServerError()));
    }
}

// create controller for read all user 
const getAllUser = async (req, res, next) => {
    try {
        const resultUsers = await usersModel.getAllUser();
        handleResponse.response(res, resultUsers, 200, 'succsessfully fetched from server');
    } catch (error) {

    }
}
// create controller for edit user
const editUser = async (req, res, next) => {
    try {
        const idUser = req.params.id;
        const {username, email, password, phone, picture} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const dataUser = {
            username,
            email,
            password: passwordHash,
            phone,
            picture
        };
        await usersModel.editUser(dataUser, idUser);
        handleResponse.response(res, dataUser, 200, 'successfully edited')
    } catch (error) {
        next(createError(500, new createError.InternalServerError()));
    }
}
//create controller for delete user
const deleteUser = async (req, res, next) => {
    try {
        const idUser = req.params.id;
        const resultUser = await usersModel.findUser('id', idUser);
        if (resultUser.length === 0) {
            return next(createError(403, `id ${idUser} not found`));
        } else {
            await usersModel.deleteUser(idUser);
            handleResponse.response(res, true, 200, `successfully deleted id: ${idUser}`)
        }
    } catch (error) {
        next(createError(500, new createError.InternalServerError()));
    }
}
// export modules to routes
module.exports = {
    addUser,
    loginUser,
    detailUser,
    getAllUser,
    editUser,
    deleteUser
}