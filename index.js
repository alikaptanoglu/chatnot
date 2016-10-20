var port = 3000;
var tConnected = 0;
var viewDir = '/views/';
var allowedUserColmn = 'id,nick,username,token,color,backcolor';


var connectedUsers = [];
var connectedSocket = [];


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

app.use('/static', express.static('public'));


http.listen(port, function () {
    console.log('zehr-i chat:' + '*:' + port);
});

http.on('error', function (e) {
    console.log('Port kullanımda');
});



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

function rand() {
    var list = ['a', 'C', 'X', 'c', 'e', 'F', 'B', 'N', 'm', 'p', 'o', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var listMax = list.length;
    return list[Math.floor(Math.random() * listMax)];
}

function generateToken() {

    return rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand() + rand();

}


var encCharMap = "qwertyuıopğüasdfghjklşizxcvbnmöç1234567890QWERTYUIOPĞÜASDFGHJKLŞİZXCVBNMÖÇ";

function enchatter(s,decKey) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğĞşŞ]/g, function (c) {
        return decKey.charAt(
            encCharMap.indexOf(c)
        );
    });
}
function dechatter(s,decKey) {
    return s.replace(/[A-Za-z0-9ıİÖöçÇüÜğĞşŞ]/g, function (c) {
        return encCharMap.charAt(
            decKey.indexOf(c)
        );
    });
}

function badwordenchaned(s) {
    return s.replace(/Recep/g, 'RichArt').replace(/recep/g, 'RichArt').replace(/RECEP/g, 'RichArt');
};


var chatnot = {

    check: {
        online: function () {

            var oldOnline = chatnot.user.online;
            var oldC = oldOnline.length;

            var activeSocket = chatnot.sockets;
            var activeC = activeSocket.length;

            var newOnline = [];

            for (var i = 0; activeC > i; i++) {

                var nC = newOnline.length;
                var nEl = 0;
                for (var ni = 0; nC > ni; ni++) {

                    if (activeSocket[i].token == newOnline[ni].token) {
                        nEl++;
                    }

                }
                if (nEl == 0) {
                    newOnline.push(activeSocket[i])
                }

            }
            var newC = newOnline.length;

            if (oldC != newC) {
                chatnot.user.online = newOnline;
                io.send({ controller: "online", users: newOnline });
                console.log('///online changed///');
                console.log(newOnline);
            }

        }
    },
    sockets: [],
    user: {
        online: [],
        getColor: function(token){
            var ou = chatnot.user.online;
            var c = ou.length;

            for(var i = 0; c>i; i++){
                if(token==ou[i].token){
                    return ou[i].color;
                }
            }
            return '#f00';

        },
        connect: function (socketId, token, color) {
            chatnot.sockets.push({socketId: socketId, token: token, color: color});
            chatnot.check.online();
        },
        disconnect: function (socketId) {
            var c = chatnot.sockets.length;
            if (socketId) {
                for (var i = 0; c > i; i++) {
                    try {
                        if (socketId == chatnot.sockets[i].socketId) {
                           console.log('?//', chatnot.sockets.splice(i, 1) ); //diziden def et
                        }
                    }
                    catch (e) {
                        console.log(socketId + " droplanamadı");
                    }

                }
            }
            chatnot.check.online();
        }

    }
};


io.on('connection', function (socket) {
    // user bağlandı
    tConnected++;
    console.log('+++ connect:' + socket.id);
    io.sockets.connected[socket.id].send({controller:'haveAuth'});

    socket.on('disconnect', function (e) {
        //user koptu gitti
        console.log('--- disconnect:' + socket.id);
        tConnected--;
        chatnot.user.disconnect(socket.id);
    });

    socket.on('Looby', function (msg) {

        //auth check
        var query = "select * from users where token='" + msg.token + "'";
        var size = 13;

        var decriptKey = encCharMap.encrKey();

        db.get(query, function (err, rows) {
            if (rows) {
                io.emit('Looby', {
                    status: true,
                    size: size,
                    color: chatnot.user.getColor(msg.token),
                    backcolor: msg.backcolor,
                    name: msg.name,
                    dKey:decriptKey,
                    data: enchatter(badwordenchaned(msg.data),decriptKey)
                });
            }
            else {
                io.sockets.connected[socket.id].emit('Looby', {
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
                query = 'update users set nick="' + client.data + '" where token="' + client.token + '"';
                db.run(query);
                console.log('//nick~:' + socket.id);

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

                        chatnot.user.connect(socket.id, client.token, rows.backcolor);

                        chatnot.check.online();

                    } else {

                        io.sockets.connected[socket.id].emit('message', jsonReturn);

                    }
                });


                break;

            case "online":
                console.log(connectedUsers);
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
                        chatnot.user.connect(socket.id, client.token, rows.color);

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

