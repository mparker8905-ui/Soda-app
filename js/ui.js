function showToast(message, type="success"){
  let toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerText = message

  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}

function render(){

  let r = calculateJob()
  let needs = getMaterialNeeds(r)
  let inventory = getInventoryTotals()
  let comparison = compareInventory(needs, inventory)

  let materialHTML = "<b>Materials</b><br>"

  Object.keys(comparison).forEach(k => {
    let item = comparison[k]

    materialHTML += `
      ${k}: Need ${item.required.toFixed(1)} |
      Have ${item.available.toFixed(1)}
      (${item.status})
      <br>
    `
  })

  document.getElementById("results").innerHTML = `
    <div>Total Sqft: ${r.totalSqft}</div>
    <div>Price: $${r.price.toFixed(2)}</div>
    <div>Profit: $${r.profit.toFixed(2)}</div>
    ${materialHTML}
  `
}