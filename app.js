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


let listUser = [];

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('new user join', (user) => {
        listUser.push(user); // add user to the list
        io.emit('new user join', user)
        console.log(`${user.username} connected`); // send notification to all clients

        // Update user list for all clients
        io.emit('user list update', listUser);

    })

    socket.on('disconnect', () => {
        // Find disconnected user by their socket ID
        const disconnectedUser = listUser.find(user => user.socketId === socket.id);
        if (disconnectedUser) {
            // Remove disconnected user from list of users
            listUser = listUser.filter(user => user.socketId !== socket.id);
            io.emit('user disconnected', disconnectedUser);
            console.log(`${disconnectedUser.username} disconnected`);
            // Update user list for all clients
            io.emit('user list update', listUser);
        }
    })

    socket.on('node clicked', function(data) {
        console.log(data);
        io.emit('node clicked', data);
    });

    socket.on("nodeMoved", (data) => {
        console.log(`Node ${data.key} moved to (${data.x}, ${data.y})`);
        socket.broadcast.emit("nodeMoved", data);
    });

});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});