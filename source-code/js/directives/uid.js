
let _uid: number = 0;

function uid(): number {
  return _uid++;
}

export default {
  inserted(el: HTMLElement, binding: { value: string }) {
    const prefix: string = binding.value || "";

    el.id = prefix + "-" + uid();
  },
};
