//

function Model(obj) {
  this.title = 'title 1111111'

  const key = 'title'
  Object.defineProperties(obj, key, {
    get() {
      //
    },
    set() {
      //
    },
  })
}

function Controller(model) {
  const that = this
  this.model = model

  this.getModelByKey = function (key) {
    return that.model[key]
  }

  this.handleEvent = function (e) {
    e.stopPropagation()
    switch (e.type) {
      case 'click':
        clickHandler(e.target)
        break
      default:
        console.log(e.target)
    }
  }
  function clickHandler(target) {
    that.model.title = 'world'
    target.innerText = that.getModelByKey('title')
  }
}

function Views(controller) {
  this.controller = controller

  this.demobuttton = document.getElementById('demobutton')
  this.demobuttton.innerText = controller.getModelByKey('title')
  this.demobuttton.addEventListener('click', controller)
}

const mode = new Model()
const control = new Controller(mode)
