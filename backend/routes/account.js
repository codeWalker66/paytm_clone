const express = require('express');

const router = express.Router();

router.get('/balance', async(req,res) =>{
    try{
        const account = await Account.findOne({
            userId:req.userId
        });

        res.json({
            balance: account.balance,
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        })
    }
});

router.post('/transfer', async(req,res) =>{
    
})

module.exports = ({
    router
})
