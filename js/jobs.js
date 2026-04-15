function saveJob(){

  let r = calculateJob()

  if(r.totalSqft <= 0){
    showToast("Enter sqft first", "error")
    return
  }

  let job = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    sqft: r.totalSqft,
    price: r.price,
    cost: r.cost,
    profit: r.profit
  }

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")
  history.unshift(job)

  localStorage.setItem("jobHistory", JSON.stringify(history))

  renderHistory()
  showToast("Job saved", "success")
}

function deleteJob(index){
  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")
  history.splice(index, 1)
  localStorage.setItem("jobHistory", JSON.stringify(history))
  renderHistory()
}

function renderHistory(){
  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")
  let html = ""

  history.forEach((job, i) => {
    html += `
      <div class="history-card">
        <b>${job.sqft} sqft</b>
        <div>$${job.price.toFixed(2)}</div>
        <button onclick="deleteJob(${i})">Delete</button>
      </div>
    `
  })

  document.getElementById("jobHistory").innerHTML = html
}