export const loadFont = (name, url) => {
  const font = new window.FontFace(name, `url(${url})`)
  document.fonts.add(font)
  return font.load()
}

export const loadLocalFont = () => {

}
