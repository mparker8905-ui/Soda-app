function saveInventory(){

  let data = []

  document.querySelectorAll(".material-row").forEach(row=>{

    let inputs = row.querySelectorAll("input")

    data.push({

      name:inputs[0].value,

      cost:Number(inputs[1].value)||0,

      qty:Number(inputs[2].value)||0

    })

  })

  localStorage.setItem("inventory", JSON.stringify(data))

  alert("Saved")

}

function loadInventory(){

  let data = JSON.parse(localStorage.getItem("inventory")||"[]")

  let container = document.getElementById("inventoryList")

  if(!container) return

  container.innerHTML = data.map(i=>`

    <div class="card">

      ${i.name} — ${i.qty} units ($${i.cost})

    </div>

  `).join("")

}

window.onload = loadInventory