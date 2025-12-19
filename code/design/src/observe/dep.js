let id = 0

class Dep {
  constructor() {
    this.id = id++
    this.subs = []
  }

  depend() {
     Dep.targer.addDep(this)
  }
}