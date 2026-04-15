window.onload = () => {
  loadInventory()
  renderHistory()
  render()
}

document.addEventListener("input", (e) => {

  if(e.target.closest(".material-row")){
    saveInventory()
  }

  render()
})