<template>
<zm-dialog v-model:visible="advanceDialogVisible" width="600px">
  <template #title>
    <h1>{{ $t("keyword_phrases_with_additional_parameters") }}</h1>
  </template>
  <zm-scrollbar wrap-style="height:152px">
    <span>{{ advanceKeywords }}</span>
  </zm-scrollbar>
  <template #footer>
    <div>
      <zm-button @click="$emit('update:advanceDialogVisible', false)">
        {{ $t("common.close") }}
      </zm-button>
    </div>
  </template>
</zm-dialog>
</template>
    <script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: "AdvanceDialog",
  props: {
    advanceDialogVisible: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    advanceKeywords: {
      type: String as PropType<string>,
      default: "",
    },
  },
});
</script>
    