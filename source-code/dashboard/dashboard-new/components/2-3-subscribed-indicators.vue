<template>
<div class="indicator-wrapper">
  <div class="title mgb-xs">
    {{ $t("dashboard.subscribed_indicators") }}
    <zm-button
      v-if="isShowChart"
      class="mgl-xs"
      style="font-size: 20px"
      type="icon"
      icon="zm-icon-right"
      ghost
      size="mini"
      @click="handleRightIconClick"
    />
  </div>
  <div v-show="!loading" class="description">
    {{ $t("dashboard.top_indicators") }}
    <zm-tooltip
      popper-class="subscribed-indicators-tooltip"
      placement="top"
      :content="$t('dashboard.subscribed_indicators_tooltip')"
    >
      <i class="mgl-xs zm-icon-warning-outline" />
    </zm-tooltip>
  </div>
  <zm-skeleton v-if="loading" animated :throttle="500">
    <template #template>
      <div class="mgr-sm" style="margin-top: 40px">
        <zm-skeleton-item variant="p" class="skeleton-item" />
        <zm-skeleton-item variant="p" class="skeleton-item" />
        <zm-skeleton-item variant="p" class="skeleton-item" />
        <zm-skeleton-item
          variant="p"
          class="skeleton-item"
          style="width: 82%"
        />
        <zm-skeleton-item
          variant="p"
          class="skeleton-item mgr-md"
          style="width: 57%"
        />
        <zm-skeleton-item
          class="skeleton-item"
          variant="p"
          style="width: 40%"
        />
      </div>
    </template>
  </zm-skeleton>
  <div style="height: calc(100% - 28px)">
    <template v-if="isShowChart">
      <div ref="barChart" :style="{ height: barChartHeight }" />
    </template>
    <div v-else-if="isEnabled" class="empty-content">
      <div>
        <div class="no-content-tip">
          {{ $t("dashboard.subscribed_indicators_will_appear_here") }}
        </div>
        <div class="mgt-sm" style="text-align: center">
          <zm-button type="link" @click="toIndicatorSubscribe">
            {{ $t("dashboard.view_indicators") }}
          </zm-button>
        </div>
      </div>
    </div>
    <div v-else-if="!loading" class="empty-content">
      <div class="no-content-tip">
        {{ $t("dashboard.setting_not_open_ra") }}
      </div>
    </div>
  </div>
</div>
</template>
    <script lang="ts">
import * as echarts from "echarts/core";

import { genBarTooltipMentionDashboard } from "@views/analytics/utils/chart/tooltip";
import { BarChart } from "echarts/charts";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import {
  DatasetComponent,
  GridComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from "echarts/components";
import { getSubscribedIndicators } from "@api/dashboard-new";
import { endOfToday, startOfDay, sub } from "date-fns";
import { openLink } from "@common/js/client";
import { useStore } from "vuex";
import { computed, defineComponent, onMounted, onActivated, onDeactivated, ref, nextTick } from "vue";

const colorDataList = [
  {
    itemStyle: { color: "#66CC84" },
    emphasis: { itemStyle: { color: "#2BA09B" } },
  },
  {
    itemStyle: { color: "#A8CCF8" },
    emphasis: { itemStyle: { color: "#4793F1" } },
  },
  {
    itemStyle: { color: "#FF8422" },
    emphasis: { itemStyle: { color: "#DC7929" } },
  },
  {
    itemStyle: { color: "#FFBF39" },
    emphasis: { itemStyle: { color: "#C28030" } },
  },
  {
    itemStyle: { color: "#F46670" },
    emphasis: { itemStyle: { color: "#FD3D4A" } },
  },
  {
    itemStyle: { color: "#C4C8EA" },
    emphasis: { itemStyle: { color: "#9FA4C7" } },
  },
];

export default defineComponent({
  name: "SubscribedIndicators",
  setup() {
    const store = useStore();
    const loading = ref(true);
    const indicatorChart = ref<any>({});
    const indicatorInfoList = ref<any[]>([]);
    const seriesDataList = ref<any[]>([]);
    const isEnabled = ref(false);

    const currentUser = computed(() => store.state.currentUser);

    const isShowChart = computed(() => indicatorInfoList.value?.length && isEnabled.value);

    const barChartHeight = computed(() => {
      const listLength = seriesDataList.value.length;
      return listLength < 6
        ? `calc((100% - 20px)* (${listLength} / 6))`
        : "calc(100% - 20px)";
    });

    const callBackWhenResize = () => {
      indicatorChart.value && indicatorChart.value.resize();
    };

    const toIndicatorSubscribe = () => {
      openLink("/profile/setting?tab=iq&f=indicator-subscribe");
    };

    const handleRightIconClick = () => {
      store.$router.push({
        name: "indicator-mentioned",
        params: {
          id: "all",
        },
        query: {
          fromDashboard: true,
          range: `${startOfDay(
            sub(endOfToday(), { days: 29 })
          ).getTime()}, ${endOfToday().getTime()}`,
        },
      });
    };

    const genIndicatorBarOption = () => {
      return {
        xAxis: { type: "value", show: false },
        yAxis: { type: "category", show: false, inverse: true },
        grid: {
          left: 0,
          top: 20,
          bottom: -4,
          right: 0,
        },
        series: [
          {
            barCategoryGap: "66%",
            data: seriesDataList.value,
            type: "bar",
            itemStyle: {
              borderRadius: 4,
            },
            emphasis: {
              itemStyle: {
                shadowColor: "#e7e7e8",
                shadowBlur: 6,
              },
            },
            label: {
              position: "top",
              distance: 21,
              show: true,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Almaden Sans",
              lineHeight: 18,
              height: 18,
            },
            labelLayout: {
              x: 0,
            },
          },
        ],
        tooltip: {
          position: function (point, params, dom, rect, size) {
            const tooltipWidth = size.contentSize[0];
            if (
              (point[0] > 176 && window.innerWidth <= 1438) ||
              (point[0] > 57 && window.innerWidth > 1438)
            ) {
              return [point[0] - tooltipWidth - 12, rect.y + 14];
            } else {
              return [point[0] + 12, rect.y + 14];
            }
          },
          appendToBody: true,
          borderWidth: 0,
          borderRadius: 8,
          formatter: (param) => genBarTooltipMentionDashboard()(param),
        },
      };
    };

    const initIndicatorBarChart = () => {
      nextTick(() => {
        if (indicatorChart.value) {
          indicatorChart.value = echarts.init(indicatorChart.value, null, {
            renderer: "svg",
          });
          const option = genIndicatorBarOption();
          indicatorChart.value.setOption(option, true);
          indicatorChart.value.on("click", (params) => {
            indicatorChart.value.dispatchAction({
              type: "hideTip",
            });
            store.$router.push({
              name: "indicator-mentioned",
              params: {
                id: params.data.indicator_id,
              },
              query: {
                fromDashboard: true,
                range: `${startOfDay(
                  sub(endOfToday(), { days: 29 })
                ).getTime()}, ${endOfToday().getTime()}`,
              },
            });
          });
        }
      });
    };

    onMounted(() => {
      loading.value = true;
      getSubscribedIndicators()
        .then((res) => {
          isEnabled.value = res.enable_indicator_setting || false;
          indicatorInfoList.value = res.indicator_mentioned_dto_list || [];
          store.commit("dashboard/UPDATE_TOP_SIX_INDICATOR_LIST", indicatorInfoList.value);
          const dataList = [];
          for (let i = 0; i < indicatorInfoList.value.length; i++) {
            const indicatorInfo = indicatorInfoList.value[i];
            dataList.push({
              ...colorDataList[i],
              ...indicatorInfo,
              value: indicatorInfo.mentioned_rate,
              label: {
                formatter: (param) => {
                  return param.data.indicator_name;
                },
              },
            });
          }
          seriesDataList.value = dataList;
          if (isShowChart.value) {
            initIndicatorBarChart();
            window.addEventListener("resize", callBackWhenResize);
          }
        })
        .catch((e) => store.$message.error(e.errorMessage))
        .finally(() => (loading.value = false));
    });

    onActivated(() => {
      if (isShowChart.value) {
        callBackWhenResize();
        window.addEventListener("resize", callBackWhenResize);
      }
    });

    onDeactivated(() => {
      if (isShowChart.value)
        window.removeEventListener("resize", callBackWhenResize);
    });

    return {
      loading,
      indicatorChart,
      indicatorInfoList,
      seriesDataList,
      isEnabled,
      currentUser,
      isShowChart,
      barChartHeight,
      callBackWhenResize,
      toIndicatorSubscribe,
      handleRightIconClick,
      genIndicatorBarOption,
      initIndicatorBarChart,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.indicator-wrapper {
  height: 100%;
  .title {
    font-weight: 600;
    font-size: 20px;
    height: 24px;
    line-height: 24px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
  .description {
    height: 20px;
    line-height: 20px;
    display: flex;
    align-items: center;
    color: #6e7680;
  }
  .empty-content {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -20px;
    .no-content-tip {
      line-height: 20px;
      color: #6e7680;
      text-align: center;
    }
  }
  .skeleton-item {
    margin-bottom: 22px;
    border-radius: 4px;
  }
}

      </style>
<style lang="scss" >
        
.subscribed-indicators-tooltip {
  width: 286px;
}

      </style>