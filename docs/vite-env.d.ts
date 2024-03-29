/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "*.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}


declare module '*.tsx' {
  import type { DefineComponent } from '*.tsx'
  const component: DefineComponent<{}, {}, any>
  export default component
}