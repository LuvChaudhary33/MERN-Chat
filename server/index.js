const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose')
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messagesRoute")
const socket = require("socket.io")
const app = express();
require("dotenv").config();

app.use(cors())
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() =>{
    console.log("DB Connected")
}).catch((err) =>{
    console.log({Error: err})
})

const server = app.listen(process.env.PORT, () =>{
    console.log(`Server started on Port ${process.env.PORT}`)
})

const io = socket(server,{
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    }
})

global.onlineUsers = new Map()

io.on("connection", (socket) =>{
    global.chatSocket = socket;
    socket.on("add-user", (userId) =>{
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) =>{
        console.log(data)
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve", data.message)
        }
    });

});

