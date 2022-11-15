export default (text, style = {}) => {
  const el = document.createElement('div')
  el.style.whiteSpace = 'nowrap'
  el.style.width = 'auto'
  el.style.height = 'auto'
  el.style.position = 'absolute'
  Object.assign(el.style, style)
  el.innerHTML = text
  document.body.appendChild(el)
  const width = Math.ceil(el.clientWidth)
  document.body.removeChild(el)
  return width + 1 // add 1 because reasons
}
