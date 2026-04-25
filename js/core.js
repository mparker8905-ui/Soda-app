const MATERIALS = {

  seed:{rate:5,cost:3},

  fertilizer:{rate:4,cost:1.5},

  mulch:{rate:70,cost:0.35},

  tackifier:{rate:3,cost:3}

}

function calcMaterials(sqft){

  let needs = {}

  Object.keys(MATERIALS).forEach(k=>{

    needs[k] = (sqft/1000)*MATERIALS[k].rate

  })

  return needs

}

function calcCost(needs){

  let total = 0

  Object.keys(needs).forEach(k=>{

    total += needs[k]*MATERIALS[k].cost

  })

  return total

}

function calcPrice(cost, sqft){

  let margin = sqft < 5000 ? 0.4 : 0.3

  let price = cost/(1-margin)

  if(price < cost*1.1) price = cost*1.1

  if(price < 1000) price = 1000

  return price

}

function calculateJob(){

  let sqft = Number(document.getElementById("sqft")?.value) || 0

  let houses = Number(document.getElementById("houses")?.value) || 1

  let totalSqft = sqft * houses

  // MATERIAL CALC (keep your system)

  let needs = calcMaterials ? calcMaterials(totalSqft) : {}

  let cost = 0

  if (calcCost && needs) {

    cost = calcCost(needs)

  } else {

    // fallback if inventory system not loaded

    cost = Number(document.getElementById("cost")?.value) || 0

  }

  // minimum job cost

  if(cost < 500) cost = 500

  // ✅ NEW SMART PRICING

  let price = typeof calcSmartPrice === "function"

    ? calcSmartPrice(cost)

    : calcPrice(cost, totalSqft)

  return {

    sqft,

    houses,

    totalSqft,

    needs,

    cost,

    price,

    profit: price - cost

  }

}