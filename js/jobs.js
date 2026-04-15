function saveJob(){

  let r = calculateJob()

  if(r.totalSqft <= 0){
    showToast("Enter sqft before saving", "error")
    return
  }

  let job = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    sqft: r.totalSqft,
    price: r.price,
    cost: r.cost,
    profit: r.profit,
    margin: r.price ? (r.profit / r.price) * 100 : 0
  }

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")
  history.unshift(job)
  localStorage.setItem("jobHistory", JSON.stringify(history))

  renderHistory()
  showToast("Job saved","success")
}

function deleteJob(index){
  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")
  history.splice(index, 1)
  localStorage.setItem("jobHistory", JSON.stringify(history))
  renderHistory()
}