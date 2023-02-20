import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
  input: "./src/index", //入口文件
  output: {
    format: "umd", // 模块类型  new Vue
    file: "dist/vue.js",
    name: "Vue",
    sourcemap: true, //
  },
  plugins: [
    babel({
      exclude: "node_modules**", //**  node_modules下的文件
    }),
    serve({
      // 3000
      port: 5000,
      contentBase: "", //
      openPage: "/watch.html", //要打开的页面
    }),
  ],
};
