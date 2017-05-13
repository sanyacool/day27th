var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/cur', function(req, res){
  res.sendFile(__dirname + '/cur.cur');
});

app.get('/pointer', function(req, res){
  res.sendFile(__dirname + '/cur.png');
});

app.get('/qwe', function(req, res){
  res.sendFile(__dirname + '/spr.png');
});

var players = {};

function onConnection(socket){
  
  socket.emit('connecting', socket.id);
  
  socket.emit('show players', players);
  
  socket.on('connected', function(userID, X, Y, color, radius, XCur, YCur) {
	console.log("get: ", userID, "  ", X, " ", Y, " ", color, " ", radius, " ");
		players[userID] = {
			x: X,
			y: Y,
			clr: color,
			r: radius,
			xCur: XCur,
			yCur: YCur,
		};
		console.log("connected: ", socket.id, " mouse in: ", players[userID].xCur, '-', players[userID].yCur);
		socket.broadcast.emit('imready', socket.id, players[userID].x, players[userID].y, players[userID].clr, players[userID].r, players[userID].xCur, players[userID].yCur);
  });
  	
	socket.on('mouse moved', function(XCur, YCur) {
		console.log("connected: ", socket.id, " mouse in: ", XCur, '-', YCur);
		players[socket.id].xCur = XCur;
		players[socket.id].yCur = YCur;
		socket.broadcast.emit('mouse moved', socket.id, XCur, YCur);
	});

	socket.on('player moved', function(x, y){
		if (!players[socket.id])
			return;
		console.log("moving: ", socket.id, " mouse in: ", x, '-', y);
		socket.emit('imoved', x, y);
		socket.broadcast.emit('player moved', socket.id, x, y);
		if (x && y)
		{	
			players[socket.id].x = x;
			players[socket.id].y = y;
		}
  });
  socket.on('disconnect', function(){
		socket.broadcast.emit('dis', socket.id);
		delete players[socket.id];
		console.log("delete: ", socket.id, "\nnow: ", players.length, "\n");
  });
};

io.on('connection', onConnection); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});