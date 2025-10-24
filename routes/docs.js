import { Router } from "express";

import Document from "../models/document.js";


const router = Router()





router.get('/newdoc/:type', function (req, res) {
  if (req.isAuthenticated()) {
    const doc = new Document({ access: [req.user.username], owner: req.user.username, docType: req.params.type })
    doc.save().then((newdoc) => { res.redirect('/cloud/'+newdoc.docType +'/'+ newdoc.name) })
  } else {
    res.status(401).send('')
  }
})




router.post('/updatedocname/:doc', async function (req, res) {

  await Document.findOneAndUpdate(
    {
      name: req.params.doc,
      $or: [
        { owner: req.user.username },
        { access: req.user.username }
      ]
    },
    { displayName: req.body.displayName },
  );

  res.status(200).send('')

})



router.post('/removedoc/:doc', async function (req, res) {

  //console.log('deleting...')

  await Document.findOneAndDelete(
    {
      name: req.params.doc,
       owner: req.user.username 
    }
  );

  res.status(200).send('')

})




router.post('/updatedoc/:doc', async function (req, res) {

  await Document.findOneAndUpdate(
    {
      name: req.params.doc,
      $or: [
        { owner: req.user.username },
        { access: req.user.username }
      ]
    },
    { displayName: req.body.displayName,
      metadata:req.body.metadata,
     },
  );

  res.status(200).send('')

})



router.post('/updatedocdata/:doc', async function (req, res) {
  console.log(`Document size: ${(req.body.length / 1048576).toFixed(2)} MB`);
  await Document.findOneAndUpdate(
    {
      name: req.params.doc,
      $or: [
        { owner: req.user.username },
        { access: req.user.username }
      ]
    },
    { 
      data:req.body
     },
  );


  res.status(200).send('')

})






router.get('/getaccess/:doc', async function (req, res) {

  let accessArrays = await Document.findOne(
    {
      name: req.params.doc,
      $or: [
        { owner: req.user.username },
        { access: req.user.username }
      ]
    }).select('access readAccess').lean();

  res.json(accessArrays)

})






router.post('/updatedocAccess/:doc', async function (req, res) {

  //console.log(req.body)

  await Document.findOneAndUpdate(
    {
      name: req.params.doc,
      $or: [
        { owner: req.user.username },
        { access: req.user.username }
      ]
    },
    { access: req.body.access, readAccess: req.body.readAccess},
  );
  res.status(200).send('')

})




router.get('/getdoc/:docname', async function (req, res) {


  const doc = await Document.findOne(
    {
      name: req.params.docname,
      $or: [
        { owner: req.user.username },
        { access: req.user.username },
        { readAccess: req.user.username }
      ]
    },
  );
  res.status(200).json({
    access: doc.owner == req.user.username?'owner':doc.readAccess.includes(req.user.username)&&doc.owner!=req.user.username? 'readOnly':'full',
    metadata: doc.metadata,
    name:doc.displayName,
  })

})

router.get('/getdocraw/:docname', async function (req, res) {


  const doc = await Document.findOne(
    {
      name: req.params.docname,
      $or: [
        { owner: req.user.username },
        { access: req.user.username },
        { readAccess: req.user.username }
      ]
    },
  );
  res.status(200).send(doc.data)

})








export default router


