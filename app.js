const express = require("express");
const http = require("http");
const socket = require("socket.io");
const {Chess} = require("chess.js");
const path = require("path");
const app = express();
const server = http.createServer(app);

const io = socket(server);
const chess = new Chess();

let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index",{title:"Custom Chess Game"
    
    });
});

io.on("connection", (socket) => {
    console.log("New client connected");
    if(!players.white){
        players.white = socket.id;
        socket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.black = socket.id;
        socket.emit("playerRole", "b");
    }
    else{
        socket.emit("spectatorRole");
    }
    socket.on("disconnect",() => {
        if(socket.id === players.white){
            delete players.white;
        }
        else if(socket.id === players.black){
            delete players.black;
        }
        console.log("Client disconnected");
    });
    socket.on("move", (move) => {
        try{
            if((chess.turn() ==="w" && socket.id === players.white) || (chess.turn() ==="b" && socket.id === players.black) || !currentPlayer   ){
                if(chess.move(move)){
                    currentPlayer = chess.turn() === "w" ? "b" : "w";   
                    io.emit("move", move);
                    io.emit("boardState", chess.fen()); 
                }
            }
            else{
                console.log("Not your turn");
                socket.emit("notYourTurn"); 
            }
        }
        catch(e){
            console.log(e);
        }
    }); 
});


server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
