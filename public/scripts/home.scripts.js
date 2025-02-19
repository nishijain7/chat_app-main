// console.log("hone scripst.js")
const inputSection = document.getElementById("pathToGo")
const form = document.getElementById("homeForm")
const username = document.getElementById("username")
const roomId = document.getElementById("roomId")

form.addEventListener("submit",(e)=>{
    // console.log("hone scripst.js : form")
    e.preventDefault()

    if(!username.value || !roomId.value){
        const warning = document.createElement("p")
        warning.textContent = "Enter all the deatils!"
        inputSection.appendChild(warning)
    }
    else{
        form.submit()
    }
})