//=========================
// FIX LOW MARGIN
//=========================
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
  showToast("📈 Margin improved", "success")
}

//===================
// FIX LOW PRICE
//===================
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
  showToast("🛡️ Profit optimized", "success")
}

//================
// FIX INVENTORY
//================
window.fixInventory = function(type, amount){

  let container

  if(["seed","fertilizer","mulch","tackifier"].includes(type)){
    container = document.getElementById("standardMaterials")
  } else if(["compost","biochar","humic"].includes(type)){
    container = document.getElementById("premiumMaterials")
  } else {
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
      found = true
    }
  })

  if(!found){
    addMaterialRow("addons") // fallback
  }

  saveInventory()
  loadInventory()
  render()

  showToast(`${type.toUpperCase()} updated`, "success")
}

//=========================
// FIX ALL ISSUES
//=========================
window.fixAllIssues = function(){

  fixLowMargin()
  fixLowPrice()

  let r = calculateJob()
  let needs = getMaterialNeeds(r)
  let inventory = getInventoryTotals()

  Object.keys(needs).forEach(type => {
    let shortage = (needs[type] || 0) - (inventory[type] || 0)
    if(shortage > 0.5){
      fixInventory(type, shortage)
    }
  })

  showToast("🔨 Issues fixed", "warning")
  render()
}

//========================
// OPTIMIZE FOR PROFIT
//========================
window.optimizeForProfit = function(){

  let r = calculateJob()
  let sqft = r.totalSqft

  let marginInput = document.getElementById("targetMargin")
  let pricingMode = document.getElementById("pricingMode")

  let target = 30

  if(sqft < 3000) target = 40
  else if(sqft < 8000) target = 35
  else if(sqft > 20000) target = 25

  marginInput.value = target
  pricingMode.value = "max"

  render()
  showToast("Profit optimized 💰", "success")
}

//================================
// TARGET PROFIT
//================================
window.optimizeForTargetProfit = function(){

  let targetProfit = Number(document.getElementById("targetProfit")?.value)

  if(!targetProfit){
    alert("Enter target profit")
    return
  }

  let marginInput = document.getElementById("targetMargin")
  let pricingMode = document.getElementById("pricingMode")

  let margin = 25

  for(let i=0;i<20;i++){
    marginInput.value = margin
    pricingMode.value = "max"

    let r = calculateJob()

    if(r.profit >= targetProfit){
      break
    }

    margin += 2
  }

  render()
  alert("Target profit hit 🎯")
}

//==========================
// WIN JOB
//==========================
window.winJob = function(){

  let marginInput = document.getElementById("targetMargin")
  let pricingMode = document.getElementById("pricingMode")

  marginInput.value = 15
  pricingMode.value = "win"

  render()
  showToast("Competitive pricing applied 🚀", "warning")
}