//=======================
//=== SAVE JOB
//=======================
function saveJob(){

  let r = calculateJob()

  if(r.totalSqft <= 0){
    if(typeof showToast === "function"){
      showToast("Enter sqft before saving", "error")
    }
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

  // ======================
  // DEDUCT INVENTORY
  // ======================

  let needs = getMaterialNeeds(r)
  let inventory = window.inventory || {}

  Object.keys(needs).forEach(type => {

    let remaining = needs[type] || 0

    Object.values(inventory).forEach(section => {
      (section || []).forEach(item => {

        if(item.type === type && remaining > 0){

          let used = Math.min(item.qty || 0, remaining)

          item.qty -= used
          remaining -= used
        }

      })
    })
  })

  // save updated inventory
  localStorage.setItem("inventory_full", JSON.stringify(inventory))

  // refresh UI safely
  if(typeof renderHistory === "function"){
    renderHistory()
  }

  if(typeof render === "function"){
    render()
  }

  if(typeof showToast === "function"){
    showToast("Job saved + inventory updated","success")
  }
}

//===========================
//== DELETE JOB
//===========================
function deleteJob(index){

  let history = JSON.parse(localStorage.getItem("jobHistory") || "[]")

  if(!confirm("Delete this job?")) return

  history.splice(index, 1)
  localStorage.setItem("jobHistory", JSON.stringify(history))

  if(typeof renderHistory === "function"){
    renderHistory()
  }

  if(typeof showToast === "function"){
    showToast("Job deleted", "error")
  }
}