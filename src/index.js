window.func = async function(){
       
    console.log(document.getElementById('val1').value)
    console.log(document.getElementById('val2').value)

    const SEAL = require('node-seal')
    const seal = await SEAL()
    const schemeType = seal.SchemeType.ckks
    const securityLevel = seal.SecurityLevel.tc128
    const polyModulusDegree = 4096
    const bitSizes = Int32Array.from([36, 36, 37])
    
    /*
    const polyModulusDegree = 32768
    const bitSizes = Int32Array.from({length: 20}, () => 40)
    bitSizes[0] = 50
    bitSizes[bitSizes.length - 1] = 50
    */

    const coeffModulus = seal.CoeffModulus.Create(polyModulusDegree, bitSizes)
  
    const parms = seal.EncryptionParameters(schemeType)
    // Set the PolyModulusDegree
    parms.setPolyModulusDegree(polyModulusDegree)

    // Create a suitable set of CoeffModulus primes
    parms.setCoeffModulus(coeffModulus)
     
    const context = seal.Context(
        parms, // Encryption Parameters
        true, // ExpandModChain
        securityLevel // Enforce a security level
    )
    
    const encoder = seal.CKKSEncoder(context)
    const keyGenerator = seal.KeyGenerator(context)
    const publicKey = keyGenerator.createPublicKey()
    const secretKey = keyGenerator.secretKey()
    const encryptor = seal.Encryptor(context, publicKey)
    const decryptor = seal.Decryptor(context, secretKey)
    const evaluator = seal.Evaluator(context)

    // Create data to be encrypted
    const array1 = Float64Array.from([document.getElementById('val1').value])
    const array2 = Float64Array.from([document.getElementById('val2').value])

    // Encode the Array
    const plainText1 = encoder.encode(array1, Math.pow(2, 40))
    const plainText2 = encoder.encode(array2, Math.pow(2, 40))

    // Encrypt the PlainText
    const cipherText1 = encryptor.encrypt(plainText1)
    const cipherText2 = encryptor.encrypt(plainText2)
    const cipherText3 = seal.CipherText()

    sendData('/', evaluator, cipherText2)
    
    /*
    // Multiply the CipherText and store it in the destination parameter (itself)
    evaluator.multiply(cipherText1, cipherText2, cipherText3) // Op (A), Op (Dest)

    // Decrypt the CipherText
    const decryptedPlainText = decryptor.decrypt(cipherText3)

    // Decode the PlainText
    const decodedArray = encoder.decode(decryptedPlainText)

    console.log('decodedArray', decodedArray)
    */
}

function sendData(url, evaluator, cipherText){
    var form = document.createElement("form")
    var params = new Array();
    var input = new Array();
    
    form.action = url
    form.method = "post"

    params.push(["evaluator", JSON.stringify(evaluator)])
    params.push(["cipherText", toJson(cipherText)])

    for (var i = 0; i < params.length; i++ ){
        input[i] = document.createElement("input")
        input[i].setAttribute("type", "hidden")
        input[i].setAttribute("name", params[i][0])
        input[i].setAttribute("value", params[i][1])
        form.appendChild(input[i])
    }
    document.body.appendChild(form)
    form.submit()
}

function toJson(data) {
    return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}n` : v)
        .replace(/"(-?\d+)n"/g, (_, a) => a);
}