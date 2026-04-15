//==============================
//==== BUILDER MODE
//==============================
function getBuilderMultiplier(houses){
  if(houses <= 1) return 1
  if(houses <= 5) return 0.95
  if(houses <= 10) return 0.9
  if(houses <= 20) return 0.85
  if(houses <= 50) return 0.80
  return 0.75
}

//=======================
//AVG COST FROM INVENTORY
//=======================
function getAvgCostFromInventory(type, inventory){
  let totalQty = 0
  let totalCost = 0

  Object.values(inventory).forEach(section => {
    (section || []).forEach(item => {
      if(item.type === type){
        let qty = Number(item.qty) || 0
        let cost = Number(item.cost) || 0
        totalQty += qty
        totalCost += qty * cost
      }
    })
  })

  if(totalQty === 0){
    return COSTS[type] || 0
  }

  return totalCost / totalQty
}

//=====================
//==MATERIAL NEEDS
//======================
function getMaterialNeeds(input){

  let sqft = input.totalSqft || input.sqft || 0
  let needs = {}

  needs.seed       = (sqft / 1000) * MATERIAL_RATES.seed.rate
  needs.fertilizer = (sqft / 1000) * MATERIAL_RATES.fertilizer.rate
  needs.mulch      = (sqft / 1000) * MATERIAL_RATES.mulch.rate
  needs.tackifier  = (sqft / 1000) * MATERIAL_RATES.tackifier.rate

  let packageType = document.getElementById("package")?.value || "standard"

  if(packageType === "premium"){
    needs.compost = (sqft / 1000) * MATERIAL_RATES.compost.rate
    needs.biochar = (sqft / 1000) * (MATERIAL_RATES.biochar.rate * 0.5)
    needs.humic   = (sqft / 1000) * (MATERIAL_RATES.humic.rate * 0.5)
  }

  let addons = app.job.addons || {}

  if(addons.lime){
    needs.lime = (sqft / 1000) * MATERIAL_RATES.lime.rate
  }

  if(addons.sulfur){
    needs.sulfur = (sqft / 1000) * MATERIAL_RATES.sulfur.rate
  }

  if(addons.biochar){
    needs.biochar = (needs.biochar || 0) +
      (sqft / 1000) * MATERIAL_RATES.biochar.rate
  }

  if(addons.humic){
    needs.humic = (needs.humic || 0) +
      (sqft / 1000) * MATERIAL_RATES.humic.rate
  }

  return needs
}

//============================
//==== CALCULATE JOB
//============================
function calculateJob(){

  let sqft = Number(document.getElementById("sqft")?.value) || 0
  let houses = Number(document.getElementById("houses")?.value) || 1
  let packageType = document.getElementById("package")?.value || "standard"
  let pricingMode = document.getElementById("pricingMode")?.value || "balanced"
  let targetMarginInput = Number(document.getElementById("targetMargin")?.value)

  let builderMult = getBuilderMultiplier(houses)
  let totalSqft = sqft * houses

  let hourlyRate = Number(document.getElementById("hourlyRate")?.value) || 0
  let hoursPerHouse = Number(document.getElementById("hoursPerHouse")?.value) || 0
  let crewSize = Number(document.getElementById("crewSize")?.value) || 1
  let overheadPct = Number(document.getElementById("overhead")?.value) || 0

  let laborEfficiency = 1 - ((1 - builderMult) * 0.5)
  let totalHours = hoursPerHouse * houses * laborEfficiency
  let laborCost = totalHours * hourlyRate * crewSize

  let baseRate = packageType === "premium" ? 0.30 : 0.18
  let baseCost = totalSqft * baseRate
  if(baseCost < 500) baseCost = 500

  let materialCost = 0
  let needs = getMaterialNeeds({ totalSqft })

  let inventoryCache = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  Object.keys(needs).forEach(type => {
    let needed = needs[type] || 0
    let avgCost = getAvgCostFromInventory(type, inventoryCache)
    materialCost += needed * avgCost
  })

  if(materialCost < baseCost){
    materialCost = baseCost
    showToast("Using base pricing (inventory incomplete)", "warning")
  }

  if(materialCost < 500){
    materialCost = 500
  }

  let overheadCost = (materialCost + laborCost) * (overheadPct / 100)
  let totalCost = materialCost + laborCost + overheadCost

  let margin = targetMarginInput > 0
    ? targetMarginInput / 100
    : (pricingMode === "max" ? 0.5 : pricingMode === "win" ? 0.15 : 0.3)

  if(houses >= 10) margin -= 0.03
  if(houses >= 20) margin -= 0.05
  if(houses >= 50) margin -= 0.08
  if(margin < 0.1) margin = 0.1

  let price = totalCost / (1 - margin)

  if(price < totalCost * 1.1){
    price = totalCost * 1.1
  }

  let profit = price - totalCost

  return {
    sqft,
    houses,
    totalSqft,
    cost: totalCost,
    price,
    profit,
    laborCost,
    overheadCost
  }
}
