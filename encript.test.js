/**
 * Created by stars on 15/10/16.
 */

var encCharMap = "qwertyuıopğüasdfghjklşizxcvbnmöç1234567890QWERTYUIOPĞÜASDFGHJKLŞİZXCVBNMÖÇ";
var decCharMap = "ASDFGHJKLŞİzxcvbnmöçQWERTYUIOPĞÜ6912703548ZXCVBNMÖÇasdfghjklşiqwertyuıopğü";

function boz(s) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğğşŞ]/g, function (c) {
        return decCharMap.charAt(
            encCharMap.indexOf(c)
        );
    } );
}
function coz(s) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğğş]/g, function (c) {
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

testDondurmeDogrula('t');
testDondurmeDogrula('ü');
testDondurmeDogrula('ş');
testDondurmeDogrula('Tü');

testDonusDogrula('deneme');
testDonusDogrula('Türkçe');
testDonusDogrula('ışık');
testDonusDogrula('Ilıkğ');
testDonusDogrula('English142');