window.onload = () => {
  loadInventory()   
  render()
  renderHistory()
}

document.addEventListener("input", () => {
  render()
})