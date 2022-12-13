const express = require('express')
const router=express.Router();
const User=require("../models/Customer");
const fetchuser=require("../middleware/fetchuser");
const Transactions=require("../models/Transaction");
const {body,validationResult}=require("express-validator");
// Route 1: Get all the transactions of a particular user using GET: "/api/transactions/fetchtransactions": login required
router.get('/fetchtransactions',fetchuser,async (req,res)=>{
    try {
        const transactions=await Transactions.find({user:req.user.id});
        res.json(transactions);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
});
// Route 3: Get all the transactions of all the customers using GET: "/api/transactions/fetchtransfers": no login required

router.get('/fetchtransfers',async (req,res)=>{
    try {
        const transactions=await Transactions.find();
        res.json(transactions);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
});
// Route 2: a new transaction using Post: "/api/transactions/fetchtransactions":login required
router.post('/newtransaction',fetchuser,[
    body("amount","Enter a Valid amount").isLength({min:1}),
    body("account","Enter a Valid account no").exists()
],async (req,res)=>{
    let success=false;
    try {
        const {amount,account}=req.body;
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        let receiver=await User.findOne({account});
        let sender1=await User.findById(req.user.id);
        let amount2=parseInt(amount);

        const transaction = new Transactions({
            amount,account,receiver,sender:req.user.id
        });
        
        await User.findOneAndUpdate({account},{$set:{balance:receiver.balance+amount2}},{new:true});
        await User.findByIdAndUpdate(req.user.id,{$set:{balance:sender1.balance-amount2}},{new:true});
        const savetransactions=await transaction.save();
        success=true;
        res.json({success,savetransactions});
    } catch (error){
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
});



module.exports=router;