function showToast(message, type = "success"){
  let toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerText = message

  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

function render(){

  let r = calculateJob()
  let needs = getMaterialNeeds(r)
  let inventoryTotals = getInventoryTotals()
  let comparison = compareInventory(needs, inventoryTotals)

  let materialHTML = "<b>MATERIAL REQUIREMENTS</b><br>"

  Object.keys(comparison).forEach(k => {
    let item = comparison[k]
    let color = item.status === "short" ? "red" : "lime"

    materialHTML += `
      ${k.toUpperCase()}:
      Need ${item.required.toFixed(1)} |
      Have ${item.available.toFixed(1)}
      <span style="color:${color}">
        ${item.status === "short" ? "BUY" : "OK"}
      </span><br>
    `
  })

  document.getElementById("results").innerHTML =
    `<div>Total Sqft: ${r.totalSqft}</div>
     <div>Price: $${r.price.toFixed(2)}</div>
     <div>Profit: $${r.profit.toFixed(2)}</div>
     ${materialHTML}`
}

function renderHistory(){

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")
  let html = ""

  history.forEach((job, index) => {
    html += `
      <div class="history-card">
        <b>${job.sqft} sqft</b>
        <div>$${job.price.toFixed(2)}</div>
        <button onclick="deleteJob(${index})">Delete</button>
      </div>
    `
  })

  document.getElementById("jobHistory").innerHTML = html
}