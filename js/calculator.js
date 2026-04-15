//==============================
// BUILDER MODE
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
// AVG COST FROM INVENTORY
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
// MATERIAL NEEDS
//=====================
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
// CALCULATE JOB
//============================
function calculateJob(){

  let sqft = Number(document.getElementById("sqft")?.value) || 0
  let houses = Number(document.getElementById("houses")?.value) || 1

  let builderMult = getBuilderMultiplier(houses)
  let totalSqft = sqft * houses

  let hourlyRate = Number(document.getElementById("hourlyRate")?.value) || 0
  let hoursPerHouse = Number(document.getElementById("hoursPerHouse")?.value) || 0
  let crewSize = Number(document.getElementById("crewSize")?.value) || 1
  let overheadPct = Number(document.getElementById("overhead")?.value) || 0

  let laborEfficiency = 1 - ((1 - builderMult) * 0.5)
  let totalHours = hoursPerHouse * houses * laborEfficiency
  let laborCost = totalHours * hourlyRate * crewSize

  let baseCost = totalSqft * 0.18
  if(baseCost < 500) baseCost = 500

  let needs = getMaterialNeeds({ totalSqft })
  let inventory = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  let materialCost = 0

  Object.keys(needs).forEach(type => {
    let needed = needs[type]
    let avgCost = getAvgCostFromInventory(type, inventory)
    materialCost += needed * avgCost
  })

  if(materialCost < baseCost){
    materialCost = baseCost
  }

  let overheadCost = (materialCost + laborCost) * (overheadPct / 100)
  let totalCost = materialCost + laborCost + overheadCost

  let margin = 0.3
  let price = totalCost / (1 - margin)

  return {
    totalSqft,
    cost: totalCost,
    price,
    profit: price - totalCost,
    laborCost,
    overheadCost
  }
}