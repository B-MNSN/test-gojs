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


myDiagram.nodeTemplate =
    $(go.Node, "Auto",
        $(go.Shape, "Rectangle", { strokeWidth: 0, fill: "white" }, new go.Binding("fill", "color")),
        $(go.TextBlock, { margin: 8, stroke: "#333" }, new go.Binding("text"))
    )

myDiagram.model = new go.GraphLinksModel(
    [
        { key: 1, text: "Alpha", color: "lightblue" },
        { key: 2, text: "Beta", color: "orange" },
        { key: 3, text: "Gamma", color: "lightgreen" },
        { key: 4, text: "Delta", color: "pink" }
    ]);;


socket.on("nodeMoved", (data) => {
    const node = myDiagram.findNodeForKey(data.key);
    if (node) {
        node.position = new go.Point(data.x, data.y);
    }
});

myDiagram.addDiagramListener("ObjectSingleClicked", (e) => {
    const node = e.subject.part;
    if (node instanceof go.Node) {

        socket.emit("nodeMoved", { key: node.key, x: node.position.x, y: node.position.y });
    }
});

myDiagram.addDiagramListener("SelectionMoved", (e) => {
    const sel = e.diagram.selection;
    if (sel.count === 1) {
        const node = sel.first();
        socket.emit("nodeMoved", { key: node.key, x: node.position.x, y: node.position.y });
    }
});

socket.on('node clicked', (data) => {
    // console.log(data);
    let node = myDiagram.findNodeForKey(data.nodeKey);

    if (node !== null) {
        // node.data.color = "red";
        myDiagram.select(node);
    }
})

//user
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