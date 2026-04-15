// ================================
// INVENTORY STATE
// ================================

window.inventory = {}

// ================================
// LOAD INVENTORY
// ================================

function loadInventory() {
  try {
    const data = JSON.parse(localStorage.getItem("inventory_full") || "{}")
    window.inventory = data
    console.log("Inventory loaded", window.inventory)
  } catch (e) {
    console.error("Inventory load failed", e)
    window.inventory = {}
  }
}

// ================================
// SAVE INVENTORY
// ================================

function saveInventoryToStorage() {
  localStorage.setItem("inventory_full", JSON.stringify(window.inventory))
}

// ================================
// GET TOTALS
// ================================

function getInventoryTotals() {
  let totals = {}

  Object.values(window.inventory).forEach(section => {
    section.forEach(item => {
      let type = item.type
      let qty = item.qty || 0
      totals[type] = (totals[type] || 0) + qty
    })
  })

  return totals
}

// ================================
// COMPARE INVENTORY
// ================================

function compareInventory(needs, inventoryTotals) {
  let results = {}

  for (let key in needs) {
    let required = needs[key]
    let available = inventoryTotals[key] || 0
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