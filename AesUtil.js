
var CryptoJS = require("crypto-js");


function AesUtil (keySize,iterationCount){
    
        this.keySize = keySize / 32;
        this.iterationCount = iterationCount;
    }

    AesUtil.prototype.generateKey =function(salt, passPhrase) {
        var key = CryptoJS.PBKDF2(
            passPhrase,
            CryptoJS.enc.Hex.parse(salt),
            { keySize: this.keySize, iterations: this.iterationCount });
        return key;
    }

    AesUtil.prototype.encrypt=function(passPhrase, plainText) {
        var iv = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        var salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        var key = this.generateKey(salt, passPhrase);
        var encrypted =  CryptoJS.AES.encrypt(
            plainText,
            key,
            { iv: CryptoJS.enc.Hex.parse(iv) });
        let encryptedString = (iv + "::" + salt + "::" + encrypted.ciphertext.toString(CryptoJS.enc.Base64))
        var encryptedpassword = btoa(encryptedString);
        var data = {
            password: encryptedpassword
        }
        return data.password;
    }

    AesUtil.prototype.decrypt =function(passPhrase, encryptedText) {
        var encryptedTextWithSaltAndIv = encryptedText;
        // var encryptedTextWithSaltAndIv = "OTJjNDg4OWQ5ZWFjNDhhZDQwNzQzMjg2MzRmNWZjMTM6OmMxZDM0OWNmNjcxMzNlZTc1ZWZhODJjMjUwYzg0NmJlOjp2YmZhd2lyWWNRalJIdmxZQmJEZ2FnPT0="
         var strbb = atob(encryptedTextWithSaltAndIv);
         var array = strbb.split("::");
         
        let salt = (array[1])
        let  iv = (array[0])
        let cipherText = array[2]
        var key = this.generateKey(salt, passPhrase);
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(cipherText)
        });
        var decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            key,
            { iv: CryptoJS.enc.Hex.parse(iv) });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }


module.exports=AesUtil;

