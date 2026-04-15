//============================
// CLIENT VIEW
//============================
function openClientView(){

  let r = calculateJob()
  let materialNeeds = getMaterialNeeds(r)

  let html = ""

  Object.keys(materialNeeds).forEach(k => {
    let unit = MATERIAL_RATES[k]?.unit || ""
    html += `<div>${k}: ${materialNeeds[k].toFixed(1)} ${unit}</div>`
  })

  let win = window.open("", "_blank")

  if(!win){
    alert("Popup blocked")
    return
  }

  win.document.write(`
    <html>
    <body style="background:black;color:gold;font-family:Arial;padding:20px;">
      <h2>Client Quote</h2>
      <div>Total Sqft: ${r.totalSqft}</div>
      <div>Price: $${r.price.toFixed(2)}</div>
      <h3>Materials</h3>
      ${html}
    </body>
    </html>
  `)

  win.document.close()
}

//============================
// SEND PROPOSAL
//============================
function sendProposal(){

  let r = calculateJob()

  let win = window.open("", "_blank")

  if(!win){
    alert("Popup blocked")
    return
  }

  win.document.write(`
    <html>
    <body style="font-family:Arial;padding:40px;">
      <h1>Proposal</h1>
      <div>Total Sqft: ${r.totalSqft}</div>
      <div>Price: $${r.price.toFixed(2)}</div>
      <button onclick="window.print()">Print</button>
    </body>
    </html>
  `)

  win.document.close()
}