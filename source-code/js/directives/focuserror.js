
function selectAndFillContent(el: HTMLElement, binding: any) {
  const inputDom = el.querySelector("input") as HTMLInputElement | null;
  const type = binding.value?.type;
  const handleFunction = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.value) {
      // if (type === "title") binding.value.question.isTitleError = true;
      // if (type === "choice") binding.value.options.isChoiceError = true;
      // if (type === "points") binding.value.options.isPointsError = true;
    } else {
      if (type === "title") binding.value.question.isTitleError = false;
      if (type === "choice") binding.value.options.isChoiceError = false;
      if (type === "points") binding.value.options.isPointsError = false;
    }
  };
  if (inputDom) {
    inputDom.addEventListener("focus", () => {
      inputDom.select();
    });
  }
  if (inputDom && !inputDom.value) {
    inputDom.addEventListener("blur", handleFunction);
    inputDom.addEventListener("input", handleFunction);
  }
}

export default {
  inserted(el: HTMLElement, binding: any, vNode: any) {
    selectAndFillContent(el, binding, vNode);
  },
  update(el: HTMLElement, binding: any, vNode: any) {
    selectAndFillContent(el, binding, vNode);
  },
};
