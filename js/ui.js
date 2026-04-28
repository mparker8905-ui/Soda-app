
//=====================
//== TOAST SYSTEM
//=====================

function showToast(message, type = "success", targetCard = null){

  let toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerText = message

  // CLICK HANDLER
  if(targetCard){
    toast.style.cursor = "pointer"

    toast.onclick = () => {
      let card = document.querySelector(`[data-card="${targetCard}"]`)

      if(card){
        // open it
        card.classList.add("open")

        // scroll to it
        card.scrollIntoView({
          behavior: "smooth",
          block: "center"
        })

        // temporary glow boost
        card.classList.add("highlight")
        setTimeout(() => {
          card.classList.remove("highlight")
        }, 2000)
      }
    }
  }

let container = document.getElementById("toastContainer")

if(container){

  container.appendChild(toast)

} else {

  document.body.appendChild(toast) // fallback

}

  setTimeout(() => toast.classList.add("show"), 10)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

}

//========================
//===TOGGLE CARD 
//========================

function toggleCard(el){
  let card = el.parentElement

  document.querySelectorAll(".collapsible").forEach(c => {
    if(c !== card) c.classList.remove("open")
  })

  card.classList.toggle("open")
}

//====================
//== OPEN CARD
//====================

function openCard(name){
  let card = document.querySelector(`[data-card="${name}"]`)
  if(card){
    card.classList.add("open")
  }
}

function highlightCard(name){
  let card = document.querySelector(`[data-card="${name}"]`)
  if(card){
    card.classList.add("highlight")
    setTimeout(() => {
      card.classList.remove("highlight")
    }, 2000)
  }
}

//===================
//CLOSE PROPOSAL
//===================

function closeProposalModal(){

  const modal = document.getElementById("proposalModal")

  if(modal){

    modal.style.display = "none"

  }

  document.body.classList.remove("modal-open")

}

//================
//DELETE JOB
//================

function deleteJob(index){

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")

  history.splice(index, 1)

  localStorage.setItem("jobHistory", JSON.stringify(history))

  renderHistory()

}

//===============
//EDIT JOB
//===============

function editJob(index){

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")

  let job = history[index]

  if(!job) return

  document.getElementById("sqft").value = job.sqft

  document.getElementById("houses").value = job.houses

  requestRender()

}

//====================
//=== SWIPE LOGIC MODAL
//====================

let startX = 0

let currentX = 0

let isDragging = false

function handleTouchStart(e){

  startX = e.touches[0].clientX

  isDragging = true

}

function handleTouchMove(e){

  if(!isDragging) return

  currentX = e.touches[0].clientX

  let diff = currentX - startX

  // 👉 ONLY allow swipe RIGHT

  if(diff < 0) diff = 0

  let content = document.querySelector(".proposal-content")

  content.style.transition = "none"

  content.style.transform = `translateX(${diff}px)`

  content.style.opacity = 1 - (diff / 300)

}

function handleTouchEnd(){

  if(!isDragging) return

  isDragging = false

  let diff = currentX - startX

  let content = document.querySelector(".proposal-content")

  // 👉 threshold to close

  if(diff > 120){

    content.style.transition = "all 0.2s ease"

    content.style.transform = "translateX(100%)"

    content.style.opacity = 0

    setTimeout(() => {

      closeProposalModal()

      content.style.transform = "translateX(0)"

      content.style.opacity = 1

    }, 200)

  } else {

    // snap back

    content.style.transition = "all 0.2s ease"

    content.style.transform = "translateX(0)"

    content.style.opacity = 1

  }

}

//====================

//=== SWIPE LOGIC DELETE

//====================

let deleteStartX = 0

let deleteCurrentX = 0

let activeCard = null

document.addEventListener("touchstart", e => {

  if(document.body.classList.contains("modal-open")) return

  let card = e.target.closest(".swipe-card")

  if(!card) return

  activeCard = card

  deleteStartX = e.touches[0].clientX

})

document.addEventListener("touchmove", e => {

  if(document.body.classList.contains("modal-open")) return

  if(!activeCard) return

  deleteCurrentX = e.touches[0].clientX

  let diff = deleteCurrentX - deleteStartX

  if(diff > 0) diff = 0

  if(diff < -120) diff = -120

  activeCard.style.transition = "none"

  activeCard.style.transform = `translateX(${diff}px)`

})

document.addEventListener("touchend", e => {

  if(document.body.classList.contains("modal-open")) return

  if(!activeCard) return

  let diff = deleteCurrentX - deleteStartX

  if(diff < -80){

    // 👉 reveal delete button instead of deleting

    activeCard.style.transition = "all 0.2s ease"

    activeCard.style.transform = "translateX(-100px)"

  } else {

    activeCard.style.transition = "all 0.2s ease"

    activeCard.style.transform = "translateX(0)"

  }

  activeCard = null

})