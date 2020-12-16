const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const express = require('express')
const Filter = require('bad-words')
const Utils = require("./utils/message")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")
const { read } = require('fs')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT||3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.json())
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    socket.on('join',({username,room},callback) =>{
        const {error,user} = addUser({id:socket.id, username, room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',Utils.generateMessage("Admin","Welcome!"))
        socket.broadcast.to(user.room).emit('message',Utils.generateMessage("Admin",user.username+" has joined the room"))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendMessage',(msg,callback)=>{
        const filter = new Filter()
        const user = getUser(socket.id)
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',Utils.generateMessage(user.username,msg))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',Utils.generateMessage("Admin",user.username+" has left the room"))
   
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    socket.on('SendLocation',(obj,callback) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',Utils.generateLocationMessage(user.username,"https://google.com/maps?q="+obj.latitude+","+obj.longitude))
        callback('Dilivered')
    })
    
})



server.listen(port, ()=>{
    console.log('Listening on port '+port)
})

