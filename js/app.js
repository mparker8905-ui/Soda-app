// app.js

window.app = window.app || {}

app.job = {

  addons: {

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

app.timeline = "standard"


// INIT

document.addEventListener("DOMContentLoaded", () => {

  loadInventory()

  renderHistory()

  render()

})

// autosave inventory

let saveTimeout

document.addEventListener("input", (e) => {

  if(e.target.closest(".material-row")){

    clearTimeout(saveTimeout)

    saveTimeout = setTimeout(() => {

      saveInventory()

    }, 300)

  }

})