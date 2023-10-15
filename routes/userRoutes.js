const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtKey = process.env.JWT_KEY;
const {default:mongoose} = require('mongoose');

const createUser = async (req, res) => {
    const { 
            email, 
            username, 
            password,
            application,
            role,
            createdAt,
            lastLogin,
            accountStatus,
            profile,
        } = req.body;

    try {

        const emailExists = await User.exists({ email: email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

         // Hash the password
         const hashedPassword = await bcrypt.hash(password, 10);
                    // Create a new user instance and save to DB
        const newUser = new User({
            email: email,
            username: username,
            password: hashedPassword,
            application: application,
            role: role,
            createdAt: createdAt,
            lastLogin: lastLogin,
            accountStatus: accountStatus,
            profile: profile
        });

        const createdUser = await newUser.save();

        return res.status(201).json({
            message: "User created successfully",
            user: createdUser._id
        });

        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const authenticate = async (req,res)=>{

    const {email,password} = req.body;

    try{
        const user = await User.findOne({email: email});

        if(!user){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = {
            id: user._id,
            username: user.username,
        };

        const token = jwt.sign(payload, jwtKey, { expiresIn: 1440 });

        return res.status(200).json({
            access: true,
            token: token,
            id: user._id,
            role: user.role,
        });
        
    }catch(error){
        res.status(500).json({message: error.message});
    }


};

const getAll = async (req, res) => {
    try {
        
        User.find({}).then((users) => {
             res.status(200).json(users);
        });
       
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

const getById = async (req, res) => {       
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

//cannot update password here for that use resetPassword
const updateById = async (req, res) => {        
    try {
        const { 
            _id,
            email, 
            username, 
            application,
            role,
            createdAt,
            lastLogin,
            accountStatus,
            profile
        } = req.body;

        const updatedUser = {
            _id: _id,
            email: email,
            username: username,
            application:application,
            role: role,
            createdAt: createdAt,
            lastLogin: lastLogin,
            accountStatus: accountStatus,
            profile: profile
        };
        await User.findByIdAndUpdate(_id, updatedUser);
        res.status(200).json({message: "User updated successfully"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

const resetPassword = async (req, res) => {
    try {
        const {email,password} = req.body;

        const exists = await User.findOne({email: email});
        if(!exists){
            return res.status(400).json({ message: "Email does not exist" });
        }else{

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const updatedUser = {password: hashedPassword};
            await User.findByIdAndUpdate(exists._id, updatedUser);
            res.status(200).json({message: "Password updated successfully"});
        }
        
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};
//used for admin to update user account status (logical delete)
const updateAccountStatus = async (req, res) => {
    try{
        const {id,accountStatus} = req.body;
        const updatedUser = {accountStatus: accountStatus};
        await User.findByIdAndUpdate(id, updatedUser);
        res.status(200).json({message: "Account status updated successfully"}); 
    }catch(error){
        res.status(404).json({message: error.message});
    }
};

const deleteById = async (req, res) => {        
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

const router = express.Router();

router.
        route("/").
        get(getAll). //ok
        patch(updateById). //ok
        post(createUser); //ok

router.route("/authenticate").post(authenticate); //ok
router.route("/resetpassword").post(resetPassword); //ok
router.route("/updateaccountstatus").post(updateAccountStatus); //ok
router.
        route("/:id").
        get(getById).  //ok
        delete(deleteById);  //ok

module.exports = router;