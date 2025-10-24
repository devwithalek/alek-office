import { Router } from "express";
import Document from "../models/document.js";

const router = Router()



router.get('/availabledocs/:type/:offset', async function (req, res) {
  if (req.isAuthenticated()) {
    //console.log(req.params.type)
    const documents = await Document.find(
      { owner: req.user.username, docType:req.params.type }
    ).skip(parseInt(req.params.offset) * 5).limit(5).select('name displayName').sort({ updatedAt: -1 }).lean();

    res.json(documents)

  } else {
    res.status(401).send('')
  }
})





router.get('/sharedwithme/:offset', async function (req, res) {
  if (req.isAuthenticated()) {
    const documents = await Document.find(
     {$or:[{access: req.user.username}, {readAccess: req.user.username}], owner:{$ne:req.user.username}  },
    ).skip(parseInt(req.params.offset) * 5).limit(5).select('name displayName docType').sort({ updatedAt: -1 }).lean();

    res.json(documents)

  } else {
    res.status(401).send('')
  }
})


export default router












