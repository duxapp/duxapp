export const create = option => new Animation(option)

class Animation {

  constructor(option = {}) {
    if (!option.duration) {
      option.duration = 400
    }
    if (!option.timingFunction) {
      option.timingFunction = 'linear'
    }
    if (!option.delay) {
      option.delay = 0
    }
    if (!option.transformOrigin) {
      option.transformOrigin = '50% 50% 0'
    }
    this.defaultOption = option
  }

  result = []

  current = {}

  export() {
    const res = this.result
    this.result = []
    return res
  }

  step(option) {
    if (Object.keys(this.current).length) {
      this.result.push({
        option: {
          ...this.defaultOption,
          ...option
        },
        action: this.current
      })
      this.current = {}
    }
    return this
  }

  matrix() {
    console.warn('APP端暂不支持matrix，请使用其他方法')
  }

  matrix3d() {
    console.warn('APP端暂不支持matrix3d，请使用其他方法')
  }

  set(name, value) {
    this.current[name] = value
    return this
  }

  translate(x, y) {
    this.translateX(x)
    return this.translateY(y)
  }

  translate3D(x, y, z) {
    this.translateX(x)
    this.translateY(y)
    return this.translateZ(z)
  }

  translateX(val) {
    return this.set('translateX', val)
  }

  translateY(val) {
    return this.set('translateY', val)
  }

  translateZ(val) {
    return this.set('translateZ', val)
  }

  scale(x, y = x) {
    this.scaleX(x)
    return this.scaleY(y)
  }

  scale3D(x, y, z) {
    this.scaleX(x)
    this.scaleY(y)
    return this.scaleZ(z)
  }

  scaleX(val) {
    return this.set('scaleX', val)
  }

  scaleY(val) {
    return this.set('scaleY', val)
  }

  scaleZ(val) {
    return this.set('scaleZ', val)
  }

  rotate(val) {
    return this.set('rotate', val)
  }

  rotate3D(x, y, z, a) {
    if (x) {
      return this.rotateX(a)
    }
    if (y) {
      return this.rotateY(a)
    }
    if (z) {
      return this.rotateZ(a)
    }
  }

  rotateX(val) {
    return this.set('rotateX', val)
  }

  rotateY(val) {
    return this.set('rotateY', val)
  }

  rotateZ(val) {
    return this.set('rotateZ', val)
  }

  skew(x, y) {
    this.skewX(x)
    return this.skewY(y)
  }

  skewX(val) {
    return this.set('skewX', val)
  }

  skewY(val) {
    return this.set('skewY', val)
  }

  width(val) {
    return this.set('width', val)
  }

  height(val) {
    return this.set('height', val)
  }

  backgroundColor(val) {
    return this.set('backgroundColor', val)
  }

  opacity(val) {
    return this.set('opacity', val)
  }

  left(val) {
    return this.set('left', val)
  }

  right(val) {
    return this.set('right', val)
  }

  top(val) {
    return this.set('top', val)
  }

  bottom(val) {
    return this.set('bottom', val)
  }
}
