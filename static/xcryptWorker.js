import Module from '/wasm.js'

self.onmessage = async (e) => {
    const {fileArr, pass, name, title, iv} = e.data
    console.log(e.data)
    if(fileArr&&title){
      send(fileArr, pass, name, title)
    }else{
      getDoc(name, pass, iv)
    }
}


function genRandIv() {
  const buffer = new Uint8Array(16);
  self.crypto.getRandomValues(buffer);
  return buffer;
}




function getDoc(name, pass, iv){
  fetch('/getdocraw/'+name).then(async(e)=>{

    console.log('got it')
  
    let docData = new Uint8Array(await e.arrayBuffer())
    //setReadOnly(docData.access=='readOnly'

    retrieve(docData, new Uint8Array(Object.values(iv)), pass)

})}




function updateDoc(name, title,iv) {
  fetch("/updatedoc/"+name, {
    method: "POST",
    headers: {
     'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({displayName: title,
       metadata: {iv:new Uint8Array(iv)}})
  });
}


function updateDocData(fileArr, name){
 
    fetch("/updatedocdata/"+name, {
    method: "POST",
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: fileArr
  }).then(()=>{
    self.postMessage({type:'status', data:'Saved succesfully'});
  });
 

}


function stringToUint8Array(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}


async function deriveKey(p,sb){
const pb = stringToUint8Array(p); 
 const km = await self.crypto.subtle.importKey("raw", pb, { name: "PBKDF2" }, false, ["deriveKey"]);
  const dk = await self.crypto.subtle.deriveKey({ name: "PBKDF2", salt: sb, iterations: 1000001, hash: "SHA-512" }, km, { name: "AES-CTR", length: 128 }, true, ["encrypt", "decrypt"]);
   const exportedKey = await self.crypto.subtle.exportKey("raw", dk);
return new Uint8Array(exportedKey);
}




async function send(fileArr, pass, name, title){

  var filePtr = Module._malloc(fileArr.length)
  Module.HEAP8.set(fileArr, filePtr)

  var NewIv = genRandIv();
  var iv = Module._malloc(16);
  Module.HEAP8.set(NewIv, iv);


  var key = Module._malloc(16);
  Module.HEAP8.set(await deriveKey(pass, NewIv), key);

  Module._xcrypt(filePtr, fileArr.length, key, iv);



  var result = new Uint8Array(Module.HEAP8.subarray(filePtr, filePtr+fileArr.length));
  


Module._free(filePtr);
Module._free(key);
Module._free(iv);

  updateDoc(name, title, NewIv)
  updateDocData(result, name)

  return
}




async function retrieve(fileArr, newIv, pass){

    console.log('retrieved')

  var filePtr = Module._malloc(fileArr.byteLength)
  Module.HEAP8.set(fileArr, filePtr)


    console.log('malloc 1')

  var iv = Module._malloc(16);
  Module.HEAP8.set(newIv, iv);

    console.log('malloc 2')


  var key = Module._malloc(16);
  console.log('malloc 2 1/2')
  Module.HEAP8.set(await deriveKey(pass, newIv), key);

      

  

  Module._xcrypt(filePtr, fileArr.byteLength, key, iv);



  const result = new Uint8Array(Module.HEAP8.subarray(filePtr, filePtr+fileArr.byteLength));
  


Module._free(filePtr);
Module._free(key);
Module._free(iv);


    self.postMessage({type: 'update',data: result}, [result.buffer]);

  return

Module._free(payload);
    Module._free(result); 

  return
}
