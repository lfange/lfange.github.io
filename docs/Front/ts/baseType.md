# typescript 类型

## 基本类型

### String 类型

```javascript
let name: string = "Hello Bug!";
```

### Boolean 类型

```javascript
const flag: boolean = true;
```

### Number 类型

```javascript
const count: number = 10;
```

### Enum 类型

枚举类型用于定义数值集合，使用枚举我们可以定义一些带名字的常量。使用枚举可以清晰地表达意图或创建一组有区别的用例。，如周一到周日，方位上下左右等

- 普通枚举  
  初始值默认为 0 其余的成员会会按顺序自动增长 可以理解为数组下标

```javascript
enum Color {
  RED,
  PINK,
  BLUE,
}

const red: Color = Color.RED;
console.log(red); // 0
```

设置初始值

```javascript
enum Color {
  RED = 2,
  PINK,
  BLUE,
}
const pink: Color = Color.PINK;
console.log(pink); // 3
```

- 字符串枚举

```javascript
enum Color {
  RED = "红色",
  PINK = "粉色",
  BLUE = "蓝色",
}

const pink: Color = Color.PINK;
console.log(pink); // 粉色
```

- 常量枚举  
  使用 const 关键字修饰的枚举，常量枚举与普通枚举的区别是，整个枚举会在编译阶段被删除 我们可以看下编译之后的效果

```javascript
const enum Color {
  RED,
  PINK,
  BLUE,
}

const color: Color[] = [Color.RED, Color.PINK, Color.BLUE];
console.log(color); //[0, 1, 2]

//编译之后的js如下：
var color = [0 /* RED */, 1 /* PINK */, 2 /* BLUE */];
// 可以看到我们的枚举并没有被编译成js代码 只是把color这个数组变量编译出来了
```

### Array 类型

对数组类型的定义有两种方式:

```javascript
const arr: number[] = [1, 2, 3];
const arr2: Array<number> = [1, 2, 3];
```

### 元组（tuple）类型

上面数组类型的方式，只能定义出内部全为同种类型的数组。对于内部不同类型的数组可以使用元组类型来定义

元组（ Tuple ）表示一个已知数量和类型的数组,可以理解为他是一种特殊的数组

```javascript
const tuple: [number, string] = [1, "zhangmazi"];
```

需要注意的是，元组类型只能表示一个已知元素数量和类型的数组，长度已指定，越界访问会提示错误。例如，一个数组中可能有多种类型，数量和类型都不确定，那就直接 any[]。

### undefined 和 null

默认情况下 null 和 undefined 是所有类型的子类型。也就是说你可以把 null 和 undefined 赋值给其他类型。

```javascript
let a: undefined = undefined;
let b: null = null;

let str: string = "zhangmazi";
str = null; // 编译正确
str = undefined; // 编译正确
```

如果你在 tsconfig.json 指定了"strictNullChecks":true ，即开启严格模式后， null 和 undefined 只能赋值给 void 和它们各自的类型。

```javascript
// 启用 --strictNullChecks
let x: number;
x = 1; // 编译正确
x = undefined; // 编译错误
x = null; // 编译错误
```

### any 类型

any 会跳过类型检查器对值的检查，任何值都可以赋值给 any 类型

```javascript
let value: any = 1;
value = "zhangmazi"; // 编译正确
value = []; // 编译正确
value = {}; // 编译正确
```

### void 类型

void 意思就是无效的, 一般只用在函数上，告诉别人这个函数没有返回值。

```javascript
function sayHello(): void {
  console.log("hello 啊，树哥！");
}
```

### never 类型

never 类型表示的是那些永不存在的值的类型。例如 never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型

值会永不存在的两种情况：

1. 如果一个函数执行时抛出了异常，那么这个函数永远不存在返回值（因为抛出异常会直接中断程序运行，这使得程序运行不到返回值那一步，即具有不可达的终点，也就永不存在返回了）
2. 函数中执行无限循环的代码（死循环），使得程序永远无法运行到函数返回值那一步，永不存在返回。

```javascript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  // 编译正确
  throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
  return error("Something failed");
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
  while (true) {}
}
```

### Unknown 类型

unknown 与 any 一样，所有类型都可以分配给 unknown:

```javascript
let value: unknown = 1;
value = "zhangmazi"; // 编译正确
value = false; // 编译正确
```

**Tips** unknown 与 any 的最大区别是：

任何类型的值可以赋值给 any，同时 any 类型的值也可以赋值给任何类型。unknown 任何类型的值都可以赋值给它，但它只能赋值给 unknown 和 any

## 泛型

软件工程中，我们不仅要创建一致的定义良好的 API，同时也要考虑可重用性。 组件不仅能够支持当前的数据类型，同时也能支持未来的数据类型，这在创建大型系统时为你提供了十分灵活的功能。

在像 C#和 Java 这样的语言中，可以使用泛型来创建可重用的组件，一个组件可以支持多种类型的数据。 这样用户就可以以自己的数据类型来使用组件。

```javascript
function identity<T>(arg: T): T {
  return arg;
}
```

::: tip $
any 类型会导致这个函数可以接收任何类型的 arg 参数，这样就丢失了一些信息：传入的类型与返回的类型应该是相同的。如果我们传入一个数字，我们只知道任何类型的值都有可能被返回  
**不同于使用 any，泛型不会丢失信息，传入数值类型并返回数值类型**
:::

```javascript
let output = identity < string > "myString"; // type of output will be 'string'
```

这里我们明确的指定了 T 是 string 类型，并做为一个参数传给函数，使用了<>括起来而不是()。

第二种方法更普遍。利用了[类型推论](#类型推论) -- 即编译器会根据传入的参数自动地帮助我们确定 T 的类型：

```javascript
let output = identity("myString"); // type of output will be 'string'
```

注意我们没必要使用尖括号（<>）来明确地传入类型；编译器可以查看 myString 的值，然后把 T 设置为它的类型。 类型推论帮助我们保持代码精简和高可读性。如果编译器不能够自动地推断出类型的话，只能像上面那样明确的传入 T 的类型，在一些复杂的情况下，这是可能出现的。

## 对象类型

这里所说的对象类型，就是我们常说的函数、{}、数组、类

### object

object 表示非原始类型，也就是除 number，string，boolean，symbol，null 或 undefined 之外的类型。

使用 object 类型，就可以更好的表示像 Object.create 这样的 API。例如：
在严格模式下，null 和 undefined 类型也不能赋给 object。

```javascript
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

### Object

大 Object 代表所有拥有 toString、hasOwnProperty 方法的类型 所以所有原始类型、非原始类型都可以赋给 Object(严格模式下 null 和 undefined 不可以)

```javascript
let bigObject: Object;
object = 1; // 编译正确
object = "a"; // 编译正确
object = true; // 编译正确
object = null; // 报错
ObjectCase = undefined; // 报错
ObjectCase = {}; // ok
```

### {}

{} 空对象类型和大 Object 一样 也是表示原始类型和非原始类型的集合

### 类

在 TypeScript 中，我们通过 Class 关键字来定义一个类

```javascript
class Person {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  sayHi(): void {
    console.log(`Hi, ${this.name}`);
  }
}
```

### 函数

- 函数声明

```javascript
function add(x: number, y: number): number {
  return x + y;
}
```

- 函数表达式

```javascript
const add = function (x: number, y: number): number {
  return x + y;
};
```

- 接口定义函数

```javascript
interface Add {
  (x: number, y: number): number;
}
```

- 可选参数

```javascript
function add(x: number, y?: number): number {
  return y ? x + y : x;
}
```

- 默认参数

```javascript
function add(x: number, y: number = 0): number {
  return x + y;
}
```

- 剩余参数

```javascript
function add(...numbers: number[]): number {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}
```

### 函数重载

函数重载或方法重载是使用相同名称和不同参数数量或类型创建多个方法的一种能力。

```javascript
function add(x: number, y: number): number;
function add(x: string, y: string): string;
function add(x: any, y: any): any {
  return x + y;
}
```

上面示例中，我们给同一个函数提供多个函数类型定义，从而实现函数的重载

::: tip 注意
函数重载真正执行的是同名函数最后定义的函数体 在最后一个函数体定义之前全都属于函数类型定义 不能写具体的函数实现方法 只能定义类型
:::

## 类型推论

如果没有明确的指定类型，那么 TypeScript 会依照类型推论的规则推断出一个类型。

```javascript
let x = 1;
x = true; // 报错
// equal to
let x: number = 1;
x = true; // 报错
```

变量 x 的类型被推断为数字。 这种推断发生在初始化变量和成员，设置默认参数值和决定函数返回值时,大多数情况下，类型推论是直截了当地

而如果定义的时候没有赋值，不管之后有没有赋值，都会被推断成 any 类型而完全不被类型检查：

```javascript
let x;
x = 1; // 编译正确
x = true; // 编译正确
```

## 类型断言

某些情况下，我们可能比 typescript 更加清楚的知道某个变量的类型，所以我们可能希望手动指定一个值的类型
类型断言有两种方式

- 尖括号写法

```javascript
let str: any = "you are right";
let strLength: number = (<string>str).length;
```

- as 写法

```javascript
let str: any = "you are right";
let strLength: number = (str as string).length;
```

## 联合类型

联合类型用|分隔，表示取值可以为多种类型中的一种

```javascript
let status: string | number;
status = "you are right";
status = 1;
```

## 类型别名

类型别名用来给一个类型起个新名字。它只是起了一个新名字，并没有创建新类型。类型别名常用于联合类型。

```javascript
type count = number | number[];
function hello(value: count) {}
```

## 交叉类型

交叉类型就是跟联合类型相反，用&操作符表示，交叉类型就是两个类型必须存在

```javascript
interface IpersonA {
  name: string;
  age: number;
}
interface IpersonB {
  name: string;
  gender: string;
}

let person: IpersonA & IpersonB = {
  name: "Fange",
  age: 18,
  gender: "男",
};
```

person 即是 IpersonA 类型，又是 IpersonB 类型

**注意：** 交叉类型取的多个类型的并集，但是如果 key 相同但是类型不同，则该 key 为 never 类型

```javascript
interface IpersonA {
  name: string;
}

interface IpersonB {
  name: number;
}

function testAndFn(params: IpersonA & IpersonB) {
  console.log(params);
}

testAndFn({ name: "Fange" });
// error TS2322: Type 'string' is not assignable to type 'never'.
```




Typescript更多内容查看[官网](https://www.tslang.cn/docs/handbook/basic-types.html)
