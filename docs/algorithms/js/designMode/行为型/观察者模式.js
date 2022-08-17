class Subject {
	constructor() {
		this.state = 0
		this.observers = []
	}

	getState() {
		return this.state
	}

	setState(state) {
		this.state = state
		this.notifyAllObservers()
	}

	notifyAllObservers() {
		this.observers.forEach(observer => {
			console.log('observer', observer)
			observer.update()
		})
	}

	attach(observer) {
		this.observers.push(observer)
	}
}


class Observer {
	constructor(name, subject) {
		this.name = name
		this.subject = subject
		console.log('subject', subject)
		console.log('this', this)
		subject.attach(this)
	}
	update() {
		console.log(`${this.name} update, state: ${this.subject.getState()}`)
	}
}


const obj = new Subject()

const o1 = new Observer('o1', obj)
const o2 = new Observer('o2', obj)

obj.setState(12)