const socket = io();

const $ = go.GraphObject.make;

const myDiagram = new go.Diagram(
    "myDiagramDiv", // create a Diagram for the HTML Div element
    { "undoManager.isEnabled": true }
); // enable undo & redo

//crate background
myDiagram.grid = $(
    go.Panel,
    "Grid", {
        name: "GRID",
        visible: false,
        gridCellSize: new go.Size(10, 10),
        gridOrigin: new go.Point(0, 0),
    },
    $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5, interval: 1 }),
    $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 5 }),
    $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 1.0, interval: 10 }),
    $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5, interval: 1 }),
    $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 5 }),
    $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 1.0, interval: 10 })
);

myDiagram.grid.visible = true; // so that this example shows the standard grid
myDiagram.div.style.background = "white";

// define a simple Node template
myDiagram.nodeTemplate = new go.Node("Auto") // the Shape will automatically surround the TextBlock
    // add a Shape and a TextBlock to this "Auto" Panel
    .add(
        new go.Shape("RoundedRectangle", { strokeWidth: 0, fill: "white" }) // no border; default fill is white
        .bind("fill", "color")
    ) // Shape.fill is bound to Node.data.color
    .add(
        new go.TextBlock({ margin: 8, stroke: "#333" }) // some room around the text
        .bind("text", "key")
    ); // TextBlock.text is bound to Node.data.key


myDiagram.model = new go.GraphLinksModel(
    [
        { key: "Alpha", color: "lightblue" },
        { key: "Beta", color: "orange" },
        { key: "Gamma", color: "lightgreen" },
        { key: "Delta", color: "pink" },
    ], [
        { from: "Alpha", to: "Beta" },
        { from: "Alpha", to: "Gamma" },
        { from: "Beta", to: "Beta" },
        { from: "Gamma", to: "Delta" },
        { from: "Delta", to: "Alpha" },
    ]
);


// update the diagram whenever new data is received from the server
socket.on('updateDiagram', function(data) {
    myDiagram.model = go.Model.fromJson(data);
});

// send the current diagram data to the server whenever it changes
myDiagram.addDiagramListener("ObjectDoubleClicked", function(e) {
    var currentDiagramData = myDiagram.model.toJson();
    socket.emit('updateDiagram', currentDiagramData);
});

let boxInputUsername = document.getElementById('box-input-username')
let userForm = document.getElementById('user-form');
let usernameInput = document.getElementById('input-username');
let room = document.getElementById('room');
let usersList = document.getElementById('users-list');
let userId = Date.now();

userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    socket.emit('new user join', {
        socketId: socket.id,
        userId: userId,
        username: username,
    });
    usernameInput.value = '';
    boxInputUsername.classList.add('d-none');
    room.classList.remove('d-none')
    room.classList.add('d-block')
})


socket.on('new user join', (users) => {
    console.log(`${users.username} joined the room`);
    const listItem = document.createElement('li');
    listItem.id = `user-${users.userId}`;
    listItem.textContent = users.username;
    usersList.appendChild(listItem);
})

socket.on('user list update', (list) => {
    // Update user list with latest list of users
    listUser = list;
    // Clear current user list
    usersList.innerHTML = '';
    // Add updated user list
    listUser.forEach(user => {
        const listItem = document.createElement('li');
        listItem.id = `user-${user.userId}`;
        listItem.textContent = user.username;
        usersList.appendChild(listItem);
    });
})

socket.on('user disconnected', (user) => {
    console.log(`${user.username} left the room`);
    const listItem = document.getElementById(`user-${user.userId}`);
    if (listItem) {
        listItem.remove();
    }
})