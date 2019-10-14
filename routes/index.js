var express = require('express');
var router = express.Router();
const AuthHelper=require("../Helpers/AuthHelper")

const Joi= require("joi")
const HttpStatus=require("http-status-codes")
const User=require("../models/userModels")
const Helpers=require("../Helpers/helpers")
const bcrypt = require('bcryptjs');
const jwt=require("jsonwebtoken")
const dbConfig=require("../config/secret")

/* GET home page. */
router.get('/',function(req, res, next) {
 
  
  if(req.cookies.auth || req.cookies.auth!='undefined'){
   
  res.redirect("/welcome")  
  }
  res.render('index');
});


router.get("/signup_user",function(req,res){
 
  res.render('signup');

})


router.get('/welcome',AuthHelper.VerifyToken,function(req, res, next) {

  res.render('welcome',{data:req.user});
});


router.get("/link1",AuthHelper.VerifyToken,(req,res)=>{
  res.render("link")
})
router.get("/link2",AuthHelper.VerifyToken,(req,res)=>{
  res.render("link2")
})
router.get("/link3",AuthHelper.VerifyToken,(req,res)=>{
  res.render("link3")
})
router.get("/link4",AuthHelper.VerifyToken,(req,res)=>{
  res.render("link4")
})
router.get("/premium",AuthHelper.VerifyToken,(req,res)=>{
  User.findById(req.user._id,(err,dataa)=>{
  )
    if(dataa.pack=='premium'){
      res.render("premium")
    }
    else{
      res.send("Sorry, you are not a premium member")
    }
  })
  
  
})

router.post("/login", async function LoginUser(req, res){
  if (!req.body.email || !req.body.password) {
 
    res.send("No empty fields allowed")
    return 
    

  }

  await User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
       
        res.send("E-mail not found")
        return 
      }

      return bcrypt.compare(req.body.password, user.password).then(result => {
        if (!result) {
         
          res.send("Password is incorrect")
          return 
        }
        const token = jwt.sign({ data: user }, dbConfig.secret, {
          expiresIn: '5h'
        });
        res.cookie('auth', token);
       res.redirect("/welcome")
          return 
       
      });
    })
    .catch(err => {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
})

router.post("/signup",async function CreateUser(req,res){
  

  if (!req.body.email || !req.body.password || !req.body.username) {
   
    res.send("fields cannot be empty")

return
  }

const schema=Joi.object().keys({
username:Joi.string().min(3).max(30).required(),
email:Joi.string().email().required(),
password:Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
pack:Joi.string().required()
});

const { error , value }=Joi.validate(req.body,schema)//if it has error then value saved is error else if value then saved in value by calling Joi.validate

if(error && error.details){

res.send("errors are",error.details)
return
}

const userEmail=await User.findOne({
email:Helpers.lowerCase(req.body.email)
});//to check if the email already exist

if(userEmail){
res.send("Email already exist")
  return 
}

const userName=await User.findOne({username:Helpers.firstUpper(req.body.username)})

if(userName){
  res.send("user name already exist")
  return 

}

return bcrypt.hash(value.password,10,(err,hash)=>{
if(err){
  res.send("Error hashing password")
  return 
   
    
}
const body={
  username:Helpers.firstUpper(value.username),
  email:Helpers.lowerCase(value.email),
password:hash,
pack:value.pack

}

User.create(body).
then((user)=>{
  const token=jwt.sign({data:user},dbConfig.secret,{
     expiresIn:'5h'
  });
  res.cookie("auth",token);
console.log(" the token is ",token)

res.redirect("/welcome")
})
.catch(err=>{
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:"Error occured"});
})

})

})


router.get("/logout",(req,res)=>{
 
 res.cookie("auth",undefined);
res.render('index')
})


module.exports = router;
