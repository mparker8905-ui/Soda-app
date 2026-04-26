//======================
//== SEND PROPOSAL
//======================

function sendProposal(){

  try{

    let r = calculateJob()

let quoteDate = document.getElementById("quoteDate")?.value || ""

let quoteDateFormatted = quoteDate

  ? new Date(quoteDate).toLocaleDateString()

  : new Date().toLocaleDateString()

let customer = document.getElementById("customer")?.value || "Client"
    let address = document.getElementById("address")?.value || ""
    let packageType = document.getElementById("package")?.value || "standard"

let materialCost = r.cost - r.laborCost - r.overheadCost

let materialNeeds = getMaterialNeeds(

  { totalSqft: r.totalSqft },

  packageType,

  app.job.addons

)

let materialHTML = ""

Object.keys(materialNeeds).forEach(k => {

  let unit = MATERIAL_RATES[k]?.unit || ""

  materialHTML += `
    <div class="line">
      <span>${k.toUpperCase()}</span>
      <span>${materialNeeds[k].toFixed(1)} ${unit}</span>
    </div>
  `
})

let workflowHTML = `

<div class="section">

  <div class="section-title">PROJECT WORKFLOW</div>

  <div style="color:#aaa;font-size:14px;line-height:1.5;">

    <div style="margin-bottom:10px;">

      <b>1. Site Preparation</b><br>

      Soil conditioning may include aeration, lime/sulfur balancing, and organic amendments to create an optimal growing environment.

    </div>

    <div style="margin-bottom:10px;">

      <b>2. Lawn Installation</b><br>

      Professional hydroseeding application using Organic premium seed blends, fertilizer, mulch, and tackifier for maximum germination and coverage.

    </div>

    <div>

     <b>3. ${packageType === "premium" ? "Enhanced Soil Optimization & Growth Support" : "Establishment & Follow-Up"}</b>

      We provide guidance for watering and care to ensure proper germination and long-term success of your lawn.

    </div>

  </div>

</div>

`

let whyHTML = `

<div class="section">

  <div class="section-title">WHY CHOOSE SODA OUTDOOR DESIGNS</div>

  <div style="color:#aaa;font-size:14px;line-height:1.6;">

    <div style="margin-bottom:10px;">

      <b>Built With Purpose</b><br>

    SoDa Outdoor Designs is a family-founded company, named after our daughters, and built on a commitment to doing things the right way—from the ground up. That foundation shapes how we approach every project—with pride, accountability, and long-term care in mind.

    </div>

    <div style="margin-bottom:10px;">

      <b>Professional Process</b><br>

      We don’t take shortcuts. Every lawn is installed using a structured system focused on soil health, proper nutrient balance, and optimal seed establishment for lasting results.

    </div>

    <div style="margin-bottom:10px;">

      <b>Quality Materials</b><br>

      We use professional-grade seed blends, fertilizers, and soil amendments designed to produce thicker, healthier, and more resilient lawns.

    </div>

    <div>

      <b>Client-Focused Approach</b><br>

      As a family-operated business, we value relationships. Every project is treated with the same level of care, communication, and attention to detail we would expect for our own property.

    </div>

  </div>

</div>

`

   

    let pricePerSqft = r.totalSqft ? r.price / r.totalSqft : 0

let proposal = {

  id: Date.now(),

  customer,

  address,

  packageType,

  quoteDate: quoteDateFormatted,

  total: r.price,

  sqft: r.totalSqft,

 status: "Proposal Sent",

stage: "proposal",

createdAt: Date.now(),

  snapshot: {

    sqft: document.getElementById("sqft")?.value,

    houses: document.getElementById("houses")?.value,

    package: packageType,

    addons: app.job.addons,

    pricingMode: document.getElementById("pricingMode")?.value,

    targetMargin: document.getElementById("targetMargin")?.value

  }

}

let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

let exists = list.find(p =>

  p.customer === proposal.customer &&

  p.address === proposal.address &&

  p.quoteDate === proposal.quoteDate

)

if(!exists){

  list.push(proposal)

  localStorage.setItem("soda_proposals", JSON.stringify(list))

}

    let win = window.open("", "_blank")

    if(!win){
      alert("Popup blocked")
      return
    }

renderPipeline()

    // BUILD HTML SAFELY
   

let html = `
<html>
<head>
  <title>Proposal</title>

  <style>
 body{
  font-family: -apple-system, BlinkMacSystemFont, Arial;
  padding:40px 25px;
  background:#000;
  color:#d4af37;
  max-width:700px;
  margin:auto;
}

    /* HEADER */
    .header{
      display:flex;
      justify-content:space-between;
      align-items:center;
    }
    .header{
    padding-bottom:5px;
    }
    .brand h1{
      margin:0;
      font-size:26px;
    }

    .tagline{
      font-size:13px;
      color:#aaa;
      margin-top:3px;
    }

    .logo{
      width:65px;
    }

    .gold-line{
      height:2px;
      background:linear-gradient(90deg, transparent,     #d4af37, transparent);
      margin:15px 0 25px 0;
    }

    /* SECTIONS */
    .section{
      margin-top:20px;
    }

    .section-title{
      font-weight:bold;
      margin-bottom:6px;
      letter-spacing:0.5px;
    }

    .line{
      display:flex;
      justify-content:space-between;
      margin:4px 0;
    }

    /* HIGHLIGHT BOX */
    .highlight{
  background:#111;
  border:2px solid #d4af37;
  box-shadow:0 0 12px rgba(212,175,55,0.25);
}

    /* TOTAL */
    .total{
      margin-top:15px;
      font-size:28px;
      font-weight:bold;
      text-align:right;
    }

    /* CTA */
    .cta button{
  background:#d4af37;
  color:#000;
  box-shadow:0 0 10px rgba(212,175,55,0.4);
}

    .cta button{
      width:100%;
      padding:16px;
      font-size:18px;
      font-weight:bold;
      background:black;
      color:white;
      border:none;
      border-radius:8px;
    }

    .signature{
  border-top:1px solid #d4af37;
  color:#aaa;
}

  </style>
</head>

<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <h1>SoDa Outdoor Designs</h1>
      <div class="tagline">We build lawns from the soil up</div>
    </div>

    <img src="/logo.PNG" class="logo">
  </div>

  <div class="gold-line"></div>

${whyHTML}

  <!-- CLIENT -->
  <div class="section">
    <div class="section-title">CLIENT</div>
    <div><b>${customer}</b></div>
    <div>${address}</div>
  </div>

<div class="section">

  <div class="section-title">PROPOSAL DATE</div>

  <div>${quoteDateFormatted}</div>

</div>

  <!-- PACKAGE -->
  <div class="section">
    <div class="section-title">PACKAGE</div>
    <div>${packageType.toUpperCase()}</div>
  </div>

  <!-- DETAILS -->
  <div class="section">
    <div class="section-title">PROJECT DETAILS</div>

    <div class="line">
      <span>Total Sqft</span>
      <span>${r.totalSqft.toFixed(0)}</span>
    </div>

    <div class="line">
      <span>Houses</span>
      <span>${r.houses}</span>
    </div>

    <div class="line">
      <span>Price / Sqft</span>
      <span>$${pricePerSqft.toFixed(2)}</span>
    </div>

    <div class="line">
      <span>Labor</span>
      <span>$${r.laborCost.toFixed(2)}</span>
    </div>
  </div>

${workflowHTML}

<div class="section">
  <div class="section-title">MATERIALS USED</div>
  ${materialHTML}
</div>

<div class="line">
  <span>Material Cost</span>
  <span>$${materialCost.toFixed(2)}</span>
</div>

  <!-- TOTAL BOX -->
  <div class="highlight">

    <div style="font-weight:bold;margin-bottom:10px;">
      TOTAL INVESTMENT
    </div>

    <div class="total">
      $${r.price.toFixed(2)}
    </div>

  </div>

<div class="section">

  <div style="color:#aaa;font-size:14px;line-height:1.5;">

    Thank you for the opportunity to earn your business. This proposal outlines a professional lawn installation designed to promote strong root development, long-term turf health, and a clean, uniform appearance. 

    Our process focuses on proper soil conditioning, nutrient balance, and high-quality materials to ensure lasting results.

  </div>

</div>

<div class="cta">

  <button onclick="approveProposal()">Approve & Save Proposal</button>

  <button onclick="markRejected()" style="margin-top:10px;background:#550000;color:#fff;">

    Mark as Not Accepted

  </button>

</div>

  <!-- SIGNATURE -->
  <div class="signature">
    Client Signature
  </div>

</body>
</html>
`

    // âœ… WRITE TO NEW WINDOW
    win.document.open()
    win.document.write(html)
    win.proposalId = proposal.id

win.approveProposal = function(){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let index = list.findIndex(p => p.id === win.proposalId)

  if(index !== -1){

    list[index].status = "Accepted"

    localStorage.setItem("soda_proposals", JSON.stringify(list))

  }

 if(window.renderPipeline){

  window.renderPipeline()

} else if(window.renderJobHistory){

  window.renderJobHistory()

}

  win.print()

}

win.markRejected = function(){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let index = list.findIndex(p => p.id === win.proposalId)

  if(index !== -1){

    list[index].status = "Not Accepted"

    localStorage.setItem("soda_proposals", JSON.stringify(list))

  }

if(window.renderPipeline){

  window.renderPipeline()

} else if(window.renderJobHistory){

  window.renderJobHistory()

}

  alert("Marked as Not Accepted")

}
    win.document.close()

    // âœ… SAFARI SAFE PRINT TRIGGER
    setTimeout(function(){
      try{
        win.focus()
        win.print()
      } catch(e){
        console.log("Print failed", e)
      }
    }, 500)

  } catch(e){
    alert("Proposal error")
    console.log(e)
  }
}

//=======================
//==CREATE LEAD
//=======================

function createLead(){

  let customer = document.getElementById("customer").value

  let address = document.getElementById("address").value

  if(!customer) return alert("Enter customer name")

  let lead = {

    id: Date.now(),

    customer,

    address,

    stage: "lead",

    status: "New Lead",

    total: 0,

    createdAt: Date.now()

  }

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  list.push(lead)

  localStorage.setItem("soda_proposals", JSON.stringify(list))

  // 🔥 AUTO-FILL FORM (PUT IT HERE)

  document.getElementById("customer").value = customer

  document.getElementById("address").value = address

  renderPipeline()

  showToast("Lead created", "success")

}

//============================
//==CONVERT TO PROPOSAL
//============================

function convertToProposal(){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let index = list.findIndex(p => p.id === activeProposalId)

  if(index === -1) return

  let p = list[index]

  // ✅ update stage

  p.stage = "proposal"

  p.status = "Proposal Sent"

  localStorage.setItem("soda_proposals", JSON.stringify(list))

  // ✅ load into calculator (THIS is key)

  document.getElementById("customer").value = p.customer || ""

  document.getElementById("address").value = p.address || ""

  // ✅ CLOSE modal before render (prevents freeze)

  closeProposalModal()

  // ✅ re-render UI

  renderPipeline()

  render()

  showToast("Converted to proposal", "success")

}

//===================
//== RENDER PIPELINE
//===================

function renderPipeline(){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let container = document.getElementById("jobHistoryList")

  if(!container) return

  let html = `<div style="display:flex; gap:12px; overflow-x:auto;">`

  PIPELINE_STAGES.forEach(stage => {

  let items = list.filter(p => {

  if(stage.key === "lead") return p.stage === "lead"

  if(stage.key === "proposal") return p.stage === "proposal"

  if(stage.key === "pending") return p.status === "Pending"

  if(stage.key === "won") return p.status === "Accepted"

  if(stage.key === "lost") return p.status === "Not Accepted"

  return false

})

    html += `

      <div style="

        min-width:260px;

        background:#0d0d0d;

        border:1px solid #333;

        border-radius:12px;

        padding:10px;

      ">

        <div style="font-weight:bold;color:#d4af37;margin-bottom:10px;">

          ${stage.label} (${items.length})

        </div>

        ${items.map(p => `

          <div class="history-card" onclick="openProposal(${p.id})">

            <div><b>${p.customer}</b></div>

            <div style="font-size:12px;color:#aaa;">${p.address}</div>

            <div style="margin-top:6px;">

              💰 $${p.total.toFixed(0)}

            </div>

          </div>

        `).join("")}

      </div>

    `

  })

  html += `</div>`

  container.innerHTML = html

}

//=======================
//=== OPEN PROPOSAL
//=======================

function openProposal(id){

closeProposalModal()

window.currentProposalId = id

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let p = list.find(x => x.id === id)

  if(!p) return

  activeProposalId = id

  const modal = document.getElementById("proposalModal");

modal.style.display = "flex";

document.body.classList.add("modal-open");

  let content = document.querySelector(".proposal-content")

document.querySelectorAll(".swipe-card").forEach(el => {

  el.style.transform = "translateX(0)";

});

 

  // 🔥 RESET POSITION EVERY TIME

  content.style.transform = "translateX(0)"

  content.style.opacity = 1

  document.getElementById("modalCustomer").innerText = p.customer

  document.getElementById("modalAddress").innerText = p.address

  document.getElementById("modalBody").innerHTML = `

    <div class="proposal-wrap">

      <div class="row"><b>Date:</b><span>${p.quoteDate}</span></div>

      <div class="row"><b>Package:</b><span>${p.packageType.toUpperCase()}</span></div>

      <div class="row"><b>Sqft:</b><span>${p.sqft}</span></div>

      <div class="price">💰 $${p.total.toFixed(2)}</div>

      <div class="row">

        <b>Status:</b>

        <span style="color:${

          p.status === "Accepted" ? "#4cff9a" :

          p.status === "Not Accepted" ? "#ff4d4d" : "#ffd24d"

        }">

          ${p.status}

        </span>

      </div>
      <button onclick="openFullProposalFromModal()"

        style="margin-top:15px;width:100%;">

  View Full Proposal

</button>
    </div>

  `

}

//=============================
//=== OPEN FULL PROPOSAL
//=============================

function openFullProposal(id){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let proposal = list.find(p => p.id == id)

  if(!proposal) return

  // Example: navigate or render full page

  alert("Open full proposal for: " + proposal.customer)

  // OR if you have a page/section:

  // renderFullProposal(proposal)

}

//====================
//SET PROPOSAL STATUS
//====================

function setProposalStatus(status){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  let index = list.findIndex(p => p.id === activeProposalId)

  if(index !== -1){

    list[index].status = status

    if(status === "Accepted"){

      list[index].stage = "won"

    }

    else if(status === "Pending"){

      list[index].stage = "pending"

    }

    else if(status === "Not Accepted"){

      list[index].stage = "lost"

    }

    localStorage.setItem("soda_proposals", JSON.stringify(list))

  }

  renderPipeline()

  openProposal(activeProposalId)

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

//================
//DELETE PROPOSAL
//================

function deleteProposalById(id){

  let list = JSON.parse(localStorage.getItem("soda_proposals") || "[]")

  list = list.filter(p => p.id != id)

  localStorage.setItem("soda_proposals", JSON.stringify(list))

 renderPipeline()

  showToast("Proposal deleted", "error")

}

app.timeline = "standard"

function setTimeline(el){

  let all = document.querySelectorAll("[data-timeline]")

  all.forEach(t => t.classList.remove("active"))

  el.classList.add("active")

  app.timeline = el.dataset.timeline

  render()

}

function handleModalBackground(e){

  // only close if clicking OUTSIDE content

   if(e.target === e.currentTarget){

    closeProposalModal()

  }

}

//===================
//GET SAVED PROPOSALS
//===================

function getSavedProposals(){

  return JSON.parse(localStorage.getItem("soda_proposals") || "[]")

}

