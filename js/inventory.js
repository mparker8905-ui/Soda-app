//====================
//==SAVE INVENTORY 
//====================

function saveInventory(){

  function getSection(id){
    let container = document.getElementById(id)
    let rows = container.querySelectorAll(".material-row")

    let data = []

    rows.forEach(row => {
      let select = row.querySelector("select")
      let inputs = row.querySelectorAll("input")

      data.push({
        type: select?.value || "",
        name: inputs[0]?.value || "",
        cost: parseFloat(inputs[1]?.value) || 0,
        qty: parseFloat(inputs[2]?.value) || 0
      })
    })

    return data
  }

  let inventory = {
    standard: getSection("standardMaterials"),
    premium: getSection("premiumMaterials"),
    addons: getSection("addonMaterials")
  }

  // âœ… SAVE FULL DATA

localStorage.setItem("inventory_full", JSON.stringify(inventory))

 // silent autosave (no toast)

inventoryCache = null

}

//==================
//==LOAD INVENTORY
//==================

function loadInventory(){

  let inventory = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  function loadSection(id, items){

    let container = document.getElementById(id)
    container.innerHTML = ""

    items.forEach(item => {

      let row = document.createElement("div")
      row.className = "material-row"

      row.innerHTML = `
        <div class="row-top">
          <select class="mat-select" onchange="updateUnitLabel(this)">
            <option value="seed" ${item.type==="seed"?"selected":""}>Seed</option>
            <option value="fertilizer" ${item.type==="fertilizer"?"selected":""}>Fertilizer</option>
            <option value="mulch" ${item.type==="mulch"?"selected":""}>Mulch</option>
            <option value="tackifier" ${item.type==="tackifier"?"selected":""}>Tackifier</option>
            <option value="compost" ${item.type==="compost"?"selected":""}>Compost</option>
            <option value="biochar" ${item.type==="biochar"?"selected":""}>Biochar</option>
            <option value="humic" ${item.type==="humic"?"selected":""}>Humic Acid</option>
            <option value="lime" ${item.type==="lime"?"selected":""}>Lime</option>
            <option value="sulfur" ${item.type==="sulfur"?"selected":""}>Sulfur</option>
            <option value="sprinklers" ${item.type==="sprinklers"?"selected":""}>Sprinklers</option>
            <option value="timers" ${item.type==="timers"?"selected":""}>Sprinkler Timers</option>
          </select>

          <button class="delete-btn" onclick="deleteRow(this)">🗑️</button>
        </div>

        <label class="mat-label">Material Name</label>
        <input class="mat-input" value="${item.name}">

        <label class="mat-label">Cost per Unit ($)</label>
        <input class="mat-input" type="number" value="${item.cost}">

        <label class="mat-label unit-label">Quantity Available</label>
        <input class="mat-input" type="number" value="${item.qty}">
      `

      container.appendChild(row)

      updateUnitLabel(row.querySelector("select"))
    })
  }

  loadSection("standardMaterials", inventory.standard || [])
  loadSection("premiumMaterials", inventory.premium || [])
  loadSection("addonMaterials", inventory.addons || [])
}

//=======================
//=== GET INVENTORY CACHE
//=======================

function getInventoryCache(forceRefresh = false){

  if(forceRefresh || !inventoryCache){

    inventoryCache = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  }

  return inventoryCache

}

let shownToasts = new Set()

//======================
//== GET INVENTORY TOTALS
//======================

let activeProposalId = null

function getInventoryTotals(){

  let inventory = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  let totals = {}

  Object.values(inventory).forEach(section => {
    section.forEach(item => {

      let type = item.type
      let qty = item.qty || 0

      totals[type] = (totals[type] || 0) + qty
    })
  })

  return totals
}

//======================
//== COMPARE INVENTORY
//======================

function compareInventory(needs, inventory){

  let results = {}

  for(let key in needs){

    let required = needs[key]
    let available = inventory[key] || 0
    let shortage = required - available

    results[key] = {
      required,
      available,
      shortage: shortage > 0 ? shortage : 0,
      status: shortage > 0 ? "short" : "ok"
    }
  }

  return results
}

//=================
// ADD MATERIAL ROW
//=================

function addMaterialRow(type){

  let container

  if(type === "standard"){
    container = document.getElementById("standardMaterials")
  }

  if(type === "premium"){
    container = document.getElementById("premiumMaterials")
  }

  if(type === "addons"){
    container = document.getElementById("addonMaterials")
  }

  let row = document.createElement("div")
  row.className = "material-row"

  row.innerHTML = `
    <div class="row-top">
      <select class="mat-select" onchange="updateUnitLabel(this)">
        <option value="seed">Seed</option>
        <option value="fertilizer">Fertilizer</option>
        <option value="mulch">Mulch</option>
        <option value="tackifier">Tackifier</option>
        <option value="compost">Compost</option>
        <option value="biochar">Biochar</option>
        <option value="humic">Humic Acid</option>
        <option value="lime">Lime</option>
        <option value="sulfur">Sulfur</option>
        <option value="sprinklers">Sprinklers</option>
        <option value="timers">Sprinkler Timers</option>
      </select>

      <button class="delete-btn" onclick="deleteRow(this)">🗑️</button>
    </div>

    <label class="mat-label">Material Name</label>
    <input class="mat-input" placeholder="e.g. Ryegrass Seed">

    <label class="mat-label">Cost per Unit ($)</label>
    <input class="mat-input" type="number">

    <label class="mat-label unit-label">Quantity Available</label>
    <input class="mat-input" type="number">
  `

  container.appendChild(row)

  // âœ… FIX: NOW it's in correct scope
  updateUnitLabel(row.querySelector(".mat-select"))
}

//==================
// GET INVENTORY COST
//==================

function getInventoryCost(){

  let saved = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  function sum(section){
    let total = 0
    ;(section || []).forEach(item => {
      total += (item.cost || 0) * (item.qty || 0)
    })
    return total
  }

  let standard = sum(saved.standard)
  let premium = sum(saved.premium)
  let addons = sum(saved.addons)

  return {
    standard,
    premium,
    addons,
    total: standard + premium + addons
  }
}

//====================
//=== DELETE ROW
//====================

function deleteRow(btn){
  let row = btn.closest(".material-row")
  if(row){
    row.remove()
  }
}

//=========================
//===USE INVENTORY FOR JOB
//=========================

function useInventoryForJob(){

  if(!confirm("Use inventory for this job?")) return

  let r = calculateJob()
 let needs = getMaterialNeeds(

  { totalSqft: r.totalSqft },

  document.getElementById("package")?.value || "standard",

  app.job.addons

)

  let full = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  function deduct(section){

    (section || []).forEach(item => {

      let type = item.type
      let qty = Number(item.qty) || 0

      if(needs[type] !== undefined){

        let used = Math.min(qty, needs[type])

        item.qty -= used
        needs[type] -= used
      }
    })
  }

  deduct(full.standard)
  deduct(full.premium)
  deduct(full.addons)

  localStorage.setItem("inventory_full", JSON.stringify(full))

  loadInventory()
  render()

  showToast("Inventory applied to job", "success")
}

//================
//== FIX INVENTORY
//================

window.fixInventory = function(type, amount){

  let container

  if(type === "seed" || type === "fertilizer" || type === "mulch" || type === "tackifier"){
    container = document.getElementById("standardMaterials")
  } else if(type === "compost" || type === "biochar" || type === "humic"){
    container = document.getElementById("premiumMaterials")
  } else {
    container = document.getElementById("addonMaterials")
  }

  if(!container) return

  let rows = container.querySelectorAll(".material-row")
  let found = false

  // ðŸ” CHECK EXISTING ROWS
  rows.forEach(row => {

    let select = row.querySelector("select")
    let inputs = row.querySelectorAll("input")

    if(select && select.value === type){

      let currentQty = Number(inputs[2]?.value) || 0
      inputs[2].value = Math.ceil(currentQty + amount)
      showToast(`${MATERIAL_LABELS[type]} +${Math.ceil(amount)} added`)
      found = true
    }

  })

  // âž• IF NOT FOUND â†’ CREATE NEW ROW
  if(!found){

    let row = document.createElement("div")
    row.className = "material-row"

    row.innerHTML = `
      <div class="row-top">
        <select class="mat-select">
          <option value="seed" ${type==="seed"?"selected":""}>Seed</option>
          <option value="fertilizer" ${type==="fertilizer"?"selected":""}>Fertilizer</option>
          <option value="mulch" ${type==="mulch"?"selected":""}>Mulch</option>
          <option value="tackifier" ${type==="tackifier"?"selected":""}>Tackifier</option>
          <option value="compost" ${type==="compost"?"selected":""}>Compost</option>
          <option value="biochar" ${type==="biochar"?"selected":""}>Biochar</option>
          <option value="humic" ${type==="humic"?"selected":""}>Humic Acid</option>
          <option value="lime" ${type==="lime"?"selected":""}>Lime</option>
          <option value="sulfur" ${type==="sulfur"?"selected":""}>Sulfur</option>
          <option value="sprinklers" ${type==="sprinklers"?"selected":""}>Sprinklers</option>
          <option value="timers" ${type==="timers"?"selected":""}>Sprinkler Timers</option>
        </select>

        <button class="delete-btn" onclick="deleteRow(this)">🗑️</button>
      </div>

      <label class="mat-label">Material Name</label>
      <input class="mat-input" value="${MATERIAL_LABELS[type] || type}">

      <label class="mat-label">Cost per Unit ($)</label>
      <input class="mat-input" type="number" value="0">

      <label class="mat-label unit-label">Quantity Available</label>
      <input class="mat-input" type="number" value="${Math.ceil(amount)}">
    `

    container.appendChild(row)
   let label = MATERIAL_LABELS[type] || type

showToast(`${label} +${Math.ceil(amount)} added`)

  // 💾SAVE + REFRESH
  saveInventory()
  loadInventory()

  setTimeout(() => {
    render()
  }, 50)
}