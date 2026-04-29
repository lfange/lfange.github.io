import { add, multiply } from './math.js';
import { greet } from './message.js';

const a = 10;
const b = 5;

console.log(greet('Webpack'));
console.log(`Add: ${a} + ${b} = ${add(a, b)}`);
console.log(`Multiply: ${a} * ${b} = ${multiply(a, b)}`);

const result = add(a, b);
export { result };