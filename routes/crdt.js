import { Redis } from "@hocuspocus/extension-redis";
import { Database } from '@hocuspocus/extension-database';
import { encodeStateAsUpdate, applyUpdate } from 'yjs';
import { Hocuspocus } from "@hocuspocus/server";
import { Router } from "express";
import Document from "../models/document.js";


const router = Router()


const hocuspocus = new Hocuspocus({
  async onConnect(){
    console.log('connecteddddd')
  },
  async onAuthenticate(data) {


    return new Promise(async (resolve, reject) => {
      if (!data.request.isAuthenticated()) {
        reject()
      } else {
        const doc = await Document.exists({
          name: data.documentName,
          $or: [
            { owner: data.request.user.username }, { access: data.request.user.username }
          ]
        },);

        if (!doc) {

          const ReaderDoc = await Document.exists({
          name: data.documentName,
         readAccess: data.request.user.username
        });

          if(ReaderDoc){
            data.connectionConfig.readOnly = true
            resolve()
          }else{
          reject()}
        }


        resolve()
      }
    })
  },


  extensions: [

    new Redis({
      host:process.env.REDISURL?process.env.REDISURL.split('.com:')[0]+'.com':'redis://redis',
      port:process.env.REDISURL?process.env.REDISURL.split('.com:')[1]:6379
    }),
    
    new Database({
      fetch: async ({ documentName }) => {
        try {
          const doc = await Document.findOne({ name: documentName }).select('data');;
          return doc?.data ? new Uint8Array(doc.data) : null;
        } catch (error) {
//          console.error('Error fetching document from MongoDB:', error);
          return null;
        }
      },


      store: async ({ documentName, document }) => {
        try {

          const stateToStore = encodeStateAsUpdate(document);


          await Document.findOneAndUpdate(
            { name: documentName },
            { data: Buffer.from(stateToStore) },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            }
          );
        } catch (error) {
  //        console.error('Error storing document to MongoDB:', error);
        }
      },


    })
  ]
});





export const mountRouter = (app) => {
  app.ws("/collab", (websocket, request) => {
  console.log("connection")
  const context = {

  };




  if (!request.isAuthenticated()) {
    //return
  }else{
  hocuspocus.handleConnection(websocket, request)
  }


   
    
  
});
}


export default router

