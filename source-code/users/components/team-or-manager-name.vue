<template>
<zm-tooltip
  :disabled="!isShowTooltip"
  placement="top"
  popper-class="team-manage-tooltip"
  :content="name"
>
  <div ref="name" class="two-line-ellipsis">
    {{ name }}
  </div>
</zm-tooltip>
</template>
    <script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: "TeamOrManagerName",
  props: {
    name: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const isShowTooltip = ref(false);
    const nameDom = ref<HTMLElement | null>(null);

    onMounted(() => {
      if (nameDom.value) {
        isShowTooltip.value = nameDom.value.clientHeight !== nameDom.value.scrollHeight;
      }
    });

    return {
      isShowTooltip,
      nameDom,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.two-line-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

      </style>
      <style lang="scss" >
        
.team-manage-tooltip {
  max-width: 360px;
  color: #131619;
}

      </style>