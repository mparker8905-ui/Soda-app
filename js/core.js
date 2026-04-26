const COSTS = {
  seed: 3,        // per lb
  fertilizer: 1.5,
  mulch: 0.35,
  tackifier: 3,

  compost: 60,    // per yd³ (this one is fine)
  biohum: 25,

  lime: 0.5,
  sulfur: 1,

  biochar: 1.5,
  humic: 2,
  grow: 50
}

const MATERIAL_RATES = {
  seed:       { rate: 5, unit: "lbs" },
  fertilizer: { rate: 4, unit: "lbs" },
  mulch:      { rate: 70, unit: "lbs" },
  tackifier:  { rate: 3, unit: "lbs" },

  compost:    { rate: 0.5, unit: "yd3" },
  biochar:    { rate: 10, unit: "lbs" },
  humic:      { rate: 1, unit: "lbs" },

  lime:       { rate: 4, unit: "lbs" },
  sulfur:     { rate: 8, unit: "lbs" },

  sprinklers: { rate: 1, unit: "units" },
  timers: { rate: 1, unit: "units" }
}

//===================
//== CALCULATE JOB
//===================

function calculateJob(options = {}){

let inventory = getInventoryCache()

  let sqft = Number(document.getElementById("sqft")?.value) || 0
  let houses = Number(document.getElementById("houses")?.value) || 1

let packageType = options.packageOverride 

  || document.getElementById("package")?.value 

  || "standard"

  let pricingMode = document.getElementById("pricingMode")?.value || "balanced"
  let targetMarginInput = Number(document.getElementById("targetMargin")?.value)

  let builderMult = getBuilderMultiplier(houses)

  let totalSqft = sqft * houses

  // ==============================
  // LABOR INPUTS
  // ==============================

  let hourlyRate = Number(document.getElementById("hourlyRate")?.value) || 0
  let hoursPerHouse = Number(document.getElementById("hoursPerHouse")?.value) || 0
  let crewSize = Number(document.getElementById("crewSize")?.value) || 1
  let overheadPct = Number(document.getElementById("overhead")?.value) || 0

  let laborEfficiency = 1 - ((1 - builderMult) * 0.5)
  let totalHours = hoursPerHouse * houses * laborEfficiency
  let laborCost = totalHours * hourlyRate * crewSize

  // ==========================
  // BASE COST
  // ==========================

  let baseRate = 0

  if(packageType === "standard") baseRate = 0.18
  if(packageType === "premium") baseRate = 0.30





// NEW LOGIC

let materialCost = 0

let needs = getMaterialNeeds(

  { totalSqft },

  packageType,

  app.job.addons

)

Object.keys(needs).forEach(type => {
  let needed = needs[type] || 0
  let avgCost = getAvgCostFromInventory(type, inventory)
  materialCost += needed * avgCost
})

let inventoryTotals = getInventoryTotals()

let comparison = compareInventory(needs, inventoryTotals)

let hasShortage = Object.values(comparison).some(i => i.status === "short")

let usedFallback = false

if(hasShortage){

  usedFallback = true

  showToast("Using base pricing (inventory shortage detected)", "warning")

}

// fallback safety

if(usedFallback){
  showToast("Using base pricing (inventory incomplete)", "warning")
}

// minimum job floor
if(materialCost < 500){
  materialCost = 500
}

let addonCosts = {
  aeration: 0,
  compost: 0,
  biohum: 0,
  biochar: 0,
  humic: 0,
  grow: 0,
  lime: 0,
  sulfur: 0
}

  // ==========================
  // ADDONS
  // ==========================

  let addons = app.job.addons || {}

  function isIncluded(name){
    if(packageType !== "premium") return false
    return ["aeration","compost","biohum","lime","sulfur"].includes(name)
  }

// Aeration
if(addons.aeration && !isIncluded("aeration")){
  let cost = totalSqft * 0.04
  materialCost += cost
  addonCosts.aeration = cost
}

// Compost
if(addons.compost && !isIncluded("compost")){
  let cost = totalSqft * 0.10
  materialCost += cost
  addonCosts.compost = cost
}

// Bio/Hum Blend
if(addons.biohum && !isIncluded("biohum")){
  let cost = totalSqft * 0.12
  materialCost += cost
  addonCosts.biohum = cost
}

// Biochar
if(addons.biochar){
  let cost = totalSqft * 0.20
  materialCost += cost
  addonCosts.biochar = cost
}

// Humic
if(addons.humic){
  let cost = totalSqft * 0.01
  materialCost += cost
  addonCosts.humic = cost
}

// Grow System
if(addons.grow){

  let weeklyCost = (50 * 3) * houses
  let installCost = 0

  if(packageType === "standard"){
    installCost = houses <= 1 
      ? totalSqft * 0.05 
      : totalSqft * 0.03
  }

  let cost = weeklyCost + installCost
  materialCost += cost
  addonCosts.grow = cost
}

// Lime
if(addons.lime && !isIncluded("lime")){
  let cost = totalSqft * 0.004
  materialCost += cost
  addonCosts.lime = cost
}

// Sulfur
if(addons.sulfur && !isIncluded("sulfur")){
  let cost = totalSqft * 0.008
  materialCost += cost
  addonCosts.sulfur = cost
}

  // ==========================
  // OVERHEAD (AFTER MATERIAL)
  // ==========================

  let overheadCost = (materialCost + laborCost) * (overheadPct / 100)

  let totalCost = materialCost + laborCost + overheadCost

  // ==========================
  // PRICING
  // ==========================

  let margin

  if(targetMarginInput && targetMarginInput > 0){
    margin = targetMarginInput / 100
  } else {
    margin = 0.3
    if(pricingMode === "win") margin = 0.15
    if(pricingMode === "balanced") margin = 0.3
    if(pricingMode === "max") margin = 0.5
  }

  if(houses >= 10) margin -= 0.03
  if(houses >= 20) margin -= 0.05
  if(houses >= 50) margin -= 0.08

  if(margin < 0.1) margin = 0.1

 let strategy = document.getElementById("pricingStrategy")?.value || "normal"
let competitor = Number(document.getElementById("competitorPrice")?.value) || 0

if(margin >= 0.95){
  margin = 0.95
}

let pricing = getSmartPricing(
  totalCost,
  totalSqft,
  houses,
  pricingMode,
  competitor
)

let price = pricing.price
let profit = pricing.profit

// ==========================
// PRICING POWER MODE
// ==========================

if(strategy === "market"){
  let marketRate = 0.35 // $/sqft target
  let marketPrice = totalSqft * marketRate

  if(marketPrice > price){
    price = marketPrice
  }
}

if(strategy === "undercut" && competitor > 0){
  price = competitor * 0.97 // 3% undercut
}

if(strategy === "builder"){
  price *= 0.92 // aggressive builder pricing
}

// SAFETY FLOOR (never lose money)
if(price < totalCost * 1.1){
  price = totalCost * 1.1
}

// ✅ MINIMUM JOB PRICE
if(price < 1000){
  price = 1000
}

// recalc profit AFTER all adjustments
profit = price - totalCost

let usingFallback = usedFallback

  return {
    sqft,
    houses,
    totalSqft,
    cost: totalCost,
    price,
    profit,
    laborCost,
    overheadCost,
    totalHours,
    addonCosts,
    usingFallback
  }
}

//===========================
//==GET MATERIAL NEEDS
//===========================

function getMaterialNeeds(input, packageType, addons){

  let sqft = input.totalSqft || input.sqft || 0

  let needs = {}

  // =========================
  // BASE MATERIALS
  // =========================

needs.seed       = (sqft / 1000) * MATERIAL_RATES.seed.rate
needs.fertilizer = (sqft / 1000) * MATERIAL_RATES.fertilizer.rate
needs.mulch      = (sqft / 1000) * MATERIAL_RATES.mulch.rate
needs.tackifier  = (sqft / 1000) * MATERIAL_RATES.tackifier.rate

  // =========================
  // PREMIUM ADDITIONS
  // =========================

  if(packageType === "premium"){
  needs.compost = (sqft / 1000) * MATERIAL_RATES.compost.rate

    // Bio/Hum blend = split usage
    needs.biochar = (sqft / 1000) * (MATERIAL_RATES.biochar.rate * 0.5)
needs.humic   = (sqft / 1000) * (MATERIAL_RATES.humic.rate * 0.5)
  }

  // =========================
  // ADD-ONS
  // =========================

  addons = addons || {}

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

//=======================
//== SMART PRICING
//=======================

function getSmartPricing(totalCost, sqft, houses, pricingMode, competitor){

  let baseMargin = 0.3

  // Job size logic
  if(sqft < 3000) baseMargin = 0.4
  else if(sqft < 8000) baseMargin = 0.35
  else if(sqft < 20000) baseMargin = 0.3
  else baseMargin = 0.25

  // Win job mode
  if(pricingMode === "win"){
    baseMargin -= 0.1
  }

  // Multi-house efficiency (builder jobs)
  if(houses >= 10) baseMargin -= 0.03
  if(houses >= 20) baseMargin -= 0.05

  // Protect large jobs
  if(totalCost > 5000){
    baseMargin += 0.05
  }

  // Prevent stupid margins
  if(baseMargin < 0.1) baseMargin = 0.1
  if(baseMargin > 0.9) baseMargin = 0.9

  let price = totalCost / (1 - baseMargin)

  // Competitor logic
  if(competitor > 0){
    if(competitor > price){
      price = competitor * 0.98
    } else {
      price = Math.max(price, competitor * 0.95)
    }
  }

  // Safety floor (never lose money)
  if(price < totalCost * 1.1){
    price = totalCost * 1.1
  }

  let profit = price - totalCost

  return {
    price,
    profit,
    margin: price ? profit / price : 0
  }
}

//========================
//== TANK LOADS
//========================

function calculateTankLoads(r, needs){

  let tankSize =
    Number(document.getElementById("tankSize")?.value) || 500

  let coveragePerTank = tankSize * 10

  let sqftPerTank = coveragePerTank

  let totalSqft = r.totalSqft || 0

  let loads = sqftPerTank > 0
    ? totalSqft / sqftPerTank
    : 0

  return {
    tankSize,
    coveragePerTank,
    loads,
    perTank: {
     seed: loads ? needs.seed / loads : 0,

mulch: loads ? needs.mulch / loads : 0,

fertilizer: loads ? needs.fertilizer / loads : 0,

tackifier: loads ? needs.tackifier / loads : 0
    }
  }
}

//==================
//== DEAL SCORE
//==================

function calculateDealScore(r, comparison){

  let score = 100

  let margin = r.price ? (r.profit / r.price) * 100 : 0

  // =========================
  // MARGIN IMPACT
  // =========================

  if(margin < 15) score -= 40
  else if(margin < 25) score -= 20
  else if(margin > 40) score += 10

  // =========================
  // PROFIT SIZE
  // =========================

  if(r.profit < 200) score -= 25
  else if(r.profit > 1000) score += 10

  // =========================
  // INVENTORY SHORTAGES
  // =========================

  let shortages = Object.values(comparison).filter(i => i.status === "short")

  if(shortages.length > 0){
    score -= shortages.length * 5
  }

  // =========================
  // LABOR EFFICIENCY
  // =========================

  if(r.laborCost > r.cost * 0.5){
    score -= 15
  }

  // =========================
  // SCALE BONUS
  // =========================

  if(r.houses >= 10) score += 10
  if(r.houses >= 20) score += 10

  // =========================
  // MATERIAL IMPACT
  // =========================

  let materialCost = r.cost - r.laborCost - r.overheadCost
  let materialPerSqft = r.totalSqft ? materialCost / r.totalSqft : 0
let materialPercent = r.cost ? (materialCost / r.cost) * 100 : 0

  if(materialPerSqft > 0.35){
    score -= 10
  }

  if(materialPerSqft < 0.12){
    score -= 15
  }

  if(materialPerSqft >= 0.18 && materialPerSqft <= 0.30){
    score += 5
  }

// 🚨 materials dominating job
if(materialPercent > 60){
  score -= 10
}

  // =========================
  // FINAL CLAMP (ALWAYS LAST)
  // =========================

  if(score > 100) score = 100
  if(score < 0) score = 0

  return score
}

//===================
//== AI INSIGHTS
//===================

function generateAIInsights(r, comparison){

  let insights = []

  let margin = r.price ? (r.profit / r.price) * 100 : 0

  // =========================
  // PROFIT INSIGHTS
  // =========================

  if(margin < 20){
    insights.push({
      type: "danger",
      text: "Profit margin is critically low. Increase pricing or reduce costs."
    })
  }

  if(margin >= 20 && margin < 30){
    insights.push({
      type: "warning",
      text: "Margin is decent but could be improved. Consider premium upsell."
    })
  }

  if(margin > 40){
    insights.push({
      type: "success",
      text: "Strong profit margin. This is a high-quality job."
    })
  }

  // =========================
  // LABOR INTELLIGENCE
  // =========================

  if(r.laborCost > r.cost * 0.4){
    insights.push({
      type: "warning",
      text: "Labor cost is high. Increase crew efficiency or adjust pricing."
    })
  }

  // =========================
  // INVENTORY INTELLIGENCE
  // =========================

  let shortages = Object.values(comparison).filter(i => i.status === "short")

  if(shortages.length > 0){
    insights.push({
      type: "danger",
      text: `${shortages.length} material shortages detected. This job will require purchasing materials.`
    })
  }

  // =========================
  // SCALE INTELLIGENCE
  // =========================

  if(r.houses >= 10){
    insights.push({
      type: "success",
      text: "Builder scale detected. You can reduce pricing slightly and still profit."
    })
  }

  // =========================
  // PRICE POSITIONING
  // =========================

  let pricePerSqft = r.totalSqft ? r.price / r.totalSqft : 0

  if(pricePerSqft > 0.5){
    insights.push({
      type: "warning",
      text: "Price per sqft is high. Risk of losing competitive bids."
    })
  }

  if(pricePerSqft < 0.25){
    insights.push({
      type: "danger",
      text: "Price per sqft is very low. You may be underpricing."
    })
  }

// =========================
// MATERIAL INTELLIGENCE
// =========================

let materialCost = r.cost - r.laborCost - r.overheadCost
let materialPerSqft = r.totalSqft ? materialCost / r.totalSqft : 0
let materialPercent = r.cost ? (materialCost / r.cost) * 100 : 0

// 🚨 TOO EXPENSIVE MATERIALS
if(materialPerSqft > 0.35){
  insights.push({
    type: "warning",
    text: "Material cost per sqft is high. Check seed, mulch, or additive usage."
  })
}

// 🚨 TOO CHEAP (usually bad pricing)
if(materialPerSqft < 0.12){
  insights.push({
    type: "danger",
    text: "Material cost per sqft is very low. You may be underpricing or missing materials."
  })
}

// ⚠️ MATERIAL DOMINATING JOB
if(materialPercent > 60){
  insights.push({
    type: "warning",
    text: "Materials are a large portion of total cost. Verify mix and pricing strategy."
  })
}

// 💪 HEALTHY RANGE
if(materialPercent >= 30 && materialPercent <= 50){
  insights.push({
    type: "success",
    text: "Material cost is well balanced for this job."
  })
}

  return insights
}

//=====================
//BUILD SCHEDULE
//=====================

function buildSchedule(r){

  let schedule = []

  let packageType = document.getElementById("package")?.value || "standard"

  let addons = app.job.addons || {}

  // ✅ START DATE FROM UI

  let startInput = document.getElementById("projectStart")?.value

let currentDate

if(startInput){

  let [year, month, day] = startInput.split("-")

  currentDate = new Date(year, month - 1, day)

} else {

  currentDate = new Date()

}

  // ✅ TIMELINE SELECTION

  let timeline = app.timeline || "standard"

  let prepToSeedDays = 3

  let seedToFinalDays = 21

  if(timeline === "fast"){

    prepToSeedDays = 1

    seedToFinalDays = 14

  }

  if(timeline === "extended"){

    prepToSeedDays = 5

    seedToFinalDays = 30

  }

  function formatDate(date){

    return date.toLocaleDateString()

  }

  function addDays(date, days){

    let d = new Date(date)

    d.setDate(d.getDate() + days)

    return d

  }

  // ==========================

  // DAY 1 — PREP

  // ==========================

  let day1Tasks = []

  if(packageType === "premium" || addons.lime){

    day1Tasks.push("Apply Lime")

  }

  if(packageType === "premium" || addons.sulfur){

    day1Tasks.push("Apply Sulfur")

  }

  if(packageType === "premium" || addons.aeration){

    day1Tasks.push("Core Aeration")

  }

  if(packageType === "premium" || addons.compost){

    day1Tasks.push("Apply Compost")

  }

  schedule.push({

    day: 1,

   title:

  timeline === "fast"

    ? "Soil Preparation & Conditioning (Fast Track)"

    : timeline === "extended"

    ? "Soil Preparation & Conditioning (Extended Care)"

    : "Soil Preparation & Conditioning",

    date: formatDate(currentDate),

    tasks: day1Tasks

  })

  // ==========================

  // DAY 2 — SEEDING

  // ==========================

currentDate = addDays(currentDate, prepToSeedDays)

  let day2Tasks = ["Hydroseeding"]

  if(addons.grow){

    day2Tasks.push("Install Grow System")

  }

  schedule.push({

    day: 2,

   title:

  timeline === "fast"

    ? "Professional Hydroseeding Application (Fast Track)"

    : timeline === "extended"

    ? "Professional Hydroseeding Application (Extended Care)"

    : "Professional Hydroseeding Application",

    date: formatDate(currentDate),

    tasks: day2Tasks

  })

  // ==========================

  // DAY 3 — FINAL

  // ==========================

currentDate = addDays(currentDate, seedToFinalDays)

  let day3Tasks = ["Final Lawn Inspection"]

  if(addons.grow){

    day3Tasks.unshift("Remove Grow System")

  }

  schedule.push({

    day: 3,

  title:

  timeline === "fast"

    ? "Final Lawn Evaluation (Fast Track)"

    : timeline === "extended"

    ? "Final Lawn Evaluation(Extended Care)"

    : "Final Lawn Evaluation",

    date: formatDate(currentDate),

    tasks: day3Tasks

  })

  return schedule

}