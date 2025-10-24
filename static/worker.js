import Module from './wasm.js'

self.onmessage = async (e) => {
    const {fileArr, payloadArr, pass} = e.data
   // console.log(e.data, fileArr, payloadArr, pass)
    if(payloadArr){
    await genPayload(fileArr, payloadArr, pass)}else{await extractHidden(fileArr, pass)};
}



function genRandIv() {
  const buffer = new Uint8Array(16);
  self.crypto.getRandomValues(buffer);
  console.log("iv:", buffer)
  return buffer;
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




async function genPayload(fileArr, payloadArr, pass){
;
  var payload = Module._malloc(payloadArr.length)
  Module.HEAP8.set(payloadArr, payload)


  var filePtr = Module._malloc(fileArr.length)
  Module.HEAP8.set(fileArr, filePtr)

  var NewIv = genRandIv();
  var iv = Module._malloc(16);
  Module.HEAP8.set(NewIv, iv);

  var key = Module._malloc(16);
  Module.HEAP8.set(await deriveKey(pass, NewIv), key);


  var result = Module._hideInsideFile(filePtr, fileArr.length, payload, payloadArr.length, key, iv);

  //+16 = the iv length, +160 the fixed header length

  var PayloadedFile = new Uint8Array(Module.HEAP8.subarray(result, result+payloadArr.length + fileArr.length + 160 + 16 + payloadArr.length.toString().length))


    self.postMessage(PayloadedFile, [PayloadedFile.buffer]);



Module._free(payload);
    Module._free(filePtr);
    Module._free(key);
    Module._free(iv);
    Module._free(result); 

  return
}






async function  extractHidden(fileArr, pass){

  var filePtr = Module._malloc(fileArr.length)
  Module.HEAP8.set(fileArr, filePtr)

  var ivPointer = Module._getIv(filePtr, fileArr.length)
 var iv = new Uint8Array(Module.HEAP8.subarray(ivPointer, ivPointer+16))

 var length = Module._getPayloadLength(filePtr, fileArr.length)

 console.log(iv, length)

  var key = Module._malloc(16);
  Module.HEAP8.set(await deriveKey(pass, iv), key);

  var res = Module._extractFromFile(filePtr, fileArr.length, key)

  var extractedPayload = Module.HEAP8.subarray(res, res+Number(length))

  
self.postMessage(extractedPayload);


 Module._free(filePtr);
    Module._free(ivPointer);
    Module._free(key);
    Module._free(res);


return


}