// Create a new diagram and set its properties
const diagram = go.GraphObject.make(go.Diagram, "myDiagramDiv", {
    initialContentAlignment: go.Spot.Center,
    "undoManager.isEnabled": true
});

// Create some node data and link data
const nodeDataArray = [
    { key: "Alpha" },
    { key: "Beta" },
    { key: "Gamma" }
];

const linkDataArray = [
    { from: "Alpha", to: "Beta" },
    { from: "Beta", to: "Gamma" }
];

// Set the diagram's model
diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);