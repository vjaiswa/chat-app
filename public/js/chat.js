const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $locationMessage = document.querySelector('#locationMessages')
const $sidebar = document.querySelector('#sidebar')
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationmessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const socket = io()

const autoscroll = () =>{
    $messages.scrollTop = $messages.scrollHeight
    // const $newMessage = $messages.lastElementChild
    // const $newMessageMargin = parseInt(getComputedStyle($newMessage).marginBottom) 
    
    // //New Messgae Height with margin
    // const $newMessageHeight = $newMessage.offsetHeight+$newMessageMargin

    // //Visible Height
    // const $visibleMessageheight = $messages.offsetHeight

    // //Height of message container
    // const $containerHeight = $messages.scrollHeight

    // //How far have I scrolled down
    // const scrollOffset = $messages.scrollTop + $visibleMessageheight

    // if($containerHeight == $newMessageHeight <= scrollOffset){
    //     $messages.scrollTop = $messages.scrollHeight
    // }



    // console.log("$newMessageHeight : "+$newMessageHeight)
    
    
} 

socket.on('locationMessage', (loc) =>{
    const html = Mustache.render(locationMessageTemplate,{
        username:loc.username,
        url:loc.url,
        createdAt:moment(loc.createdAt).format("h:mm a")
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoscroll()

})


socket.on('message', (message) =>{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})




$messageForm.addEventListener('submit',(e)=>{
    $messageFormButton.setAttribute('disabled','disabled')
    e.preventDefault()
    let message = e.target.elements.msg.value
    socket.emit("sendMessage",message,(error) =>{
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
        if(error){
            console.log(error)
        }
        console.log('Message Delivered')
    })
    
})



$sendLocationButton.addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        $sendLocationButton.removeAttribute('disabled')
        return alert('This featrure is not supported on your browser!')
    }
    
    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('SendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },(msg) =>{
            console.log("Location Shared",msg)
        })
  })
  $sendLocationButton.removeAttribute('disabled')
})


socket.emit('join',{username,room},(error) =>{
    if(error){
        alert(error)
        location.href = "/"
    }    
})

socket.on("roomData",({room,users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})
