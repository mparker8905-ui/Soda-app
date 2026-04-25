function saveSchedule(){

  let date = document.getElementById("jobDate").value
  if(!date) return alert("Pick a date")

  let jobs = JSON.parse(localStorage.getItem("schedule")||"[]")

  jobs.push({
    id:Date.now(),
    date
  })

  localStorage.setItem("schedule", JSON.stringify(jobs))

  renderSchedule()
}

function renderSchedule(){

  let list = JSON.parse(localStorage.getItem("schedule")||"[]")

  let el = document.getElementById("scheduleList")
  if(!el) return

  el.innerHTML = list.map(j=>`
    <div class="card">${j.date}</div>
  `).join("")
}

window.onload = renderSchedule