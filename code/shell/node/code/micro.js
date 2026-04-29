const baz = () => console.log('baz')
const foo = () => console.log('foo')
const zoo = () => console.log('zoo')

const start = () => {
  console.log('start')
  setImmediate(baz)
  new Promise((resolve, reject) => {
    console.log(`output->ffffffffff`)
    resolve('bar')
  }).then((resolve) => {
    console.log(resolve)
    process.nextTick(zoo)
  })
  process.nextTick(foo)

  new Promise((resolve, reject) => {
    console.log(`output->gggggggggggg`)
  })
}

start()

// start foo bar zoo baz
