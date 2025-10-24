import { Router } from "express";
import passport from 'passport';
import user from "../models/user.js";

const router = Router()



router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).send('Success!');
});

router.get('/login-failure', (req, res, next) => {
  res.send('no.');
});

router.get('/login-success', (req, res, next) => {
  res.send('yes.');
});


router.get('/session', (req, res, next) => {
  if(!req.isAuthenticated()){
  res.status(401).send('no');}else{
    res.send('yes')
  }
});




router.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/cloud');
  });
});



router.post('/register', function (req, res) {
  user.register(
    new user({
      username: req.body.username
    }), req.body.password, function (err, msg) {
      if (err) {
        res.status(403).send(err);
      } else {
        res.send({ message: "Successful" });
      }
    }
  )
})


export default router












