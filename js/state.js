// state.js

window.state = {

  job: {
    sqft: 0,
    houses: 1,
    package: "standard",
    pricingMode: "balanced",
    targetMargin: 0,

    labor: {
      hourlyRate: 0,
      hoursPerHouse: 0,
      crewSize: 1,
      overhead: 0
    },

    addons: {
      aeration:false,
      compost:false,
      biohum:false,
      biochar:false,
      humic:false,
      grow:false,
      lime:false,
      sulfur:false
    }
  },

  ui: {
    tankSize: 500,
    timeline: "standard"
  },

  inventory: null,
  proposals: []
}

// app.js

window.onload = () => {

  syncStateFromUI()

  loadInventory()

  renderHistory()

  render()

}

//==========================
//SYNC STATE FROM UI
//==========================

function syncStateFromUI(){

  let s = state

  s.job.sqft = Number(document.getElementById("sqft")?.value) || 0

  s.job.houses = Number(document.getElementById("houses")?.value) || 1

  s.job.package = document.getElementById("package")?.value || "standard"

  s.job.pricingMode = document.getElementById("pricingMode")?.value || "balanced"

  s.job.targetMargin = Number(document.getElementById("targetMargin")?.value) || 0

  s.job.labor.hourlyRate = Number(document.getElementById("hourlyRate")?.value) || 0

  s.job.labor.hoursPerHouse = Number(document.getElementById("hoursPerHouse")?.value) || 0

  s.job.labor.crewSize = Number(document.getElementById("crewSize")?.value) || 1

  s.job.labor.overhead = Number(document.getElementById("overhead")?.value) || 0

  s.ui.tankSize = Number(document.getElementById("tankSize")?.value) || 500

}

// auto sync on input

document.addEventListener("input", (e) => {

  syncStateFromUI()

  if(e.target.closest(".material-row")){

    saveInventory()

  }

  requestRender()

})

//====================
//REQUEST RENDER
//====================

let renderTimeout = null

function requestRender(){

  if(renderTimeout){

    clearTimeout(renderTimeout)

  }

  renderTimeout = setTimeout(() => {

    render()

  }, 120)

}

//=============================
//=====RENDER
//=============================

function render(){

  try{

    window.shownToasts = window.shownToasts || new Set()

    let shownToasts = window.shownToasts

    // ==========================

    // 🔥 SINGLE CALCULATION

    // ==========================

    let r = calculateJob()

    let needs = r.needs

    let comparison = r.comparison

    let inventoryTotals = getInventoryTotals()

    let inv = getInventoryCost()

    // ==========================

    // 🚛 TANK CALCULATIONS

    // ==========================

   let tankData = calculateTankLoads(r, needs, state.ui.tankSize)

    let perTank = tankData?.perTank || {

      seed: 0,

      mulch: 0,

      fertilizer: 0,

      tackifier: 0

    }

    let tankSize = Number(document.getElementById("tankSize")?.value) || 500

    let mixWeight =

      perTank.seed +

      perTank.mulch +

      perTank.fertilizer +

      perTank.tackifier

    let maxWeight =

      tankSize === 100 ? 300 :

      tankSize === 300 ? 800 :

      tankSize === 500 ? 1200 :

      tankSize === 700 ? 1600 :

      2000

    let percentFull = maxWeight ? (mixWeight / maxWeight) * 100 : 0

    let refillCycles = Math.max(0, Math.ceil(tankData.loads) - 1)

    // ==========================

    // ⏱ TIME CALCULATIONS

    // ==========================

    let laborHours = r.totalHours || 0

    let tankHours = (tankData.loads * (20 + 15)) / 60

    let addons = app.job.addons || {}

    let addonHours = 0

    if(addons.lime || addons.sulfur) addonHours += 0.5

    if(addons.aeration || addons.compost) addonHours += 1.5

    if(addons.biohum || addons.biochar || addons.humic) addonHours += 0.5

    if(addons.grow) addonHours += 2

    let sizeFactor = r.totalSqft / 5000

    addonHours *= Math.max(0.5, sizeFactor)

    let totalJobHours = laborHours + tankHours + addonHours

    let crewSize = Number(document.getElementById("crewSize")?.value) || 1

    let daysNeeded = Math.max(1, Math.ceil(totalJobHours / (crewSize * 8)))

    let revenuePerDay = r.price / daysNeeded

    let profitPerDay = r.profit / daysNeeded

    // ==========================

    // 📅 SCHEDULE

    // ==========================

    let schedule = buildSchedule(r)

    let startDate = schedule[0]?.date ? new Date(schedule[0].date) : null

    let endDate = schedule[schedule.length - 1]?.date

      ? new Date(schedule[schedule.length - 1].date)

      : null

    let totalDays = startDate && endDate

      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

      : 0

    let totalWeeks = (totalDays / 7).toFixed(1)

    // ==========================

    // 📊 METRICS

    // ==========================

    let pricePerSqft = r.totalSqft ? r.price / r.totalSqft : 0

    let marginPercent = r.price ? (r.profit / r.price) * 100 : 0

    // ==========================

    // 🧠 AI + DEAL SCORE

    // ==========================

    let dealScore = calculateDealScore(r, comparison)

    let insights = generateAIInsights(r, comparison) || []

    // ==========================

    // ⚠️ WARNINGS

    // ==========================

    let scheduleWarnings = []

    if(revenuePerDay < 1500) scheduleWarnings.push("Low revenue per day — consider batching jobs")

    if(profitPerDay < 500) scheduleWarnings.push("Low profit per day — job may not be worth it")

    if(daysNeeded > 2 && r.totalSqft < 10000) scheduleWarnings.push("Too many days for job size")

    // ==========================

    // 💡 RECOMMENDATION

    // ==========================

    let currentPackage = document.getElementById("package")?.value || "standard"

    let altPackage = currentPackage === "standard" ? "premium" : "standard"

    let alt = calculateJob({ packageOverride: altPackage })

    let recommendationHTML = ""

    if(alt.price > r.price){

      recommendationHTML = `

        <div style="margin:15px 0;padding:12px;border:1px solid gold;border-radius:10px;">

          🛎️ Switch to ${altPackage.toUpperCase()} 

          <span style="color:#4cff9a;">+ $${(alt.profit - r.profit).toFixed(2)}</span>

        </div>

      `

    }

    // ==========================

    // 🎯 DEAL SCORE UI

    // ==========================

    let dealColor =

      dealScore >= 80 ? "#4cff9a" :

      dealScore >= 60 ? "#ffd24d" :

      "#ff4d4d"

    let dealHTML = `

      <div class="glass-card" style="text-align:center;border:2px solid ${dealColor};">

        <div style="font-size:42px;color:${dealColor};">${dealScore}/100</div>

      </div>

    `

    // ==========================

    // 🚛 TANK UI

    // ==========================

    let tankHTML = `

      <div class="glass-card">

        <div>Tanks: ${tankData.loads.toFixed(2)}</div>

        <div>Load Weight: ${mixWeight.toFixed(0)} lbs</div>

        <div>Capacity: ${percentFull.toFixed(0)}%</div>

      </div>

    `

    // ==========================

    // 📅 SCHEDULE UI

    // ==========================

    let scheduleHTML = `

      <div class="glass-card">

        <div>Days Needed: ${daysNeeded}</div>

        <div>Timeline: ${totalWeeks} weeks</div>

      </div>

    `

    // ==========================

    // 🤖 AI INSIGHTS UI

    // ==========================

    let insightsHTML = `

      <div class="glass-card">

        ${insights.map(i => `<div>${i.text}</div>`).join("")}

      </div>

    `

    // ==========================

    // 🧾 FINAL RENDER

    // ==========================

    document.getElementById("results").innerHTML =

      recommendationHTML +

      dealHTML +

      tankHTML +

      scheduleHTML +

      insightsHTML +

      `

      <div class="glass-card">

        <div>Total Cost: $${r.cost.toFixed(2)}</div>

        <div>Price: $${r.price.toFixed(2)}</div>

        <div>Profit: $${r.profit.toFixed(2)}</div>

        <div>Margin: ${marginPercent.toFixed(1)}%</div>

      </div>

      `

    // ==========================

    // 🔔 TOASTS

    // ==========================

    setTimeout(() => {

      if(Object.values(comparison).some(i => i.status === "short")){

        if(!shownToasts.has("materials")){

          showToast("📡 Inventory shortage", "error")

          shownToasts.add("materials")

        }

      }

      if(marginPercent < 25){

        if(!shownToasts.has("pricing")){

          showToast("📉 Low margin", "warning")

          shownToasts.add("pricing")

        }

      }

      if(mixWeight > maxWeight){

        if(!shownToasts.has("tank")){

          showToast("⚠️ Tank overloaded", "warning")

          shownToasts.add("tank")

        }

      }

    }, 50)

    renderSchedulePreview()

    renderPipeline()

  } catch(e){

    console.error(e)

    document.getElementById("results").innerHTML = "Error in calculation"

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

//=========================
//RENDER SCHEDULE PREVIEW
//=========================

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

  requestRender()

})

document.querySelectorAll('input[name="timeline"]').forEach(radio => {

  radio.addEventListener("change", () => {

    requestRender()

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

function resetToasts(){

  if(window.shownToasts){

    window.shownToasts.clear()

  }