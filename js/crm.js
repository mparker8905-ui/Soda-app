function createLead(){

  let name = document.getElementById("customer").value

  if(!name) return alert("Enter name")

  let list = JSON.parse(localStorage.getItem("leads")||"[]")

  list.push({

    id:Date.now(),

    name

  })

  localStorage.setItem("leads", JSON.stringify(list))

  renderLeads()

}

function renderLeads(){

  let list = JSON.parse(localStorage.getItem("leads")||"[]")

  let container = document.getElementById("leads")

  if(!container) return

  container.innerHTML = list.map(l=>`

    <div class="card">${l.name}</div>

  `).join("")

}

window.onload = renderLeads