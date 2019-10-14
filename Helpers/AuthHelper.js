

const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');

module.exports = {
  VerifyToken: (req, res, next) => {
    console.log("token ",req.headers)
    


    const token = req.cookies.auth 

  

    if (!token) {
      console.log("No token provided")
      res.render("index")
    return
 
    }

    return jwt.verify(token, dbConfig.secret, (err, decoded) => {
      if (err) {
        if (err.expiredAt < new Date()) {
          console.log("Token has expired. Please login again")
       
          // res.redirect("/")
          res.render("index")
          return
        
        }
        next();
      }
      req.user = decoded.data;
      next();
    });


}
};