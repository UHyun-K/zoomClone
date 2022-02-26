import http from "http";
import WebSocketSever from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req,res)=> res.render("home"));
app.get("/*",(req,res)=>res.redirect("/"));

const hanldeListen =()=> console.log("Listening on http://localhost:3000");

const server = http.createServer(app);

const wss = new WebSocketServer({server});

server.listen(3000, hanldeListen)