
const fileRegex = /\.(my-file-ext)$/

export default function MyPlugin(options) {
  console.log("default MyPlugin", options);
  return {
    name: "my-example", // 名称用于警告和错误展示
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar'
        }
      }
    }),
    transform(src, id) {
     console.log('ssssss', src, id)
    },
    resolveId(source) {
      console.log("provinceId", source)
      if (source === "virtual-module") {
        return source; // 返回source表明命中，vite不再询问其他插件处理该id请求
      }
      return null; // 返回null表明是其他id要继续处理
    },
    load(id) {
      console.log("load MyPlugin", id);
      if (id === "virtual-module") {
        return 'export default "This is virtual!"'; // 返回"virtual-module"模块源码
      }
      return null; // 其他id继续处理
    },
  };
}
