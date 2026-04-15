//=====================
//== TOAST
//=====================
function showToast(message, type = "success"){
  let toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerText = message

  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add("show"), 10)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

//=====================
//== RENDER
//=====================
function render(){

  try{

    let r = calculateJob()
    let needs = getMaterialNeeds(r)
    let inventoryTotals = getInventoryTotals()
    let comparison = compareInventory(needs, inventoryTotals)

    let marginPercent = r.price ? (r.profit / r.price) * 100 : 0
    let pricePerSqft = r.totalSqft ? r.price / r.totalSqft : 0
    let costPerSqft = r.totalSqft ? r.cost / r.totalSqft : 0

    // ==========================
    // MATERIAL DISPLAY
    // ==========================
    let materialHTML = "<b>MATERIAL REQUIREMENTS</b><br>"

    Object.keys(comparison).forEach(k => {
      let item = comparison[k]
      let color = item.status === "short" ? "red" : "lime"

      materialHTML += `
        ${k.toUpperCase()}:
        Need ${item.required.toFixed(1)} |
        Have ${item.available.toFixed(1)}
        <span style="color:${color}">
          ${item.status === "short"
            ? "BUY " + item.shortage.toFixed(1)
            : "OK"}
        </span><br>
      `
    })

    // ==========================
    // RECOMMENDATION ENGINE
    // ==========================
    let currentPackage = document.getElementById("package")?.value || "standard"
    let altPackage = currentPackage === "standard" ? "premium" : "standard"

    document.getElementById("package").value = altPackage
    let alt = calculateJob()
    document.getElementById("package").value = currentPackage

    let recommendationHTML = ""

    if(alt.price > r.price){
      recommendationHTML = `
        <div style="margin:15px 0;padding:12px;border:1px solid gold;border-radius:10px;background:rgba(255,215,0,0.08);">
          💡 <b>Recommendation:</b><br>
          Switch to ${altPackage.toUpperCase()} →
          <span style="color:#4cff9a;font-weight:700;">
            +$${(alt.profit - r.profit).toFixed(2)} profit
          </span>
        </div>
      `
    }

    // ==========================
    // OUTPUT
    // ==========================
    document.getElementById("results").innerHTML =
      recommendationHTML +
      `<div>Total Sqft: ${r.totalSqft}</div>` +
      `<div>Total Cost: $${r.cost.toFixed(2)}</div>` +
      `<div>Price: $${r.price.toFixed(2)}</div>` +
      `<div>Profit: $${r.profit.toFixed(2)}</div>` +
      `<div>Margin: ${marginPercent.toFixed(1)}%</div>` +
      `<div>Price / Sqft: $${pricePerSqft.toFixed(2)}</div>` +
      `<div>Cost / Sqft: $${costPerSqft.toFixed(2)}</div>` +
      `<br>` +
      materialHTML

    // ==========================
    // AUTO WARNINGS
    // ==========================
    if(Object.values(comparison).some(i => i.status === "short")){
      showToast("Inventory shortage detected", "error")
    }

    if(marginPercent < 25){
      showToast("Low margin detected", "warning")
    }

  } catch(e){
    console.error(e)
    document.getElementById("results").innerHTML = "Error in calculation"
  }
}

//=====================
//== HISTORY
//=====================
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
          💰 $${job.price.toFixed(2)} |
          Profit: $${job.profit.toFixed(2)}
        </div>

        <div class="history-date">
          ${job.date}
        </div>

        <div style="margin-top:10px;">
          <button onclick="deleteJob(${index})">🗑 Delete</button>
        </div>

      </div>
    `
  })

  document.getElementById("jobHistory").innerHTML = html
}