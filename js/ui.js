function render(){

  if(!document.getElementById("results")) return

  let r = calculateJob()

  document.getElementById("results").innerHTML = `

    <div>Total Sqft: ${r.totalSqft}</div>

    <div>Cost: $${r.cost.toFixed(2)}</div>

    <div>Price: $${r.price.toFixed(2)}</div>

    <div>Profit: $${r.profit.toFixed(2)}</div>

  `

  renderInsights()

  renderTanks()

  renderDealScore()

}

document.addEventListener("input", render)

window.onload = render