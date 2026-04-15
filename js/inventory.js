function saveInventory(){

  function getSection(id){
    let rows = document.querySelectorAll(`#${id} .material-row`)
    let data = []

    rows.forEach(row => {
      let select = row.querySelector("select")
      let inputs = row.querySelectorAll("input")

      data.push({
        type: select.value,
        name: inputs[0].value,
        cost: Number(inputs[1].value) || 0,
        qty: Number(inputs[2].value) || 0
      })
    })

    return data
  }

  let inventory = {
    standard: getSection("standardMaterials"),
    premium: getSection("premiumMaterials"),
    addons: getSection("addonMaterials")
  }

  localStorage.setItem("inventory_full", JSON.stringify(inventory))
}

function loadInventory(){
  let inventory = JSON.parse(localStorage.getItem("inventory_full") || "{}")

  function loadSection(id, items){
    let container = document.getElementById(id)
    container.innerHTML = ""

    items.forEach(item => {
      addMaterialRow(id.replace("Materials",""))
    })
  }

  loadSection("standardMaterials", inventory.standard || [])
  loadSection("premiumMaterials", inventory.premium || [])
  loadSection("addonMaterials", inventory.addons || [])
}

function getInventoryTotals(){
  let inventory = JSON.parse(localStorage.getItem("inventory_full") || "{}")
  let totals = {}

  Object.values(inventory).forEach(section => {
    (section || []).forEach(item => {
      totals[item.type] = (totals[item.type] || 0) + item.qty
    })
  })

  return totals
}

function compareInventory(needs, inventory){
  let results = {}

  for(let key in needs){
    let required = needs[key]
    let available = inventory[key] || 0

    results[key] = {
      required,
      available,
      shortage: Math.max(required - available, 0),
      status: required > available ? "short" : "ok"
    }
  }

  return results
}