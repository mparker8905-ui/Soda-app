//===========================
//==== GLOBAL STATE
//===========================
let app = {
  job:{
    addons:{
      aeration:false,
      compost:false,
      biohum:false,
      biochar:false,
      humic:false,
      grow:false,
      lime:false,
      sulfur:false
    }
  }
}

//===============================
//==== CONSTANTS
//===============================
const COSTS = {
  seed: 80,
  fertilizer: 40,
  mulch: 35,
  tackifier: 25,
  compost: 60,
  biohum: 25,
  lime: 15,
  sulfur: 20,
  biochar: 30,
  humic: 25,
  grow: 50
}

const MATERIAL_RATES = {
  seed:       { rate: 5, unit: "lbs" },
  fertilizer: { rate: 4, unit: "lbs" },
  mulch:      { rate: 50, unit: "lbs" },
  tackifier:  { rate: 3, unit: "lbs" },
  compost:    { rate: 0.5, unit: "yd3" },
  biochar:    { rate: 10, unit: "lbs" },
  humic:      { rate: 1, unit: "lbs" },
  lime:       { rate: 4, unit: "lbs" },
  sulfur:     { rate: 8, unit: "lbs" },
  sprinklers: { rate: 1, unit: "units" },
  timers:     { rate: 1, unit: "units" }
}

const MATERIAL_LABELS = {
  seed: "Seed",
  fertilizer: "Fertilizer",
  mulch: "Mulch",
  tackifier: "Tackifier",
  compost: "Compost",
  biochar: "Biochar",
  humic: "Humic Acid",
  lime: "Lime",
  sulfur: "Sulfur",
  sprinklers: "Sprinklers",
  timers: "Sprinkler Timers"
}