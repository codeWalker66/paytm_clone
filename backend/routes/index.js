const express = require("express");
const useRouter = require("./user")
const accontRouter = require("./account")
const router = express.Router();

router.use('/user', useRouter);
router.use('/account', accontRouter);

module.exports = {
    router,
}