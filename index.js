var port = 3000;
var tConnected = 0;
var viewDir = '/views/';
var allowedUserColmn = 'id,nick,username,token,color,backcolor';


var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('zehri.db');


var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookie = require('cookie');

app.get('/', function (req, res) {
    res.sendFile(__dirname + viewDir + 'sys.html');
});

app.use('/static',express.static('public'));


http.listen(port, function () {
    console.log('zehr-i chat:' + '*:' + port);
});

http.on('error', function (e) {
    console.log('Port kullanımda');
});

function rand() {
    var list = ['a', 'C', 'X', 'c', 'e', 'F', 'B', 'N', 'm', 'p', 'o', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var listMax = list.length;
    return list[Math.floor(Math.random() * listMax)];
}

function generateToken() {

    return rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand();

}

function checkToken(socket, token) {

    console.log(socketId);

}

var encCharMap = "qwertyuıopğüasdfghjklşizxcvbnmöç1234567890QWERTYUIOPĞÜASDFGHJKLŞİZXCVBNMÖÇ";
var decCharMap = "ASDFGHJKLŞİzxcvbnmöçQWERTYUIOPĞÜ6912703548ZXCVBNMÖÇasdfghjklşiqwertyuıopğü";

function enchatter(s) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğğşŞ]/g, function (c) {
        return decCharMap.charAt(
            encCharMap.indexOf(c)
        );
    } );
}
function dechatter(s) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğğşŞ]/g, function (c) {
        return encCharMap.charAt(
            decCharMap.indexOf(c)
        );
    } );
}

function badwordenchaned(s){
    return s.replace(/Recep/g, 'RichArt').replace(/recep/g, 'RichArt').replace(/RECEP/g, 'RichArt');
};


io.on('connection', function (socket) {
    // user bağlandı
    tConnected++;
    console.log('+++ Login:' + socket.id);
    socket.on('disconnect', function (e) {
        //user koptu gitti
        console.log('--- Logout:' + socket.id);
        tConnected--;
    });

    socket.on('Looby', function (msg) {

        //auth check
        var query = "select * from users where token='" + msg.token + "'";
        var size = 13;
        if(msg.data.length<60){
            size = 21;
        }
        if(msg.data.length<40){
            size = 26;
        }
        if(msg.data.length<20){
            size = 33;
        }
        db.get(query, function (err, rows) {
            if (rows) {
                io.emit('Looby', {
                    status: true,
                    size:size,
                    color:msg.color,
                    backcolor:msg.backcolor,
                    name: msg.name,
                    data: enchatter(badwordenchaned(msg.data))
                });
            }
            else {
                io.emit('Looby', {
                    status: false,
                    notice: 'Access Token Geçersiz'
                });
            }

        });

    });

    socket.on('stats', function () {
        //stats aktar
        io.emit('stats', {
            count: tConnected
        });
        console.log('stats');
    });


    socket.on('message', function (client) {

        var query = null;
        var jsonReturn = {status: false};

        switch (client.controller) {

            case "nick":

                jsonReturn.controller = 'nick';
                query = 'update users set nick="'+client.data+'" where token="' + client.token + '"';
                db.run(query);
                console.log('//nick~:'+socket.id);

            break;

            case "checkAuth":

                jsonReturn.controller = 'auth';
                query = 'select ' + allowedUserColmn + ' from users where token="' + client.token + '"';

                db.get(query, function (err, rows) {
                    if (rows) {

                        db.run('update users set socketId="' + socket.id + '" where token="' + client.token + '"');
                        jsonReturn.status = true;
                        jsonReturn.user = rows;
                        io.sockets.connected[socket.id].emit('message', jsonReturn);

                    } else {

                        io.sockets.connected[socket.id].emit('message', jsonReturn);

                    }
                });


                break;
            case "login":

                jsonReturn.controller = 'login';
                var userName = client.username;
                var userPass = client.userpass;

                query = 'select ' + allowedUserColmn + ' from users where username="' + userName + '" and userpass="' + userPass + '"';

                db.get(query, function (err, rows) {
                    if (rows) {

                        var tokenGen = generateToken();
                        var query = 'update users set socketId="' + socket.id + '", token="' + tokenGen + '" where id=' + rows.id;

                        db.run(query);

                        socket.auth = true;
                        socket.token = tokenGen;
                        socket.user = rows;

                        jsonReturn.token = tokenGen;
                        jsonReturn.user = rows;

                        //sadece bagli kisiye kanaldan verile
                        jsonReturn.status = true;
                        io.sockets.connected[socket.id].emit('message', jsonReturn);
                        console.log('*** Authed:' + socket.id);

                    }
                    else {
                        jsonReturn.notice = 'Kullanıcı Adı yada Şifre Eşleşmiyor.';
                        io.sockets.connected[socket.id].emit('message', jsonReturn);
                    }

                });

                break;
            default :
                console.log(client);


        }


    })
});

