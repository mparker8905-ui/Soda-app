function generateInsights(job){

  let insights = []

  if(job.profit < 300){
    insights.push("⚠️ Low profit job — consider raising price")
  }

  if(job.totalSqft > 15000){
    insights.push("🚛 Large job — plan multiple tank loads")
  }

  if(job.cost > 3000){
    insights.push("💰 High material cost — verify pricing")
  }

  if(job.price > 5000){
    insights.push("📈 High ticket — push premium positioning")
  }

  return insights
}

function renderInsights(){

  let container = document.getElementById("insights")
  if(!container) return

  let job = calculateJob()
  let insights = generateInsights(job)

  container.innerHTML = insights.map(i=>`
    <div class="card">${i}</div>
  `).join("")
}