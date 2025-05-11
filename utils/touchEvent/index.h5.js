(function () {
  let isTouch = false
  let touchId = null


  function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

    return mobileRegex.test(userAgent)
  }

  function createTouch(evt, target) {
    return new Touch({
      identifier: touchId,
      target: target,
      clientX: evt.clientX,
      clientY: evt.clientY,
      pageX: evt.pageX,
      pageY: evt.pageY,
      screenX: evt.screenX,
      screenY: evt.screenY,
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 0,
      force: 1,
    })
  }

  function dispatchTouchEvent(evt, eventType) {
    if (['input', 'textarea'].includes(evt.target.tagName.toLowerCase())) {
      return
    }

    evt.preventDefault()
    const touch = createTouch(evt, evt.target)
    const touchEvent = new TouchEvent(eventType, {
      bubbles: true,
      cancelable: true,
      view: window,
      touches: eventType !== 'touchend' ? [touch] : [],
      targetTouches: eventType !== 'touchend' ? [touch] : [],
      changedTouches: [touch],
    })
    evt.target.dispatchEvent(touchEvent)
  }

  function handleMouseEvent(evt) {

    switch (evt.type) {
      case 'mousedown':
        isTouch = true
        touchId = Date.now()
        dispatchTouchEvent(evt, 'touchstart')
        break
      case 'mousemove':
        if (isTouch) {
          dispatchTouchEvent(evt, 'touchmove')
        }
        break
      case 'mouseup':
        if (isTouch) {
          dispatchTouchEvent(evt, 'touchend')
          isTouch = false
          touchId = null
        }
        break
    }
  }

  function attachEventListeners() {
    const appElement = document.getElementById('app')
    if (appElement) {
      document.addEventListener('mousedown', handleMouseEvent, true)
      document.addEventListener('mousemove', handleMouseEvent, true)
      document.addEventListener('mouseup', handleMouseEvent, true)
    } else {
      console.warn('未找到 APP 节点，无法转发鼠标事件')
    }
  }

  // 在 DOMContentLoaded 事件之后尝试附加事件监听器
  !isMobile() && document.addEventListener('DOMContentLoaded', attachEventListeners)
})()
