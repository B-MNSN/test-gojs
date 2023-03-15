const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('new user join', (username) => {
        connectedUsers.push(username)
        io.emit('new user join', username, connectedUsers)
        console.log(`${username} connected`);


    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const disconnectedUser = connectedUsers.splice(connectedUsers.indexOf(socket.username), 1);
        io.emit('user disconnected', disconnectedUser, connectedUsers);
    })

});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});