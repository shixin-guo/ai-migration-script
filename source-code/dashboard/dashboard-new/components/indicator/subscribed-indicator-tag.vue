<template>
<div v-show="indicatorList.length">
  <div class="btn-wrapper">
    <zm-button
      v-for="indicator in indicatorList"
      :key="indicator?.indicator_id"
      class="mgt-sm mgr-sm"
      round
      :type="indicator && activeName === indicator.name ? 'primary' : ''"
      @click="handleClick(indicator)"
    >
      <div class="menu-btn">
        {{ indicator?.name || "" }}
      </div>
    </zm-button>
  </div>
</div>
</template>
    <script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: "SubscribedIndicatorTag",
  props: {
    indicatorList: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    indicatorInfo: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    activeName: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const handleClick = (indicator: Record<string, any> = {}) => {
      if (indicator.indicator_id !== props.indicatorInfo.indicator_id) {
        emit("update:activeName", indicator.name);
        emit("get-info", indicator.indicator_id);
      }
    };

    return {
      handleClick,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.btn-wrapper {
  margin-bottom: 16px;

  .zm-button + .zm-button {
    margin-left: 0;
  }

  .menu-btn {
    text-overflow: ellipsis;
    max-width: 200px;
    overflow: hidden;
    display: inline;
  }
  .ax-hidden {
    width: 0;
    height: 0;
    overflow: hidden;
  }
}

      </style>