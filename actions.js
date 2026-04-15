//=============================
// SIZE BUTTONS
//=============================
function setSize(val){
  document.getElementById("sqft").value = val
  render()
}

//=============================
// TOGGLE ADDONS
//=============================
function toggleAddon(el){
  let name = el.dataset.name

  if(!app.job.addons){
    app.job.addons = {}
  }

  app.job.addons[name] = !app.job.addons[name]
  el.classList.toggle("active")

  render()
}

//=============================
// PACKAGE HANDLER
//=============================
function handlePackage(){

  let pkg = document.getElementById("package").value
  let toggles = document.querySelectorAll(".toggle")

  if(pkg === "premium"){

    toggles.forEach(t => {
      let name = t.dataset.name

      if(name === "aeration" ||
         name === "compost" ||
         name === "biohum" ||
         name === "lime" ||
         name === "sulfur"){

        t.classList.add("active")
        app.job.addons[name] = true
      }
    })

  } else {

    toggles.forEach(t => {
      t.classList.remove("active")
      app.job.addons[t.dataset.name] = false
    })

  }

  render()
}

//=============================
// FIX LOW MARGIN
//=============================
window.fixLowMargin = function(){

  let input = document.getElementById("targetMargin")

  if(!input){
    showToast("Margin input missing", "error")
    return
  }

  let current = Number(input.value) || 0

  if(current < 30){
    input.value = 35
  } else {
    input.value = current + 5
  }

  render()
  showToast("📈 Margin improved", "success", "pricing")
}

//=============================
// FIX LOW PRICE
//=============================
window.fixLowPrice = function(){

  let marginInput = document.getElementById("targetMargin")
  let pricingMode = document.getElementById("pricingMode")

  if(!marginInput || !pricingMode){
    showToast("Missing inputs", "error")
    return
  }

  marginInput.value = 35
  pricingMode.value = "max"

  render()
  showToast("🛡️ Profit optimized", "success", "pricing")
}

//=============================
// FIX INVENTORY
//=============================
window.fixInventory = function(type, amount){

  let container

  if(type === "seed" || type === "fertilizer" || type === "mulch" || type === "tackifier"){
    container = document.getElementById("standardMaterials")
  } 
  else if(type === "compost" || type === "biochar" || type === "humic"){
    container = document.getElementById("premiumMaterials")
  } 
  else {
    container = document.getElementById("addonMaterials")
  }

  if(!container) return

  let rows = container.querySelectorAll(".material-row")
  let found = false

  rows.forEach(row => {

    let select = row.querySelector("select")
    let inputs = row.querySelectorAll("input")

    if(select && select.value === type){

      let currentQty = Number(inputs[2]?.value) || 0
      inputs[2].value = Math.ceil(currentQty + amount)

      showToast(`${MATERIAL_LABELS[type]} +${Math.ceil(amount)} added`)
      found = true
    }
  })

  // CREATE NEW ROW IF NOT FOUND
  if(!found){

    let row = document.createElement("div")
    row.className = "material-row"

    row.innerHTML = `
      <div class="row-top">
        <select class="mat-select">
          <option value="seed" ${type==="seed"?"selected":""}>Seed</option>
          <option value="fertilizer" ${type==="fertilizer"?"selected":""}>Fertilizer</option>
          <option value="mulch" ${type==="mulch"?"selected":""}>Mulch</option>
          <option value="tackifier" ${type==="tackifier"?"selected":""}>Tackifier</option>
          <option value="compost" ${type==="compost"?"selected":""}>Compost</option>
          <option value="biochar" ${type==="biochar"?"selected":""}>Biochar</option>
          <option value="humic" ${type==="humic"?"selected":""}>Humic Acid</option>
          <option value="lime" ${type==="lime"?"selected":""}>Lime</option>
          <option value="sulfur" ${type==="sulfur"?"selected":""}>Sulfur</option>
          <option value="sprinklers" ${type==="sprinklers"?"selected":""}>Sprinklers</option>
          <option value="timers" ${type==="timers"?"selected":""}>Sprinkler Timers</option>
        </select>

        <button class="delete-btn" onclick="deleteRow(this)">✖</button>
      </div>

      <label class="mat-label">Material Name</label>
      <input class="mat-input" value="${MATERIAL_LABELS[type] || type}">

      <label class="mat-label">Cost per Unit ($)</label>
      <input class="mat-input" type="number" value="0">

      <label class="mat-label unit-label">Quantity Available</label>
      <input class="mat-input" type="number" value="${Math.ceil(amount)}">
    `

    container.appendChild(row)
    showToast(`${MATERIAL_LABELS[type]} +${Math.ceil(amount)} added`)
  }

  saveInventory()
  loadInventory()

  setTimeout(() => render(), 50)
}

//=============================
// FIX ALL ISSUES
//=============================
window.fixAllIssues = function(){

  fixLowMargin()
  fixLowPrice()

  let r = calculateJob()
  let needs = getMaterialNeeds(r)
  let inventory = getInventoryTotals()

  let fixes = 0

  Object.keys(needs).forEach(type => {

    let shortage = (needs[type] || 0) - (inventory[type] || 0)

    if(shortage > 0.5){
      fixInventory(type, shortage)
      fixes++
    }
  })

  showToast(`🔨${fixes} issues fixed`, "warning")

  setTimeout(() => render(), 100)
}

//=============================
// OPTIMIZE FOR PROFIT
//=============================
window.optimizeForProfit = function(){

  let r = calculateJob()

  let sqft = r.totalSqft
  let currentMargin = r.price ? (r.profit / r.price) * 100 : 0

  let marginInput = document.getElementById("targetMargin")
  let pricingMode = document.getElementById("pricingMode")

  let targetMargin = 30

  if(sqft < 3000) targetMargin = 40
  else if(sqft < 8000) targetMargin = 35
  else if(sqft < 20000) targetMargin = 30
  else targetMargin = 25

  if(r.profit < 200){
    targetMargin += 5
  }

  if(currentMargin > targetMargin){
    targetMargin = currentMargin
  }

  marginInput.value = Math.round(targetMargin)
  pricingMode.value = "max"

  showToast("All issues fixed💡")
  render()
}

//=============================
// TARGET PROFIT
//=============================
window.optimizeForTargetProfit = function(){

  let targetProfit = Number(document.getElementById("targetProfit")?.value) || 0

  if(targetProfit <= 0){
    alert("Enter target profit")
    return
  }

  let pricingMode = document.getElementById("pricingMode")
  let marginInput = document.getElementById("targetMargin")

  let margin = 25
  let attempts = 0

  while(attempts < 20){

    marginInput.value = margin
    pricingMode.value = "max"

    let r = calculateJob()

    if(r.profit >= targetProfit){
      break
    }

    margin += 2
    attempts++
  }

  render()
  alert(`Target hit at ${margin}% margin 🎯`)
}

//=============================
// WIN JOB
//=============================
window.winJob = function(){

  let marginInput = document.getElementById("targetMargin")
  let pricingMode = document.getElementById("pricingMode")

  marginInput.value = 15
  pricingMode.value = "win"

  showToast("Competitive pricing applied🚀", "warning")
  render()
}