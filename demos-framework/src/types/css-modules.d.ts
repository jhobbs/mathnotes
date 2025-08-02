// Type definitions for CSS Modules
declare module '*.module.css' {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
}

// Type-safe CSS module helper
export type CSSModuleClasses<T extends string> = {
  readonly [K in T]: string;
};