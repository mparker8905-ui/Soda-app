const TANK_CAPACITY = 1000 // sqft per tank (adjust later)

function calculateTanks(totalSqft){
  return Math.ceil(totalSqft / TANK_CAPACITY)
}

function renderTanks(){

  let el = document.getElementById("tanks")
  if(!el) return

  let job = calculateJob()
  let tanks = calculateTanks(job.totalSqft)

  el.innerHTML = `
    <div class="card">
      Tanks Needed: ${tanks}
    </div>
  `
}