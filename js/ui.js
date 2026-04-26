//=============================
//=====RENDER
//=============================

function render(){
  try{

let ui = {

  package: document.getElementById("package")?.value || "standard",

  crewSize: Number(ui.crewSize) || 1,

  tankSize: Number(ui.tankSize) || 500

}

window.shownToasts = window.shownToasts || new Set()

let shownToasts = window.shownToasts

  
   
    let r = calculateJob()
    //updateStatus(r)
    let isBuilderJob = r.houses >= 5
  let inv = getInventoryCost() || { standard:0, premium:0, addons:0, total:0 }
   let packageType = document.getElementById("package")?.value || "standard"

let addons = app.job.addons || {}

let needs = getMaterialNeeds(

  { totalSqft: r.totalSqft },

  packageType,

  addons

)
    let tankData = calculateTankLoads(r, needs)
   let perTank = tankData?.perTank || {
  seed: 0,
  mulch: 0,
  fertilizer: 0,
  tackifier: 0
}

// ==========================
// SCHEDULING CALCULATIONS
// ==========================

// 🧠 LABOR TIME (already calculated)
let laborHours = r.totalHours || 0

// 🚛 TANK TIME
let minutesPerTank = 20      // spraying time
let refillMinutes = 15       // refill/mix time

let totalTanks = tankData?.loads || 0

let tankMinutes = totalTanks * (minutesPerTank + refillMinutes)
let tankHours = tankMinutes / 60

// ==========================
// 🧱 ADD-ON TIME (FIELD WORK)
// ==========================

let addonHours = 0

let addons = app.job.addons || {}

// 🌱 Lime / Sulfur (light application)
if(addons.lime || addons.sulfur){
  addonHours += 0.5   // ~30 mins total
}

// 🌀 Aeration + Compost (can be combined)
if(addons.aeration || addons.compost){
  addonHours += 1.5   // 1–2 hrs combined
}

// 🌿 Bio / Humic / Biochar (spray add-ons)
if(addons.biohum || addons.biochar || addons.humic){
  addonHours += 0.5
}

// 🌧️ Grow system setup
if(addons.grow){
  addonHours += 2
}

let sizeFactor = r.totalSqft / 5000

addonHours *= Math.max(0.5, sizeFactor)

// ⏱️ TOTAL JOB TIME

let totalJobHours = laborHours + tankHours + addonHours

// 📅 DAYS NEEDED
let hoursPerDay = 8
let crewSize = Number(ui.crewSize) || 1

let daysNeeded = Math.max(1, Math.ceil(totalJobHours / (crewSize * hoursPerDay)))

// round UP to full days

daysNeeded = Math.ceil(daysNeeded)

// ==========================
// 💰 PERFORMANCE METRICS
// ==========================

let revenuePerDay = daysNeeded ? r.price / daysNeeded : 0
let profitPerDay = daysNeeded ? r.profit / daysNeeded : 0 

// ==========================
// ⚠️ SCHEDULING WARNINGS
// ==========================

let scheduleWarnings = []

// 🚨 LOW REVENUE DAY
if(revenuePerDay < 1500){
  scheduleWarnings.push("Low revenue per day — consider batching jobs")
}

// 🚨 LOW PROFIT DAY
if(profitPerDay < 500){
  scheduleWarnings.push("Low profit per day — job may not be worth it")
}

// 🚨 TOO MANY DAYS
if(daysNeeded > 2 && r.totalSqft < 10000){
  scheduleWarnings.push("Too many days for job size — inefficiency detected")
}


// 🔁 REFILL CYCLES
let refillCycles = Math.max(0, Math.ceil(totalTanks) - 1)

let mixWeight =
  perTank.seed +
  perTank.mulch +
  perTank.fertilizer +
  perTank.tackifier

let tankSize = Number(ui.tankSize) || 500

let maxWeight =
  tankSize === 100 ? 300 :
  tankSize === 300 ? 800 :
  tankSize === 500 ? 1200 :
  tankSize === 700 ? 1600 :
  2000

let percentFull = maxWeight ? (mixWeight / maxWeight) * 100 : 0

if(mixWeight > maxWeight && !shownToasts.has("tank")){
  showToast("⚠️ Tank overloaded — reduce mulch or split load", "warning", "tank")
  shownToasts.add("tank")
}

    let inventoryTotals = getInventoryTotals()
    let comparison = compareInventory(needs, inventoryTotals)
    let alerts = generateAlerts(r, comparison)
    let dealScore = calculateDealScore(r, comparison)
    let schedule = buildSchedule(r)

let startDate = schedule[0]?.date ? new Date(schedule[0].date) : null

let endDate = schedule[schedule.length - 1]?.date 

  ? new Date(schedule[schedule.length - 1].date) 

  : null

let totalDays = 0

if(startDate && endDate){

  totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

}

let totalWeeks = (totalDays / 7).toFixed(1)

    let currentPackage = document.getElementById("package")?.value || "standard"
    let altPackage = currentPackage === "standard" ? "premium" : "standard"

    // ==========================
    // PACKAGE COMPARISON
    // ==========================

let alt = calculateJob({

  packageOverride: altPackage

})

    let recommendationHTML = ""

    if(alt.price > r.price){
      recommendationHTML = `
        <div style="margin:15px 0;padding:12px;border:1px solid gold;border-radius:10px;background:rgba(255,215,0,0.08);">
          🛎️<b>Recommendation:</b><br>
          Switch to ${altPackage.toUpperCase()} 🛎️
          <span style="color:#4cff9a;font-weight:700;">
            +$${(alt.profit - r.profit).toFixed(2)} profit
          </span>
        </div>
      `
    }

    // ==========================
    // METRICS
    // ==========================

    let perHouseCost = r.houses ? r.cost / r.houses : 0
    let perHousePrice = r.houses ? r.price / r.houses : 0
    let perHouseProfit = r.houses ? r.profit / r.houses : 0

    let pricePerSqft = r.totalSqft ? r.price / r.totalSqft : 0
    let costPerSqft = r.totalSqft ? r.cost / r.totalSqft : 0
    let marginPercent = r.price ? (r.profit / r.price) * 100 : 0

    // ==========================
    // MATERIAL DISPLAY
    // ==========================

    let materialHTML = "<b>MATERIAL REQUIREMENTS</b><br>"

   Object.keys(comparison).forEach(k => {

  let item = comparison[k]

  let required = Number(item.required) || 0

  let available = Number(item.available) || 0

  let shortage = Number(item.shortage) || 0

  let color = item.status === "short" ? "red" : "lime"

  let unit = (window.MATERIAL_RATES && MATERIAL_RATES[k]?.unit) || ""

  materialHTML += `

    ${k.toUpperCase()}:

    Need ${required.toFixed(1)} ${unit} |

    Have ${available.toFixed(1)} ${unit}

    <span style="color:${color}">

      ${item.status === "short"

        ? "BUY " + shortage.toFixed(1)

        : "OK"}

    </span><br>

  `

})

    // ==========================
    // OUTPUT UI
    // ==========================

let materialCost = r.cost - r.laborCost - r.overheadCost

let insights = []

if(typeof generateAIInsights === "function"){

  insights = generateAIInsights(r, comparison) || []

}

let insightsHTML = `
<div class="glass-card collapsible" data-card="ai">
  <div class="card-header" onclick="toggleCard(this)">
    🤖 AI INSIGHTS
    <span class="chevron">▼</span>
  </div>

  <div class="card-body">
    ${insights.map(i => `
      <div style="
        margin:6px 0;
        padding:8px;
        border-radius:8px;
        background:${
          i.type === "danger" ? "rgba(255,60,60,0.1)" :
          i.type === "warning" ? "rgba(255,180,0,0.1)" :
          "rgba(0,255,120,0.1)"
        };
        border:1px solid ${
          i.type === "danger" ? "rgba(255,60,60,0.4)" :
          i.type === "warning" ? "rgba(255,180,0,0.4)" :
          "rgba(0,255,120,0.4)"
        };
      ">
        ${i.text}
      </div>
    `).join("")}
  </div>
</div>
`

let dealColor =
  dealScore >= 80 ? "#4cff9a" :
  dealScore >= 60 ? "#ffd24d" :
  "#ff4d4d"

let dealLabel =
  dealScore >= 80 ? "🔥 TAKE THIS JOB" :
  dealScore >= 60 ? "⚖️ DECENT JOB" :
  "⚠️ RISKY JOB"

let dealHTML = `
<div class="glass-card" style="text-align:center;border:2px solid ${dealColor};">
  <div style="font-size:14px;color:#aaa;">DEAL SCORE</div>
  <div style="font-size:42px;font-weight:bold;color:${dealColor};">
    ${dealScore}/100
  </div>
  <div style="margin-top:6px;color:${dealColor};font-weight:700;">
    ${dealLabel}
  </div>
</div>
`

let tankHTML = `
<div class="glass-card collapsible" data-card="tank">
  <div class="card-header" onclick="toggleCard(this)">
    🚛 TANK MIX PLAN
    <span class="chevron">▼</span>
  </div>

  <div class="card-body">

<div>Tank Size: ${tankSize} gal</div>
<div>Coverage per Tank: ${(tankData?.coveragePerTank || 0).toFixed(0)} sqft</div>
<div>Tanks Needed: ${(tankData?.loads || 0).toFixed(2)}</div>

<div>Load Weight: ${mixWeight.toFixed(0)} lbs</div>
<div>Capacity Used: ${percentFull.toFixed(0)}%</div>

<div class="section-title" style="margin-top:10px;">
  PER TANK MIX
</div>

<div>Seed: ${perTank.seed.toFixed(1)} lbs</div>
<div>Fertilizer: ${perTank.fertilizer.toFixed(1)} lbs</div>
<div>Mulch: ${perTank.mulch.toFixed(1)} lbs</div>
<div>Tackifier: ${perTank.tackifier.toFixed(1)} lbs</div>
  </div>
</div>
`

let scheduleHTML = ""

if(isBuilderJob){

  scheduleHTML = buildProductionScheduleHTML(r)

} else {

  scheduleHTML = `

<div class="glass-card collapsible" data-card="schedule">

  <div class="card-header" onclick="toggleCard(this)">

    📅 SCHEDULING

    <span class="chevron">▼</span>

  </div>

  <div class="card-body">

    <!-- HEADER -->

<div style="

  margin-top:8px;

  font-size:13px;

  color:#4cff9a;

  font-weight:bold;

">

  ✅ Estimated Completion: ${

    endDate ? endDate.toLocaleDateString() : "—"

  }

</div>

    <div style="

      margin-top:15px;

      padding:12px;

      border-radius:10px;

      background:rgba(0,255,120,0.08);

      border:1px solid rgba(0,255,120,0.3);

    ">

      <div style="font-weight:bold;color:#4cff9a;">

        🌱 Professional Lawn Installation Plan

      </div>

      <div style="margin-top:6px;font-size:14px;color:#ddd;">

        This project is completed in structured phases to ensure proper soil preparation,

        nutrient absorption, and strong grass establishment.

      </div>

      <div style="margin-top:8px;font-size:13px;color:#aaa;">

       ⏱ Total Timeline: ~${totalWeeks} weeks (${totalDays} days)

      </div>

    </div>

    <!-- VALUE BLOCK -->

    <div style="

      margin-top:12px;

      padding:10px;

      border-radius:10px;

      background:rgba(255,215,0,0.06);

      border:1px solid rgba(255,215,0,0.2);

      font-size:13px;

      color:#ddd;

    ">

      💡 Why this process matters:

      <div style="margin-top:6px;">

        • Soil treatments need time to activate<br>

        • Proper spacing improves germination rates<br>

        • Reduces risk of washout or failure<br>

        • Produces thicker, healthier lawns

      </div>

    </div>

    <div style="margin:15px 0;border-top:1px solid rgba(255,255,255,0.08);"></div>

    <!-- METRICS -->

    <div>Total Job Time: ${totalJobHours.toFixed(1)} hrs</div>

    <div>Labor Time: ${laborHours.toFixed(1)} hrs</div>

    <div>Hydroseeding Time: ${tankHours.toFixed(1)} hrs</div>

    <div>Prep / Add-on Time: ${addonHours.toFixed(1)} hrs</div>

    <div style="margin-top:10px;">

      Tanks: ${totalTanks.toFixed(1)}

    </div>

    <div>Refill Cycles: ${refillCycles}</div>

    <div style="margin-top:10px;">

      Days Needed: <b>${daysNeeded}</b>

    </div>

    <div style="margin-top:10px;">

      Revenue / Day: <b>$${revenuePerDay.toFixed(0)}</b>

    </div>

    <div>

      Profit / Day: <b>$${profitPerDay.toFixed(0)}</b>

    </div>

    ${

      scheduleWarnings.length > 0

        ? `<div style="margin-top:10px;color:#ff4d4d;">

            ${scheduleWarnings.map(w => `<div>⚠️ ${w}</div>`).join("")}

           </div>`

        : `<div style="margin-top:10px;color:#4cff9a;">

            ✅ Efficient schedule

           </div>`

    }

    <!-- PLAN -->

    <div style="margin-top:15px;font-weight:bold;color:#ffd24d;">

      📋 INSTALLATION PLAN

    </div>

    <div style="margin-top:8px;color:#aaa;font-size:13px;">

      Our process ensures proper soil conditioning, seed establishment, and long-term lawn success.

    </div>

    ${(schedule || []).map(day => `

      <div style="

        margin-top:12px;

        padding:12px;

        border-radius:10px;

        background:rgba(255,255,255,0.03);

        border:1px solid rgba(255,215,0,0.25);

      ">

        <div style="display:flex;justify-content:space-between;align-items:center;">

          <div style="font-weight:bold;color:#4cff9a;">

        ${day.title}

          </div>

          <div style="font-size:12px;color:#aaa;">

            ${day.date}

          </div>

        </div>

        <div style="margin-top:8px;">

          ${day.tasks.map(task => `

            <div style="margin-left:8px;">• ${task}</div>

          `).join("")}

        </div>

      </div>

    `).join("")}

  </div>

</div>

`

}

  

document.getElementById("results").innerHTML =
recommendationHTML +
dealHTML +
tankHTML +
scheduleHTML +
insightsHTML +

`
<div class="glass-card collapsible" data-card="summary">
  <div class="card-header" onclick="toggleCard(this)">
    PROJECT SUMMARY
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    <div>Total Sqft: ${r.totalSqft}</div>
    <div>Houses: ${r.houses}</div>
  </div>
</div>

<div class="glass-card collapsible" data-card="inventory">
  <div class="card-header" onclick="toggleCard(this)">
    INVENTORY COST
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    <div>Standard: $${inv.standard.toFixed(2)}</div>
    <div>Premium: $${inv.premium.toFixed(2)}</div>
    <div>Add-Ons: $${inv.addons.toFixed(2)}</div>
    <div><b>Total Materials: $${inv.total.toFixed(2)}</b></div>
  </div>
</div>

<div class="glass-card collapsible" data-card="materials">
  <div class="card-header" onclick="toggleCard(this)">
    MATERIAL REQUIREMENTS
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
   ${Object.keys(comparison || {}).map(k => {

  let item = comparison[k] || {}

  let required = Number(item.required) || 0

  let available = Number(item.available) || 0

  let shortage = Number(item.shortage) || 0
      let color = item.status === "short" ? "red" : "#4cff9a"
      let unit = MATERIAL_RATES[k]?.unit || ""

      return `
        <div>
          ${k.toUpperCase()}:
          Need ${required.toFixed(1)} ${unit} |
          Have ${available.toFixed(1)} ${unit}
          <span style="color:${color}">
            ${item.status === "short"
              ? "BUY " + shortage.toFixed(1)
              : "OK"}
          </span>
        </div>
      `
    }).join("")}
  </div>
</div>

<div class="glass-card collapsible" data-card="usage">
  <div class="card-header" onclick="toggleCard(this)">
    MATERIAL USAGE
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    ${Object.keys(needs).map(k => {
      let unit = MATERIAL_RATES[k]?.unit || ""
      return `<div>${k.toUpperCase()}: ${Number(needs[k] || 0).toFixed(1)} ${unit}</div>`
    }).join("")}
  </div>
</div>

<div class="glass-card collapsible" data-card="base">
  <div class="card-header" onclick="toggleCard(this)">
    BASE PACKAGE
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    <div>Base Cost: $${(r.cost - r.laborCost - r.overheadCost).toFixed(2)}</div>
  </div>
</div>

<div class="glass-card collapsible" data-card="labor">
  <div class="card-header" onclick="toggleCard(this)">
    LABOR
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    <div>Total Hours: ${r.totalHours.toFixed(2)}</div>
    <div>Labor Cost: $${r.laborCost.toFixed(2)}</div>
    <div>Per House: $${(r.laborCost / r.houses).toFixed(2)}</div>
  </div>
</div>

<div class="glass-card collapsible" data-card="overhead">
  <div class="card-header" onclick="toggleCard(this)">
    OVERHEAD
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    <div>$${r.overheadCost.toFixed(2)}</div>
  </div>
</div>

<div class="glass-card collapsible" data-card="final">
  <div class="card-header" onclick="toggleCard(this)">
    FINAL NUMBERS
    <span class="chevron">▼</span>
  </div>
  <div class="card-body">
    <div>Total Cost: $${r.cost.toFixed(2)}</div>
    <div>Price: $${r.price.toFixed(2)}</div>
    <div>Profit: $${r.profit.toFixed(2)}</div>
    <div>Margin: ${(r.profit / r.price * 100).toFixed(1)}%</div>
  </div>
</div>
`

if(r.usingFallback){

  document.getElementById("results").innerHTML += `

    <div style="

      margin-top:10px;

      padding:10px;

      border:1px solid orange;

      border-radius:8px;

      color:orange;

    ">

      ⚠️ Using estimated pricing (inventory incomplete)

    </div>

  `

}

    // ==========================
    // AUTO WARNINGS
    // ==========================

    setTimeout(() => {

      if(Object.values(comparison).some(i => i.status === "short")){
        if(!shownToasts.has("materials")){
          showToast("📡Inventory shortage detected", "error")
          shownToasts.add("materials")
        }
      }

      if(marginPercent < 25){
        if(!shownToasts.has("pricing")){
          showToast("📉Low margin detected", "warning")
          shownToasts.add("pricing")
        }
      }

    }, 50)

setTimeout(() => {

  let opened = false

  // 🚨 PRIORITY 1 — LOSING MONEY
  if(marginPercent < 20){
    openCard("final")
    highlightCard("final")
    opened = true
  }

  // 🚨 PRIORITY 1.5 — TANK TOO HEAVY
 if(!opened && mixWeight > maxWeight){
    openCard("tank")
    highlightCard("tank")
    opened = true
  }

  // 🚨 PRIORITY 2 — INVENTORY SHORTAGE
  if(!opened && Object.values(comparison).some(i => i.status === "short")){
    openCard("materials")
    highlightCard("materials")
    opened = true
  }

  // ⚠️ PRIORITY 3 — LABOR TOO HIGH
  if(!opened && r.laborCost > r.cost * 0.4){
    openCard("labor")
    highlightCard("labor")
    opened = true
  }

  // 📊 DEFAULT — SHOW SUMMARY
  if(!opened){
    openCard("summary")
  }

}, 100)

renderSchedulePreview()
 renderPipeline()

let today = new Date().toDateString()

if(localStorage.getItem("lastFollowUpCheck") !== today){

  let stale = getStaleLeads()

  if(stale.length > 0){

    showToast(`⚠️ ${stale.length} follow-ups needed`, "warning")

  }

  localStorage.setItem("lastFollowUpCheck", today)

}

  } catch(e){
    console.error(e)
    document.getElementById("results").innerHTML = "Error in calculation"
  }
}

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

function resetToasts(){

  if(window.shownToasts){

    window.shownToasts.clear()

  }

}

//========================
//=== RENDER HISTORY
//========================

function renderHistory(){

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")

  let html = ""

  history.forEach((job, index) => {

    let color =
      job.margin < 20 ? "#ff4d4d" :
      job.margin < 30 ? "#ffd24d" :
      "#4cff9a"

    html += `
      <div class="history-card">

        <div class="history-top">
          <b>${job.sqft} sqft</b>
          <span style="color:${color}">
            ${job.margin.toFixed(1)}%
          </span>
        </div>

        <div class="history-details">
          📜 $${job.price.toFixed(2)} |
          Profit: $${job.profit.toFixed(2)}
        </div>

        ${job.schedule ? `
  <div style="margin-top:6px;font-size:12px;color:#aaa;">
    ${Object.entries(job.schedule)
      .filter(([k,v]) => v)
      .map(([k,v]) => `<div>${k}: ${new Date(v).toLocaleString()}</div>`)
      .join("")}
  </div>
` : ""}

        <div class="history-date">
          ${job.date}
        </div>

        <div style="margin-top:10px; display:flex; gap:8px;">
          <button onclick="editJob(${index})">✏️ Edit</button>
          <button onclick="deleteJob(${index})">🗑️Delete</button>
        </div>

      </div>
    `
  })

  document.getElementById("jobHistory").innerHTML = html
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

function renderSchedulePreview(){

  let r = calculateJob()

  let schedule = buildSchedule(r)

  let container = document.getElementById("schedulePreview")

  if(!container) return

  if(!schedule || schedule.length === 0){

    container.innerHTML = `<div style="color:#aaa;">No schedule yet</div>`

    return

  }

  container.innerHTML = schedule.map(day => `

    <div style="

      margin-bottom:10px;

      padding:10px;

      border-radius:8px;

      background:rgba(255,255,255,0.03);

      border:1px solid rgba(255,215,0,0.2);

    ">

      <div style="font-weight:bold;color:#4cff9a;">

        Day ${day.day} — ${day.title}

      </div>

      <div style="font-size:12px;color:#aaa;">

        ${day.date}

      </div>

      <div style="margin-top:6px;">

        ${day.tasks.map(t => `<div>• ${t}</div>`).join("")}

      </div>

    </div>

  `).join("")

}

document.getElementById("projectStart")?.addEventListener("change", () => {

  render()

})

document.querySelectorAll('input[name="timeline"]').forEach(radio => {

  radio.addEventListener("change", () => {

    render()

  })

})

document.addEventListener("DOMContentLoaded", () => {

  let today = new Date()

  let iso = today.toISOString().split("T")[0]

  let quoteInput = document.getElementById("quoteDate")

  if(quoteInput && !quoteInput.value){

    quoteInput.value = iso

  }

})