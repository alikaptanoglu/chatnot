/**
 * Created by stars on 15/10/16.
 */

var encCharMap = "qwertyuıopğüasdfghjklşizxcvbnmöç1234567890QWERTYUIOPĞÜASDFGHJKLŞİZXCVBNMÖÇ";
var decCharMap = "ASDFGHJKLŞİzxcvbnmöçQWERTYUIOPĞÜ6912703548ZXCVBNMÖÇasdfghjklşiqwertyuıopğü";

function boz(s) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğĞşŞ]/g, function (c) {
        return decCharMap.charAt(
            encCharMap.indexOf(c)
        );
    } );
}
function coz(s) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜĞğşŞ]/g, function (c) {
        return encCharMap.charAt(
            decCharMap.indexOf(c)
        );
    } );
}



function testDonusDogrula(deger){
    if(coz(boz(deger))==deger){
        console.log(true,deger,boz(deger));
    }else {
        console.error(false,deger,boz(deger),coz(boz(deger)));
    }
}

function testDondurmeDogrula(deger){
    if(boz(deger)!=deger){
        console.log(true,deger,boz(deger),'<- √');
    }else {
        console.error(false,deger,'<-- x');
    }
}


String.prototype.encrKey = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

console.log("the quick brown fox jumps over the lazy dog".encrKey());
testDondurmeDogrula('t');
testDondurmeDogrula('ü');
testDondurmeDogrula('ş');
testDondurmeDogrula('Tü');
testDondurmeDogrula('ö');

testDonusDogrula('deneme');
testDonusDogrula('Türkçe');
testDonusDogrula('ışık');
testDonusDogrula('Ilıkğ');
testDonusDogrula('English142');