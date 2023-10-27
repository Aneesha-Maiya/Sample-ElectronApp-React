
let openBtn = document.getElementById("btn-1")
openBtn.addEventListener('click',()=>{
    let msgText = "5173"
    window.electronAPI.onPortOccupied(msgText)
})

let closeBtn = document.getElementById("btn-2")
closeBtn.addEventListener('click',()=>{
    let msgText = "3000"
    window.electronAPI.onPortOpen(msgText)
})