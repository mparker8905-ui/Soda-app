const PRICING_MODES = {
  standard: 0.35,
  aggressive: 0.25,
  premium: 0.5
}

function getMargin(){
  let mode = document.getElementById("pricingMode")?.value || "standard"
  return PRICING_MODES[mode]
}

function calcSmartPrice(cost){
  let margin = getMargin()
  let price = cost/(1-margin)

  if(price < cost*1.1) price = cost*1.1
  if(price < 1000) price = 1000

  return price
}