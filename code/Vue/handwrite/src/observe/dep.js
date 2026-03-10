
// 
let id = 0

class Dep {
  constructor() {
    this.subs = []
    this.id = id++
  }

  depend () {
    Dep.target.addDep(this)
  }

  addSub (watcher) {
    this.subs.push(watcher)
  }

  notify () {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}

export default Dep