
/* eslint-disable no-console */
const noop = (): void => {};
const logger = {
  dir: console.dir ?? noop,
  log: console.log ?? noop,
  error: console.error ?? noop,
  info: console.info ?? noop,
  warn: console.warn ?? noop,
  debugger: console.debug ?? noop,
};

export default logger;
