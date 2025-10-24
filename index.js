import redis from 'redis';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/user.js'
import expressWebsockets from "express-ws";
import mongoose from 'mongoose';


import dashboardRoutes from './routes/dashbaord.js'
import authRoutes from './routes/auth.js'
import docRoutes from './routes/docs.js'
import crdtRoutes, {mountRouter} from './routes/crdt.js'


const DEFAULT_MONGO_URL = 'mongodb://mongodb:27017/alek-office';
const DEFAULT_REDIS_URL = 'redis://redis:6379';


mongoose.connect(process.env.MONGOURL||DEFAULT_MONGO_URL);



import RedisStore from "connect-redis";

const RedisClient = redis.createClient({
  url: process.env.REDISURL?process.env.REDISURL:DEFAULT_REDIS_URL,
  socket: {
    connectTimeout: 1000000,
  },
});



const app  = expressWebsockets(express()).app;



app.use(express.urlencoded({ extended: false }));
app.use(session({
  store: new RedisStore({ client: RedisClient, prefix: "alek-office-session:" }),
  secret: process.env.SESSIONKEY,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));


const strategy = new LocalStrategy(User.authenticate())
passport.use(strategy);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());



app.use(express.json());
app.use(express.raw({type: 'application/octet-stream', limit:'50mb'}));

mountRouter(app)

app.use(docRoutes)
app.use(dashboardRoutes)
app.use(authRoutes)
app.use(crdtRoutes)




RedisClient.connect().then(async () => {
  RedisClient.ping().then(()=>{console.log('pong');});
  app.listen(8000, () => {console.log('ready') });
})
