const express = require("express");
const zod = require("zod");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");
const { User } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const signUpBody = zod.object({
    username : zod.string(),
    firstName : zod.string(),
    lastName  : zod.string(),
    password : zod.string(),
});

const signInBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

const updateBody = zod.object({
    password: zod.string(), 
    firstName: zod.string(), 
    lastName: zod.string(),
})

router.post('/signup', async (req,res) =>{
    const userInput = req.body;
    const response = signUpBody.safeParse(userInput)
    if(!response.success){
        return res.status(411).json({
            message: "Invalid Input"
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username,
    }) 
    if(existingUser){
        return res.status(411).json({
            message: "User already exists",
        })
    }

    const {username, firstName,lastName,password} = response.data;
    try{
        const user = await User.create({
            username: username,
            firstName: firstName,
            lastName: lastName,
            password: password,
        });
        const userId = user._id;
        const token = jwt.sign({
            userId,
        }, JWT_SECRET);

        res.json({
            message: "User created successfully",
            token: token,
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message: "Internal Sever Error."
        });
    }    
});

router.post('/signin', async (req,res)=>{
    const {success} = signInBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Error while Logging in.",
        });
    }

    const {username, password} = req.body.data;
    try{
        const user = await User.findOne({
            username : username,
            password : password,
        });
    
        if(user){
            const token = jwt.sign({
                userId: user._id,
            }, JWT_SECRET);
    
            res.json({
                token: token
            })
    
            return ;
        }
    
        res.status(411).json({
            message: "Error while Logging in."
        })
    }
    catch(error){
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

router.put('/', authMiddleware, async(req , res)=>{
    const { success } = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Invalid Input.",
        })
    }

    try{
        await User.updateOne(req.body, {
            _id:req.userId,
        })

        res.json({
            message: "Updated Successfully",
        })
    }
    catch(error){
        console.error(error)
        return res.json({
            message: "Internal Server Error",
        })
    }
});

router.get('/get', async(req,res) =>{
    const filter = req.query.filter || "";

    const user = await.User.find({
        $or:[{
            firstName:{
                $regex:filter,
            }            
        },{
            lastName:{
                $regex:filter,
            }
        }]
    })

    res.json({
        user:user.map(user =>({
            username: user.username,
            firstName : user.firstName,
            lastName: user.lastName,
            _id:user._id,
        }))
    })
})
module.exports = {
    router,
}