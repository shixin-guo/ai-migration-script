
export function hasClass(el: HTMLElement, className: string): boolean {
  const reg = new RegExp("(^|\\s)" + className + "(\\s|$)");
  return reg.test(el.className);
}

export function addClass(el: HTMLElement, className: string): void {
  if (hasClass(el, className)) {
    return;
  }
  const newClass = el.className.split(" ");
  newClass.push(className);
  el.className = newClass.join(" ").trim();
}

export function removeClass(el: HTMLElement, className: string): void {
  if (!hasClass(el, className)) {
    return;
  }
  const reg = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
  el.className = el.className.replace(reg, " ").trim();
}
