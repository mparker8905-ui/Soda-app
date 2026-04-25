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

  let sqft = Number(document.getElementById("sqft")?.value)||0

  let houses = Number(document.getElementById("houses")?.value)||1

  let totalSqft = sqft*houses

  let needs = calcMaterials(totalSqft)

  let cost = calcCost(needs)

  if(cost < 500) cost = 500

  let price = calcSmartPrice(cost)

  return {

    totalSqft,

    cost,

    price,

    profit:price-cost

  }

}