
function selectAndFillContent(el: HTMLElement, binding: any, vNode: any): void {
  const inputDom = el.querySelector("input") as HTMLInputElement | null;
  if (inputDom) {
    inputDom.addEventListener("focus", () => {
      inputDom.value = binding.value;
      inputDom.select();
    });
  }
  if (inputDom && !inputDom.value) {
    inputDom.addEventListener("blur", (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.value) {
        inputDom.value = binding.value;
        vNode.componentInstance &&
          vNode.componentInstance.$emit("input", binding.value);
      }
    });
  }
}

export default {
  inserted(el: HTMLElement, binding: any, vNode: any): void {
    selectAndFillContent(el, binding, vNode);
  },
  update(el: HTMLElement, binding: any, vNode: any): void {
    selectAndFillContent(el, binding, vNode);
  },
};
