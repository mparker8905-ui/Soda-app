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