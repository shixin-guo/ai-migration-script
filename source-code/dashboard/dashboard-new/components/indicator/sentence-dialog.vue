<template>
<zm-dialog :visible="sentencesDialogVisible" width="600px">
  <template #title>
    <h1>{{ $t("guiding_sentences") }}</h1>
  </template>
  <zm-scrollbar wrap-style="height:252px">
    <div
      v-for="(item, index) in exampleSentences"
      :key="index"
      class="mgb-sm"
    >
      <span class="mgr-xs">{{ index + 1 }}.</span>
      <span>{{ item }}</span>
    </div>
  </zm-scrollbar>
  <template #footer>
    <zm-button @click="$emit('update:sentencesDialogVisible', false)">
      {{ $t("common.close") }}
    </zm-button>
  </template>
</zm-dialog>
</template>
    <script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: "SentenceDialog",
  props: {
    sentencesDialogVisible: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    exampleSentences: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
  },
});
</script>
    