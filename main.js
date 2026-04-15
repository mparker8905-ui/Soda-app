alert("JS LOADED")

//===========================
// INIT APP
//===========================
window.onload = () => {

  try{
    if(typeof loadInventory === "function"){
      loadInventory()
    }

    if(typeof renderHistory === "function"){
      renderHistory()
    }

    if(typeof render === "function"){
      render()
    }

  } catch(e){
    console.error("App init failed", e)
  }

}

//===========================
// LIVE INPUT UPDATES
//===========================
document.addEventListener("input", (e) => {

  // 🔥 AUTO SAVE INVENTORY CHANGES
  if(e.target.closest(".material-row")){
    if(typeof saveInventory === "function"){
      saveInventory()
    }
  }

  // 🔥 ALWAYS RECALCULATE UI
  if(typeof render === "function"){
    render()
  }

})