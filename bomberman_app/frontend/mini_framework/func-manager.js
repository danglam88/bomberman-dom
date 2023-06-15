export let funcs = new Map();

export const defineFunc = (func) => {
  funcs.set(func.name, func);
}
