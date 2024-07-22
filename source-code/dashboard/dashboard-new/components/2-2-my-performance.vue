<template>
<div class="my-performance">
  <div class="title mgb-xs mgl-sm mgt-sm">
    {{ $t("dashboard.my_performance") }}
    <zm-button
      style="font-size: 14px"
      class="mgr-sm"
      type="icon"
      icon="zm-icon-settings-outline"
      ghost
      size="mini"
      :disabled="loading"
      @click="settingDialogVisible = true"
    />
  </div>
  <zm-skeleton
    :loading="loading"
    animated
    :throttle="500"
    style="height: calc(100% - 28px)"
  >
    <template #template>
      <div class="mgr-sm mgl-sm" style="padding-top: 36px; font-size: 0">
        <zm-skeleton-item class="skeleton-item" />
        <zm-skeleton-item class="skeleton-item" />
        <zm-skeleton-item class="skeleton-item" />
      </div>
    </template>
    <div v-if="metricsList.length" style="height: 100%">
      <div v-if="settingTimeWindow" class="description mgl-sm">
        {{ $t("dashboard.last_days", [settingTimeWindow]) }}
      </div>
      <div v-else class="description mgl-sm">
        {{ dataPeriod }}
      </div>
      <zm-scrollbar class="metrics-container">
        <div
          v-for="(metric, index) in metricsList"
          :key="index"
          class="metric"
          @click="handleMetricClick(metric)"
        >
          <div class="metric-desc">
            {{ dataOptionsMap[metric].label }}
          </div>
          <div class="metric-title">
            <span class="metric-title-data">
              {{ dataOptionsMap[metric].data }}
            </span>
            <span
              v-if="dataOptionsMap[metric].unit"
              class="metric-title-unit mgl-xs"
            >
              {{ dataOptionsMap[metric].unit }}
            </span>
            <zm-tooltip v-if="metric !== 'conversationPerDeal'" placement="top">
              <template #content>
                <div class="kpi-tooltip">
                  <h3 class="kpi-tooltip-text">
                    {{ tooltipTitle(metric) }}
                  </h3>
                  <div
                    v-for="item in rangeList(dataOptionsMap[metric].key)"
                    :key="item.icon"
                    class="kpi-tooltip-icon"
                  >
                    <i :class="item.icon" />
                    <span class="kpi-tooltip-text">{{ item.text }}</span>
                  </div>
                  <zm-button type="link" @click="openSupportLink">
                    {{ $t("common.learn_more") }}
                  </zm-button>
                </div>
              </template>
              <i
                :class="getActiveIcon(dataOptionsMap[metric].key)"
                class="kpi-status-icon mgl-xs"
              />
            </zm-tooltip>
            <div
              class="percentage"
              :style="{
                ...(dataOptionsMap[metric].change === 'N/A'
                  ? { color: '#98A0A9' }
                  : {}),
              }"
            >
              <svg
                v-if="changeDataMap[metric] > 0"
                class="mgr-sm"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_3042_7418"
                  style="mask-type: alpha"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="4"
                  width="16"
                  height="8"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.25 4.75C11.25 4.33579 11.5858 4 12 4H15.5C15.7761 4 16 4.22386 16 4.5V8C16 8.41421 15.6642 8.75 15.25 8.75C14.8358 8.75 14.5 8.41421 14.5 8V6.57542L10.8546 10.2628C10.4436 10.6786 9.79921 10.7539 9.30337 10.4441L5.35802 7.97932L1.25863 11.7622C0.954225 12.0432 0.479733 12.0241 0.198826 11.7197C-0.0820819 11.4153 -0.0630318 10.9408 0.241375 10.6599L4.48097 6.74758C4.89493 6.36558 5.51326 6.30764 5.99098 6.60609L9.9285 9.06601L13.4539 5.5H12C11.5858 5.5 11.25 5.16421 11.25 4.75Z"
                    fill="#000001"
                  />
                </mask>
                <g mask="url(#mask0_3042_7418)">
                  <rect width="16" height="16" fill="#131619" />
                </g>
              </svg>
              <svg
                v-else-if="changeDataMap[metric] < 0"
                class="mgr-sm"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_3042_7435"
                  style="mask-type: alpha"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="4"
                  width="16"
                  height="8"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.25 11.2112C11.25 11.6254 11.5858 11.9612 12 11.9612H15.5C15.7761 11.9612 16 11.7373 16 11.4612V7.96118C16 7.54697 15.6642 7.21118 15.25 7.21118C14.8358 7.21118 14.5 7.54697 14.5 7.96118V9.38576L10.8546 5.69837C10.4436 5.28259 9.79921 5.20728 9.30337 5.51706L5.35802 7.98186L1.25863 4.19894C0.954225 3.91803 0.479733 3.93708 0.198826 4.24149C-0.0820819 4.54589 -0.0630318 5.02039 0.241375 5.30129L4.48097 9.2136C4.89493 9.59561 5.51326 9.65354 5.99098 9.35509L9.9285 6.89518L13.4539 10.4612H12C11.5858 10.4612 11.25 10.797 11.25 11.2112Z"
                    fill="#000001"
                  />
                </mask>
                <g mask="url(#mask0_3042_7435)">
                  <rect width="16" height="16" fill="#131619" />
                </g>
              </svg>
              {{ dataOptionsMap[metric].change }}
            </div>
          </div>
          <div v-if="metric !== 'conversationPerDeal'" class="recommended-text">
            {{ rangeList(dataOptionsMap[metric].key)[0].text }}
          </div>
        </div>
      </zm-scrollbar>
    </div>
    <div v-else-if="!loading" class="empty-content">
      <div>
        <div class="no-content-tip">
          {{ $t("dashboard.set_up_to_show_your_performance") }}
        </div>
        <div class="mgt-sm" style="text-align: center">
          <zm-button type="link" @click="settingDialogVisible = true">
            {{ $t("dashboard.set_up") }}
          </zm-button>
        </div>
      </div>
    </div>
  </zm-skeleton>

  <zm-dialog
    width="600px"
    v-model:visible="settingDialogVisible"
    @open="handleDialogOpen"
  >
    <template #title>
      <div class="dialog-title">
        {{ $t("dashboard.set_up_focus_areas") }}
      </div>
    </template>
    <div class="dialog-description">
      {{ $t("dashboard.select_focus_areas_to_show_on_the_dashboard") }}
    </div>
    <zm-checkbox-group
      v-model="settingsCheckList"
      vertical
      aria-labelledby="group_label_1"
    >
      <zm-checkbox
        v-for="settingOption in settingOptions"
        :key="settingOption.name"
        :label="settingOption.name"
      >
        {{ settingOption.label }}
      </zm-checkbox>
    </zm-checkbox-group>
    <div class="date-title">
      {{ $t("dashboard.choose_a_time_window") }}
    </div>
    <date-select
      v-model="period"
      style="width: 320px"
      :can-choose-seven="false"
      @change="handlePeriodChange"
    />
    <template #footer>
      <div class="dialog-footer">
        <div v-show="showWarningTip" class="footer-tip">
          {{ $t("dashboard.you_have_to_select_at_least_one_focus_area") }}
        </div>
        <div class="foot-button-group">
          <zm-button
            :loading="isSaveButtonLoading"
            :disabled="isSaveBtnDisabled"
            type="primary"
            @click="handleSave"
          >
            {{ $t("common.save") }}
          </zm-button>
          <zm-button @click="handleCancel">
            {{ $t("common.cancel") }}
          </zm-button>
        </div>
      </div>
    </template>
  </zm-dialog>

  <conversation-drawer
    v-model:visible="drawerVisible"
    :params="drawerParams"
    :drawer-filter="drawerFilter"
  />
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import ConversationDrawer from "@views/analytics/components/conversation-drawer";
import DateSelect from "@components/date-select";
import {
  getMyPerformanceMetrics,
  saveMyPerformanceSettings,
} from "@api/dashboard-new";
import { endOfDay, endOfToday, isThisYear, startOfDay, sub } from "date-fns";
import { formatInTimeZone, formatSecondsToMinute } from "shared/js/format-date";
import { isNumber } from "lodash-es";
import { getMetics } from "@views/dashboard/dashboard-new/utils/utils";
import { KPI_RANGE_ICON } from "@components/analytics/consts";
import {
  getKpiRange,
  getRangeText,
} from "@components/analytics/kpi-status-utils";
import { openLink } from "@common/js/client";
import { ERROR_CODE } from "shared/js/error-codes";
import { TYPES_CHART_CONFIG } from "@views/analytics/utils/const";

const lastDaysMap = new Map([
  [startOfDay(sub(endOfToday(), { days: 29 })).getTime(), 30],
  [startOfDay(sub(endOfToday(), { days: 89 })).getTime(), 90],
  [startOfDay(sub(endOfToday(), { days: 364 })).getTime(), 365],
]);
const lastDaysMapReverse = new Map([
  [30, startOfDay(sub(endOfToday(), { days: 29 }))],
  [90, startOfDay(sub(endOfToday(), { days: 89 }))],
  [365, startOfDay(sub(endOfToday(), { days: 364 }))],
]);

export default defineComponent({
  name: "MyPerformance",
  components: { DateSelect, ConversationDrawer },
  setup() {
    const store = useStore();
    const loading = ref(true);
    const metricsList = ref([]);
    const settingDialogVisible = ref(false);
    const isSaveButtonLoading = ref(false);
    const settingsCheckList = ref([]);
    const settingPeriod = ref([
      startOfDay(sub(endOfToday(), { days: 29 })),
      endOfToday(),
    ]);
    const settingTimeWindow = ref(30);
    const period = ref([startOfDay(sub(endOfToday(), { days: 29 })), endOfToday()]);
    const settingOptions = ref([
      { name: "talkToListen", label: store.state.i18n.t("analytics.talk_listen_ratio") },
      { name: "talkSpeed", label: store.state.i18n.t("analytics.talking_speed") },
      { name: "longestMonolog", label: store.state.i18n.t("analytics.longest_spiel") },
      { name: "fillerWords", label: store.state.i18n.t("analytics.filler_words") },
      { name: "patience", label: store.state.i18n.t("analytics.patience") },
      {
        name: "conversationPerDeal",
        label: store.state.i18n.t("dashboard.conversations_per_deal"),
      },
    ]);
    const metricsData = ref({});
    const drawerVisible = ref(false);
    const drawerParams = ref({});
    const changeDataMap = ref({
      patience: null,
      talkToListen: null,
      talkSpeed: null,
      longestMonolog: null,
      fillerWords: null,
      conversationPerDeal: null,
    });

    const currentUser = computed(() => store.state.currentUser);

    const isSaveBtnDisabled = computed(() => !settingsCheckList.value.length);
    const showWarningTip = computed(() => !settingsCheckList.value.length);
    const getTimeWindow = computed(() => {
      const currentPreviousTime = period.value?.[0].getTime();
      const currentEndTime = period.value?.[1].getTime();
      return lastDaysMap.has(currentPreviousTime) &&
        currentEndTime === endOfToday().getTime()
        ? lastDaysMap.get(currentPreviousTime)
        : 0;
    });
    const dataOptionsMap = computed(() => {
      return {
        talkToListen: {
          label: store.state.i18n.t("analytics.talk_listen_ratio"),
          data: metricsData.value.my_talk_time,
          unit: "%",
          key: "my_talk_time",
          change: getChangeDisplay(changeDataMap.value.talkToListen),
        },
        talkSpeed: {
          label: store.state.i18n.t("analytics.talking_speed"),
          data: metricsData.value.talk_speed,
          unit: store.state.i18n.t("analytics.words_per_min"),
          key: "talk_speed",
          change: getChangeDisplay(changeDataMap.value.talkSpeed),
        },
        longestMonolog: {
          label: store.state.i18n.t("analytics.longest_spiel"),
          data: formatSecondsToMinute(metricsData.value.longest_spiel),
          unit: "",
          key: "longest_spiel",
          change: getChangeDisplay(changeDataMap.value.longestMonolog),
        },
        fillerWords: {
          label: store.state.i18n.t("analytics.filler_words"),
          data: metricsData.value.filler_words,
          unit: store.state.i18n.t("analytics.words_per_min"),
          key: "filler_words",
          change: getChangeDisplay(changeDataMap.value.fillerWords),
        },
        patience: {
          label: store.state.i18n.t("analytics.patience"),
          data: metricsData.value.patience,
          unit: store.state.i18n.t("analytics.seconds"),
          key: "patience",
          change: getChangeDisplay(changeDataMap.value.patience),
        },
        conversationPerDeal: {
          label: store.state.i18n.t("dashboard.conversations_per_deal"),
          data: metricsData.value.conversation_per_deal,
          unit: "",
          key: "conversation_per_deal",
          change: getChangeDisplay(changeDataMap.value.conversationPerDeal),
        },
      };
    });
    const dataPeriod = computed(() => {
      return (
        formatDate(settingPeriod.value[0]) +
        " - " +
        formatDate(settingPeriod.value[1])
      );
    });
    const drawerFilter = computed(() => {
      const minDate = startOfDay(settingPeriod.value[0]).getTime();
      const maxDate = endOfDay(settingPeriod.value[1]).getTime();
      return {
        min_date: minDate,
        max_date: maxDate,
        group_by: "rep",
      };
    });

    onMounted(() => {
      getMyPerformanceData();
    });

    function getChangeDisplay(data) {
      if (data === 0) {
        return "+0%";
      } else {
        return data ? Math.round(data * 1000) / 10 + "%" : "N/A";
      }
    }

    function formatDate(date) {
      if (!date || !isNumber(date)) {
        return "-";
      }
      if (isThisYear(date)) {
        return formatInTimeZone(date, "MMM dd");
      } else {
        return formatInTimeZone(date, "MMM dd, yyyy");
      }
    }

    function tooltipTitle(metric) {
      return store.state.i18n.t(`analytics.${dataOptionsMap.value[metric].key}`);
    }

    function getMyPerformanceData() {
      loading.value = true;
      getMyPerformanceMetrics()
        .then((res) => {
          metricsList.value =
            res.dashboardMyPerformanceSettingDTO?.show_on_dashboard || [];
          settingTimeWindow.value =
            res.dashboardMyPerformanceSettingDTO?.time_window || 0;
          settingPeriod.value = [
            res.dashboardMyPerformanceSettingDTO?.start_time,
            res.dashboardMyPerformanceSettingDTO?.end_time,
          ];
          changeDataMap.value.patience = res.patience_change ?? null;
          changeDataMap.value.talkToListen = res.talk_to_listen_change ?? null;
          changeDataMap.value.talkSpeed = res.talk_speed_change ?? null;
          changeDataMap.value.longestMonolog = res.longest_monlog_change ?? null;
          changeDataMap.value.fillerWords = res.filler_words_change ?? null;
          changeDataMap.value.conversationPerDeal =
            res.conversation_per_deal_change ?? null;
          metricsData.value = getMetics(res);
          loading.value = false;
        })
        .catch((e) => {
          if (e.errorCode === ERROR_CODE.DASHBOARD_MY_PERFORMANCE_FIRST_TIME) {
            saveMyPerformanceSettings({
              show_on_dashboard: [
                "talkToListen",
                "talkSpeed",
                "longestMonolog",
                "fillerWords",
              ],
              time_window: 90,
            })
              .then((res) => {
                metricsList.value =
                  res?.dashboardMyPerformanceSettingDTO?.show_on_dashboard ||
                  [];
                settingsCheckList.value = metricsList.value;
                getMyPerformanceData();
              })
              .catch((e) => {
                store.state.i18n.message.error(e.errorMessage);
                loading.value = false;
              });
          } else {
            store.state.i18n.message.error(e.errorMessage);
          }
        });
    }

    function handlePeriodChange(newPeriod) {
      period.value = newPeriod;
    }

    function handleDialogOpen() {
      if (settingTimeWindow.value === 0) {
        period.value = settingPeriod.value.map((period) => new Date(period));
      } else {
        period.value = [
          lastDaysMapReverse.get(settingTimeWindow.value),
          endOfToday(),
        ];
      }
      settingsCheckList.value = metricsList.value;
    }

    function handleSave() {
      isSaveButtonLoading.value = true;
      saveMyPerformanceSettings({
        show_on_dashboard: settingsCheckList.value,
        time_window: getTimeWindow.value,
        start_time: period.value[0].getTime(),
        end_time: period.value[1].getTime(),
      })
        .then((res) => {
          metricsList.value =
            res?.dashboardMyPerformanceSettingDTO?.show_on_dashboard || [];
          settingsCheckList.value = metricsList.value;
          settingDialogVisible.value = false;
          settingTimeWindow.value =
            res.dashboardMyPerformanceSettingDTO?.time_window || 0;
          settingPeriod.value = [
            res.dashboardMyPerformanceSettingDTO?.start_time,
            res.dashboardMyPerformanceSettingDTO?.end_time,
          ];
          changeDataMap.value.patience = res.patience_change ?? null;
          changeDataMap.value.talkToListen = res.talk_to_listen_change ?? null;
          changeDataMap.value.talkSpeed = res.talk_speed_change ?? null;
          changeDataMap.value.longestMonolog = res.longest_monlog_change ?? null;
          changeDataMap.value.fillerWords = res.filler_words_change ?? null;
          changeDataMap.value.conversationPerDeal =
            res.conversation_per_deal_change ?? null;
          metricsData.value = getMetics(res);
        })
        .catch((e) => store.state.i18n.message.error(e.errorMessage))
        .finally(() => (isSaveButtonLoading.value = false));
    }

    function handleCancel() {
      settingDialogVisible.value = false;
      settingsCheckList.value = metricsList.value;
    }

    function getActiveIcon(type) {
      const kpi = getKpiRange()[type][0] || {};
      const value = metricsData.value[type];
      let activeType = Object.keys(kpi).find((rangeType) =>
        kpi[rangeType].some(
          ({ min, max }) => Number(min) <= value && Number(max) >= value
        )
      );
      return KPI_RANGE_ICON[activeType];
    }

    function rangeList(type) {
      const kpi = getKpiRange()[type]?.[0] || {};
      return Object.keys(kpi).map((rangeType) => {
        return {
          icon: KPI_RANGE_ICON[rangeType],
          text: getRangeText(type, rangeType),
        };
      });
    }

    function openSupportLink() {
      openLink(
        "https://support.zoom.us/hc/en-us/articles/5233822805389-Understanding-Zoom-IQ-for-Sales-metrics-and-analytics"
      );
    }

    function handleMetricClick(item) {
      drawerVisible.value = true;
      let from = {};
      if (item === "conversationPerDeal") {
        from = {
          tabKey: item,
          barTitle: dataOptionsMap.value[item].label,
          unit: dataOptionsMap.value[item].unit,
          kpiType: "conversationPerDeal",
        };
      } else {
        const values = Object.values(TYPES_CHART_CONFIG);
        from = values.find((i) => i.tabKey === item);
      }
      drawerParams.value = {
        name: currentUser.value.name,
        value: dataOptionsMap.value[item].data,
        id: currentUser.value.zm_user_id,
        timeWindow: settingTimeWindow.value
          ? store.state.i18n.t("dashboard.last_days", [settingTimeWindow.value])
          : dataPeriod.value,
        from,
      };
    }

    return {
      loading,
      metricsList,
      settingDialogVisible,
      isSaveButtonLoading,
      settingsCheckList,
      settingPeriod,
      settingTimeWindow,
      period,
      settingOptions,
      metricsData,
      drawerVisible,
      drawerParams,
      changeDataMap,
      currentUser,
      isSaveBtnDisabled,
      showWarningTip,
      getTimeWindow,
      dataOptionsMap,
      dataPeriod,
      drawerFilter,
      getChangeDisplay,
      formatDate,
      tooltipTitle,
      getMyPerformanceData,
      handlePeriodChange,
      handleDialogOpen,
      handleSave,
      handleCancel,
      getActiveIcon,
      rangeList,
      openSupportLink,
      handleMetricClick,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.my-performance {
  height: 100%;
  .title {
    font-weight: 600;
    font-size: 20px;
    height: 24px;
    line-height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
  }
  .description {
    height: 20px;
    line-height: 20px;
    display: flex;
    align-items: center;
    color: #6e7680;
    margin-bottom: 6px;
  }
  .metrics-container {
    height: calc(100% - 26px);
    margin-right: -4px;
    .metric {
      cursor: pointer;
      height: 84px;
      border-radius: 8px;
      position: relative;
      font-size: 14px;
      overflow: hidden;
      margin: 0 4px 8px 0;
      padding: 10px 8px 4px;
      &:hover {
        cursor: pointer;
        background-color: #f1f4f6;
      }
      .metric-title {
        display: flex;
        align-items: baseline;
        position: relative;
        z-index: 1;
        &-data {
          font-weight: 600;
          font-size: 24px;
          line-height: 32px;
        }
        &-unit {
          line-height: 20px;
        }
        .percentage {
          height: 20px;
          line-height: 20px;
          display: flex;
          align-items: center;
          margin-left: auto;
        }
      }
      .metric-desc {
        line-height: 20px;
        font-weight: 600;
        word-wrap: normal;
        position: relative;
        z-index: 1;
      }
      .recommended-text {
        font-size: 12px;
        color: #6e7680;
        line-height: 16px;
        margin-top: 2px;
      }
    }
  }
  .dialog-title {
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
  }
  .dialog-description {
    font-weight: 500;
    line-height: 20px;
    margin-bottom: 4px;
  }
  .date-title {
    font-weight: 500;
    line-height: 20px;
    margin: 16px 0 2px 0;
  }
}
.kpi-status-icon {
  z-index: 2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-size: contain !important;
  background-color: #fff !important;
}
.kpi-tooltip-icon {
  display: flex;
  align-items: center;
  min-width: 210px;
}
.recommended {
  background: url("~@assets/recommended.png") no-repeat center center;
  background-size: contain;
}
.neutral {
  background: url("~@assets/neutral.png") no-repeat center center;
  background-size: contain;
}
.note {
  background: url("~@assets/note.png") no-repeat center center;
  background-size: contain;
}
.caution {
  background: url("~@assets/caution.png") no-repeat center center;
  background-size: contain;
}
.kpi-status,
.kpi-tooltip,
::v-deep .zm-tooltip__popper {
  max-width: none;
  //  Remove svg once neutral icon is available in zoomui package
  .recommended {
    background: url("~@assets/recommended.png") no-repeat center center;
    background-size: contain;
  }
  .neutral {
    background: url("~@assets/neutral.png") no-repeat center center;
    background-size: contain;
  }
  .note {
    background: url("~@assets/note.png") no-repeat center center;
    background-size: contain;
  }
  .caution {
    background: url("~@assets/caution.png") no-repeat center center;
    background-size: contain;
  }
  // Enable this when neutral icon is available in zoomui package
  // .zm-icon-info {
  //   color: #c28030;
  // }
  // .zm-icon-success {
  //   color: #00a832;
  // }
  // .zm-icon-warning {
  //   color: #c28030;
  // }
  i {
    width: 14px;
    height: 14px;
    margin-right: 4px;
    border-radius: 50%;
    background-size: contain !important;
    background-color: #fff !important;
  }
}
.kpi-tooltip {
  div {
    margin-top: 8px;
  }
  ::v-deep .zm-button--link {
    color: #0e72ed;
    margin-top: 8px;
    line-height: 20px;
    padding: 0;
  }
}
h3.kpi-tooltip-text {
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  font-size: 14px;
  margin-bottom: 8px;
}
span.kpi-tooltip-text {
  color: #6e7680;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  font-size: 12px;
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  .footer-tip {
    color: #e8173d;
    white-space: pre-line;
    margin-right: 16px;
    text-align: left;
  }
  .foot-button-group {
    margin-left: auto;
    flex-shrink: 0;
  }
}
::v-deep .empty-content {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .no-content-tip {
    line-height: 20px;
    color: #6e7680;
    text-align: center;
  }
}
.skeleton-item {
  height: 82px;
  margin-bottom: 16px;
}

      </style>