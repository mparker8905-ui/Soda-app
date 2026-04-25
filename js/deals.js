function scoreDeal(job){

  let score = 0

  // profit weight
  if(job.profit > 2000) score += 40
  else if(job.profit > 1000) score += 25
  else score += 10

  // size weight
  if(job.totalSqft > 10000) score += 30
  else score += 15

  // efficiency
  let ratio = job.price / job.cost
  if(ratio > 2) score += 30
  else if(ratio > 1.5) score += 20

  return score
}

function renderDealScore(){

  let el = document.getElementById("dealScore")
  if(!el) return

  let job = calculateJob()
  let score = scoreDeal(job)

  el.innerHTML = `
    <div class="card">
      Deal Score: ${score}/100
    </div>
  `
}