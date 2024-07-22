<template>
<div>
  <div class="mgb-md" style="margin-left: -4px">
    <zm-button type="link" @click="backHome">
      <i class="zm-icon-left back-icon" />{{ $t("common.back") }}
    </zm-button>
  </div>
  <div v-loading="allLoading" style="min-height: 700px">
    <div v-if="allLoading" style="min-height: 700px" />
    <template v-else>
      <div class="mgb-md">
        <div class="title">
          <span v-if="isFromNotification">
            {{ $t("dashboard.mentions_of") }}
            <span v-if="isSingleKeyword">{{ singleKeyword || indicatorInfo.name }}</span>
            <span v-else-if="isSingleTheme">{{ singleTheme || indicatorInfo.name }}</span>
            <span v-else>{{ indicatorInfo.name }}</span>
          </span>
          <span v-else>{{ $t("dashboard.subscribed_indicators") }}</span>
        </div>
        <div v-if="indicatorInfo.mentioned_by && isFromNotification" class="description">
          <span v-if="isSingleKeyword">
            {{ $t("subscribe_description_keyword", { name: mentionedByLabel }) }}
          </span>
          <span v-else-if="isSingleTheme">
            {{ $t("subscribe_description_theme", { name: mentionedByLabel }) }}
          </span>
          <span v-else>
            {{ $t("indicator.subscribeDesc", { name: mentionedByLabel }) }}
          </span>
        </div>
      </div>
      <subscribed-indicator-tag
        :indicator-list="indicatorList"
        :indicator-info="indicatorInfo"
        v-model:active-name="activeName"
        @get-info="getIndicatorInfo(timeRange, $event)"
      />
      <div v-if="!allLoading && !loading" class="subscription">
        <div class="subscribe-info">
          <div class="left mgt-sm mgr-sm">
            <div v-if="!isInstantNotification && (isFromDashboard || computedTime)" class="first-row">
              <div class="time-display">
                <span v-if="isFromNotification">{{ computedTime }}</span>
                <span v-else-if="isFromDashboard">{{ $t("common.last_days", [30]) }}</span>
                <span v-else>{{ timeValue }}</span>
              </div>
            </div>
            <div class="grid-container">
              <div v-if="!isInstantNotification" class="mention-title mgb-sm">
                {{ mentionedByLabelSmall }}
              </div>
              <div v-if="!isInstantNotification" class="content mgb-sm">
                {{ $t("mentioned_by_tip", { percentage: indicatorInfo.mentionedRate || 0, conversationCount: indicatorInfo.conversationCount }) }}
              </div>
              <div v-if="!isSentenceOrAdvance && mentionedContent" class="mention-title mgb-sm">
                {{ mentionedTitle }}
              </div>
              <div v-if="!isSentenceOrAdvance && mentionedContent" class="content mgb-sm">
                {{ mentionedContent }}
              </div>
              <template v-if="isSentence">
                <div class="mention-title mgb-sm">
                  {{ $t("example_guiding_sentence") }}
                </div>
                <div class="content mgb-sm">
                  <span>{{ exampleSentences[0] || "-" }}</span>
                  <zm-button class="mgl-xs" style="height: 20px" type="link" @click="sentencesDialogVisible = true">
                    {{ $t("view_all_guiding_sentences") }}
                  </zm-button>
                </div>
              </template>
              <template v-if="isAdvance">
                <div class="mention-title mgb-sm">
                  {{ $t("keyword_phrases_with_additional_parameters") }}
                </div>
                <div class="content mgb-sm">
                  <zm-button style="height: 20px" type="link" @click="advanceDialogVisible = true">
                    {{ $t("recording.view_detail") }}
                  </zm-button>
                </div>
              </template>
              <template v-if="isInstantNotification">
                <div v-if="indicatorInfo.customerAccountNames" class="mention-title mgb-sm">
                  {{ $t("deal.customer") }}
                </div>
                <div v-if="indicatorInfo.customerAccountNames" class="content mgb-sm">
                  {{ indicatorInfo.customerAccountNames || "-" }}
                </div>
                <div v-if="indicatorInfo.dealName" class="mention-title mgb-sm">
                  {{ $t("analytics.tab_deal") }}
                </div>
                <div v-if="indicatorInfo.dealName" class="content mgb-sm">
                  {{ indicatorInfo.dealName || "-" }}
                </div>
              </template>
            </div>
          </div>
          <div v-if="!isFromNotification" class="right mgt-sm">
            <indicator-subscribe
              :indicator="indicatorInfo"
              @refresh-dashboard="initSubscribedIndicator"
              @subscription-change="refreshIndicatorInfo"
            />
          </div>
        </div>
      </div>
      <div
        v-if="indicatorList.length || isFromNotification"
        v-loading="loading"
        class="mgt-md"
        :style="{ ...(loading ? { height: '560px', overflow: 'hidden' } : {}) }"
      >
        <div v-if="Object.keys(listDataObj).length === 0 && !loading" class="no-content">
          {{ $t("common.no_result") }}
        </div>
        <div v-else-if="!loading" class="content-wrapper">
          <div
            v-for="(keywordInfo, key, i) in listDataObj"
            :key="key"
            class="content-item"
            :style="{ ...(isSentenceOrAdvance ? { border: 'none' } : {}) }"
          >
            <zm-sticky
              v-if="!isSentenceOrAdvance"
              :enabled="Object.keys(listDataObj).length !== 0"
              check-position="top"
              :offset="104"
              :z-index="100 + i"
              :sticky-height="40"
              append-cls="content-title"
            >
              <div class="content-title">
                <i
                  class="mgr-xs title-icon"
                  :class="dataVisibleMap[key] ? 'zm-icon-up' : 'zm-icon-down'"
                  @click="dataVisibleMap[key] = !dataVisibleMap[key]"
                />{{ key }}
              </div>
            </zm-sticky>
            <div
              v-for="(item, index) in computedKeywordInfo(key)"
              v-show="dataVisibleMap[key]"
              :key="index"
              class="transcript-info"
              :style="{ ...(isSentenceOrAdvance ? { marginLeft: '8px' } : {}) }"
            >
              <div class="text">
                "<zm-highlight-text
                  :content="handleHighlight(item.text)"
                  :matche-word-boundary="!isSentenceOrAdvance"
                  :highlight="highlightKeyword(item)"
                  highlight-class="text--highlight"
                />"
              </div>
              <div class="info">
                <div class="desc">
                  {{ $t("dashboard.mentioned_in") }}
                </div>
                {{ item.subject || "" }}
              </div>
              <div class="info">
                <div class="desc">
                  {{ $t("dashboard.hosted_by") }}
                </div>
                {{ item.hosted_by }}
              </div>
              <div class="info">
                <div class="desc">
                  {{ $t("deal.customer") }}
                </div>
                <span v-if="item.customer">{{ item.customer }}</span>
                <span v-else style="color: rgba(4, 4, 19, 0.56)">{{ $t("dashboard.no_customer") }}</span>
              </div>
              <div class="info">
                <div class="desc">
                  {{ $t("dashboard.deal_name") }}
                </div>
                <span v-if="item.deal_name">{{ item.deal_name }}</span>
                <span v-else style="color: rgba(4, 4, 19, 0.56)">{{ $t("dashboard.no_deal") }}</span>
              </div>
              <div class="info" style="margin-bottom: 12px">
                <div class="desc">
                  {{ $t("dashboard.mentioned_by") }}
                </div>
                {{ item.mentioned_by }} {{ $t("common.on") }} {{ formatDate(item.start_time) }}
              </div>
              <zm-button type="link" class="view-more-button" @click="goToRecordingDetail(item.conversation_id, key, keywordInfo)">
                {{ $t("dashboard.view_in_conv") }}
              </zm-button>
            </div>
            <zm-button
              v-if="isViewMoreVisible(key)"
              v-show="showViewMoreMap[key] && dataVisibleMap[key]"
              type="link"
              class="view-more"
              :loading="isViewMoreLoading(key)"
              @click="handleViewMoreClick(key)"
            >
              {{ $t("dashboard.view_more") }}
            </zm-button>
          </div>
        </div>
      </div>
      <zm-empty v-else-if="!allLoading && !isFromNotification" style="margin: 100px 0">
        <template #description>
          <p>
            {{ $t("dashboard.subscribed_indicators_will_appear_here") }}
          </p>
        </template>
        <zm-button type="primary" @click="toIndicatorSubscribe">
          {{ $t("dashboard.view_indicators") }}
        </zm-button>
      </zm-empty>
    </template>
  </div>
  <sentence-dialog
    :example-sentences="exampleSentences"
    v-model:sentences-dialog-visible="sentencesDialogVisible"
  />
  <advance-dialog
    v-model:advance-dialog-visible="advanceDialogVisible"
    :advance-keywords="advanceDetailIInfo"
  />
</div>
</template>
    <script lang="ts">
import { endOfToday, isThisYear, startOfDay, sub } from "date-fns";
import {
  getIndicatorKeywordInfoApi,
  getIndicatorListApi,
  getOneIndicatorInfoV2Api,
} from "@api/recording";
import { formatInTimeZone } from "shared/js/format-date";
import { isNumber } from "lodash-es";
import { defineComponent, ref, reactive, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { MENTIONED_BY, NOTIFY_TIME_TYPE } from "@components/indicators/consts";
import { openLink } from "@common/js/client";
import { getNotifications, getSubscribedIndicators } from "@api/dashboard-new";
import IndicatorSubscribe from "@views/analytics/components/indicator-subscribe";
import SentenceDialog from "@views/dashboard/dashboard-new/components/indicator/sentence-dialog";
import AdvanceDialog from "@views/dashboard/dashboard-new/components/indicator/advance-dialog";
import SubscribedIndicatorTag from "@views/dashboard/dashboard-new/components/indicator/subscribed-indicator-tag";

const MAX_DATE = endOfToday();
const MIN_DATE = startOfDay(sub(MAX_DATE, { days: 29 }));

export default defineComponent({
  name: "IndicatorMentioned",
  components: {
    SubscribedIndicatorTag,
    AdvanceDialog,
    SentenceDialog,
    IndicatorSubscribe,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const loading = ref(false);
    const allLoading = ref(true);
    const indicatorInfo = reactive({});
    const listDataObj = reactive({});
    const totalCount = ref(0);
    const formData = reactive({ period: [MIN_DATE, MAX_DATE] });
    const showViewMoreMap = reactive({});
    const dataVisibleMap = reactive({});
    const viewMoreLoadingMap = reactive({});
    const indicatorList = ref([]);
    const activeName = ref("");
    const timeRange = ref([]);
    const sentencesDialogVisible = ref(false);
    const advanceDialogVisible = ref(false);

    const topSixIndicatorList = computed(() => store.state.dashboard.topSixIndicatorList);
    const notificationList = computed(() => store.state.dashboard.notificationList);
    const currentUser = computed(() => store.state.currentUser);

    const isFromNotification = computed(() => route.query?.notifyId);
    const advanceDetailIInfo = computed(() => isFromNotification.value ? mentionedContent.value : indicatorInfo.advance_keywords);
    const isFromDashboard = computed(() => route.query?.fromDashboard);
    const isSentence = computed(() => indicatorInfo?.type === 3);
    const exampleSentences = computed(() => indicatorInfo?.sentences || []);
    const isAdvance = computed(() => indicatorInfo?.type === 2);
    const isSentenceOrAdvance = computed(() => isSentence.value || isAdvance.value);
    const isTheme = computed(() => indicatorInfo?.type === 4);
    const isInstantNotification = computed(() => isFromNotification.value && !indicatorInfo.notifyType);
    const mentionedTitle = computed(() => isSingleTheme.value || isSingleKeyword.value ? store.getters["analytics/tab_indicator"] : isTheme.value ? store.getters["themes_mentioned"] : store.getters["keywords_mentioned"]);
    const mentionedContent = computed(() => isSingleTheme.value || isSingleKeyword.value ? indicatorInfo.name : Object.keys(listDataObj)?.join(", "));
    const mentionedByLabel = computed(() => {
      switch (indicatorInfo.mentioned_by) {
        case MENTIONED_BY.anyone:
          return store.getters["indicator/subscribeMentionedAnyone"];
        case MENTIONED_BY.allReps:
          return store.getters["indicator/subscribeMentionedAllReps"];
        case MENTIONED_BY.prospects:
          return store.getters["indicator/subscribeMentionedProspects"];
      }
      return "";
    });
    const mentionedByLabelSmall = computed(() => {
      switch (indicatorInfo.mentioned_by) {
        case MENTIONED_BY.anyone:
          return store.getters["dashboard/mentioned_by_anyone"];
        case MENTIONED_BY.allReps:
          return store.getters["dashboard/mentioned_by_reps"];
        case MENTIONED_BY.prospects:
          return store.getters["dashboard/mentioned_by_prospect"];
      }
      return "";
    });
    const computedTime = computed(() => {
      switch (parseInt(indicatorInfo.notifyType)) {
        case NOTIFY_TIME_TYPE.daily:
          return indicatorInfo.startTime || "";
        default:
          return `${indicatorInfo.startTime || ""} - ${indicatorInfo.endTime || ""}`;
      }
    });
    const timeValue = computed(() => {
      const timeRange = route.query?.range?.split(",").map((time) => parseInt(time));
      if (!timeRange?.[0] || !timeRange?.[1]) {
        return "";
      }
      const startDate = formatDateShort(timeRange?.[0]);
      const endDate = formatDateShort(timeRange?.[1]);
      return `${startDate} - ${endDate}`;
    });
    const isSingleKeyword = computed(() => (indicatorInfo?.type === 1 || indicatorInfo?.type === 2) && indicatorInfo?.texts?.length === 1 && indicatorInfo.subscribeType === 1);
    const singleKeyword = computed(() => indicatorInfo?.texts?.[0] || "");
    const isSingleTheme = computed(() => isTheme.value && indicatorInfo?.themeDetailDtos?.length === 1 && indicatorInfo?.subscribeType === 1);
    const singleTheme = computed(() => indicatorInfo?.themeDetailDtos?.[0]?.themeName || "");

    watch(formData, () => {
      fetchKeywordsData();
    }, { deep: true, immediate: true });

    onMounted(() => {
      if (route.query?.range) {
        initSubscribedIndicator();
      } else if (isFromNotification.value) {
        const existNotification = notificationList.value.find((item) => item.id === route.query?.notifyId);
        if (existNotification) {
          const meetingId = existNotification?.meeting_id || "";
          handleNotificationObj(existNotification.text, meetingId);
          allLoading.value = false;
        } else {
          getNotifications({
            page_size: 1,
            notify_id: route.query?.notifyId || "",
          })
            .then((res) => {
              const infoObj = res?.notifications?.[0]?.text;
              const meetingId = res?.notifications?.[0]?.meeting_id || "";
              handleNotificationObj(infoObj, meetingId);
            })
            .catch((e) => store.dispatch("message/error", e.errorMessage))
            .finally(() => (allLoading.value = false));
        }
      }
    });

    const fetchKeywordsData = () => {
      if (!indicatorInfo?.indicator_id) return;
      loading.value = true;
      const { keywords, theme_ids, period } = formData;

      const {
        indicator_by,
        host_by,
        mentioned_teams,
        mentioned_users,
        stages,
        customer_accounts,
        deals,
      } = indicatorInfo;
      let host_by_team_ids = [];
      let host_by_user_ids = [];
      if (host_by === 3) {
        host_by_team_ids = mentioned_teams.map((team) => team.id);
        host_by_user_ids = mentioned_users.map((user) => user.id);
      }
      getIndicatorKeywordInfoApi({
        indicator_id: indicatorInfo.indicator_id,
        key_words: keywords ? [keywords] : indicatorInfo.keywords || [],
        theme_ids: theme_ids ? [theme_ids] : indicatorInfo.theme_ids || [],
        start_time: period[0].getTime(),
        end_time: period[1].getTime(),
        indicator_type: indicatorInfo.type,
        page_size: 3,
        ...(isInstantNotification.value
          ? { meeting_id: indicatorInfo.meeting_id || "" }
          : {}),
        host_by,
        host_by_team_ids,
        host_by_user_ids,
        indicator_by: indicator_by || 0,
        stages: stages?.map((item) => item.id) || [],
        customer_accounts: customer_accounts?.map((item) => item.id) || [],
        deal_ids: deals?.map((item) => item.id) || [],
        advance_keyword: indicatorInfo.advance_keywords || "",
      })
        .then((res) => {
          listDataObj.value = res.data || {};
          totalCount.value = res.total_transcripts;
          for (let key in listDataObj.value) {
            const details = listDataObj.value[key]?.details || [];
            const hasMore = listDataObj.value[key]?.view_more || false;
            if (details.length <= 3 && !hasMore) {
              showViewMoreMap[key] = {
                visible: false,
                remainCount: 0,
              };
            } else {
              showViewMoreMap[key] = {
                visible: true,
                remainCount: details.length - 3,
                remoteHasMore: hasMore,
              };
            }
            dataVisibleMap[key] = true;
          }
          if (!isFromNotification.value) {
            indicatorInfo.mentionedRate = Math.floor(res.mentioned_rate * 100);
            indicatorInfo.conversationCount = res.total_conversations;
          }
        })
        .catch((e) => {
          store.dispatch("message/error", e.message);
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const handleNotificationObj = (infoObj, meetingId) => {
      const notificationObj = infoObj ? JSON.parse(infoObj) : {};
      Object.assign(indicatorInfo, {
        ...notificationObj,
        name: notificationObj.indicatorName,
        mentioned_by: parseInt(notificationObj.mentionedBy),
        indicator_id: notificationObj.indicatorId,
        type: parseInt(notificationObj.indicatorType),
        mentionedRate: parseInt(notificationObj.mentionedRatePercentage),
        conversationCount: parseInt(notificationObj.totalConversations),
        indicator_theme_dto_list: notificationObj.themeDetailDtos || [],
        keywords: notificationObj.texts || [],
        sentences: notificationObj.texts || [],
        ...(meetingId ? { meeting_id: meetingId } : {}),
        ...(parseInt(notificationObj.indicatorType) === 4
          ? {
              theme_ids:
                notificationObj.themeDetailDtos?.map(
                  (theme) => theme.themeId
                ) || [],
            }
          : { keywords: notificationObj.texts || [] }),
      });
      formData.period = [
        notificationObj.startTimeSec,
        notificationObj.endTimeSec,
      ].map((time) => new Date(parseInt(time)));
    };

    const initSubscribedIndicator = () => {
      const timeRange = route.query.range
        .split(",")
        .map((time) => parseInt(time));
      timeRange.value = timeRange;
      allLoading.value = true;
      if (topSixIndicatorList.value?.length) {
        getIndicatorList(topSixIndicatorList.value, timeRange);
      } else {
        let topSixList = [];
        getSubscribedIndicators()
          .then((res) => {
            topSixList = res.indicator_mentioned_dto_list || [];
            store.commit("dashboard/UPDATE_TOP_SIX_INDICATOR_LIST", topSixList);
            getIndicatorList(topSixList, timeRange);
          })
          .catch((e) => {
            store.dispatch("message/error", e.message);
          });
      }
    };

    const handleBackendData = (res = {}, timeRange) => {
      return {
        indicator_id: res.indicatorViewItemDto?.indicator_id,
        name: res.indicatorViewItemDto?.name,
        host_by: res.notify_mentioned_type,
        category: res.indicatorViewItemDto?.category,
        mentioned_by: res.indicatorViewItemDto?.mentioned_by,
        keywords: res.subscription_type
          ? res.keywords
          : res.indicatorViewItemDto?.keywords,
        theme_ids: res.subscription_type
          ? res.theme_ids
          : res.indicatorViewItemDto?.theme_ids,
        indicator_theme_dto_list: res.subscription_type
          ? res.indicator_theme_dto_list || []
          : res.indicatorViewItemDto?.indicator_theme_dto_list || [],
        type: res.indicatorViewItemDto?.type,
        period: timeRange,
        subscribe: true,
        indicator_by: res.indicatorViewItemDto?.mentioned_by,
        mentioned_teams: res.mentioned_teams || [],
        mentioned_users: res.mentioned_users || [],
        ignore_keywords: res.indicatorViewItemDto?.ignore_keywords || [],
        advance_keywords: res.indicatorViewItemDto?.advance_keywords?.[0] || "",
        include_related: res.indicatorViewItemDto?.include_related,
        stages: res.stages || [],
        customer_accounts: res.customer_accounts || [],
        deals: res.deals || [],
        allKeywords: res.indicatorViewItemDto?.keywords || [],
        allThemes: res.indicatorViewItemDto?.indicator_theme_dto_list || [],
        sentences: res.indicatorViewItemDto?.sentences || [],
      };
    };

    const getIndicatorList = (topSixList = [], timeRange) => {
      getIndicatorListApi()
        .then((res) => {
          indicatorList.value =
            res?.map((info) => {
              return handleBackendData(info, timeRange);
            }) || [];
          if (topSixList.length && indicatorList.value.length) {
            const topSixArr = [];
            for (let i = 0; i < 6; i++) {
              if (topSixList[i]) {
                const findIndicatorIndex = indicatorList.value.findIndex(
                  (indicator) =>
                    indicator.indicator_id === topSixList[i].indicator_id
                );
                if (findIndicatorIndex >= 0) {
                  topSixArr.push(indicatorList.value[findIndicatorIndex]);
                  indicatorList.value.splice(findIndicatorIndex, 1);
                }
              }
            }
            indicatorList.value = [...topSixArr, ...indicatorList.value];
          }
          getIndicatorInfo(timeRange);
        })
        .catch((e) => {
          store.dispatch("message/error", e.message);
        })
        .finally(() => {
          allLoading.value = false;
        });
    };

    const getIndicatorInfo = (timeRange, indicatorId = route.params.id) => {
      indicatorInfo.value =
        indicatorList.value.find((item) => item.indicator_id === indicatorId) ||
        indicatorList.value?.[0] ||
        {};
      activeName.value = indicatorInfo.value.name;
      formData.period = timeRange.map((time) => new Date(time));
      formData.keywords = route.query.keyword || "";
      if (isTheme.value) {
        formData.theme_ids = route.query.theme_id || "";
      }
    };

    const refreshIndicatorInfo = () => {
      const usedMethod = getOneIndicatorInfoV2Api;
      loading.value = true;
      usedMethod(indicatorInfo.value.indicator_id)().then((res) => {
        indicatorInfo.value = handleBackendData(res);
        const indicatorIndex = indicatorList.value.findIndex(
          (item) => item.indicator_id === indicatorInfo.value?.indicator_id
        );
        if (indicatorIndex >= 0) {
          indicatorList.value[indicatorIndex] = indicatorInfo.value;
        }
        fetchKeywordsData();
      });
    };

    const backHome = () => {
      router.back();
    };

    const toIndicatorSubscribe = () => {
      openLink("/profile/setting?tab=iq&f=indicator-subscribe");
    };

    const goToRecordingDetail = (id, key, keyInfo) => {
      router.push({
        name: "recording-detail",
        query: {
          meetingId: id,
          tab: "content/transcript",
          ...(isSentenceOrAdvance.value
            ? {
                trackersQueryKey: "indicators",
                trackersQueryChildKey: indicatorInfo.value.name,
              }
            : isTheme.value
            ? {
                trackersQueryKey: "indicators",
                trackersQueryChildKey: indicatorInfo.value.name,
                theme_id: keyInfo.theme_id,
              }
            : { keyword: key }),
        },
      });
    };

    const formatDate = (date) => {
      if (!date || !isNumber(date)) {
        return "-";
      }
      if (isThisYear(date)) {
        return formatInTimeZone(date, "MMM dd, h:mm a");
      } else {
        return formatInTimeZone(date, "MMM dd yyyy, h:mm a");
      }
    };

    const formatDateShort = (date) => {
      if (!date || !isNumber(date)) {
        return "-";
      }
      if (isThisYear(date)) {
        return formatInTimeZone(date, "MMM dd");
      } else {
        return formatInTimeZone(date, "MMM dd, yyyy");
      }
    };

    const isViewMoreVisible = (key) => {
      return showViewMoreMap[key]?.visible || false;
    };

    const handleViewMoreClick = (key) => {
      if (showViewMoreMap[key].remoteHasMore) {
        if (showViewMoreMap[key].remainCount < 10) {
          viewMoreLoadingMap[key] = true;
          const { period } = formData;
          const keywordDetail = listDataObj[key]?.details || [];
          const keywordLastTranscript = keywordDetail[keywordDetail.length - 1];
          const {
            indicator_by,
            host_by,
            mentioned_teams,
            mentioned_users,
            stages,
            customer_accounts,
            deals,
          } = indicatorInfo;
          let host_by_team_ids = [];
          let host_by_user_ids = [];
          if (host_by === 3) {
            host_by_team_ids = mentioned_teams.map((team) => team.id);
            host_by_user_ids = mentioned_users.map((user) => user.id);
          }
          getIndicatorKeywordInfoApi({
            indicator_id: indicatorInfo?.indicator_id || "",
            ...(isSentence.value
              ? {}
              : isAdvance.value
              ? { advance_keyword: indicatorInfo.advance_keywords || "" }
              : isTheme.value
              ? { theme_ids: [listDataObj[key]?.theme_id] }
              : { key_words: [key] }),
            start_time: period[0].getTime(),
            end_time: keywordLastTranscript.start_time - 1,
            indicator_type: indicatorInfo.type,
            page_size: 10,
            indicator_by: indicator_by || 0,
            ...(isInstantNotification.value
              ? { meeting_id: indicatorInfo.meeting_id || "" }
              : {}),
            host_by,
            host_by_team_ids,
            host_by_user_ids,
            stages: stages?.map((item) => item.id) || [],
            customer_accounts: customer_accounts?.map((item) => item.id) || [],
            deal_ids: deals?.map((item) => item.id) || [],
          })
            .then((res) => {
              const viewMoreDetails = res.data?.[key]?.details || [];
              const hasMore = res.data?.[key]?.view_more || false;
              if (listDataObj?.[key]) {
                listDataObj[key] =
                  {
                    details:
                      listDataObj[key].details?.concat(viewMoreDetails),
                    view_more: hasMore,
                    theme_id: listDataObj[key].theme_id,
                  } || {};</script>
    <style lang="scss" scoped>
        
.title {
  font-weight: 700;
  font-size: 24px;
  line-height: 28px;
  margin-bottom: 4px;
}
.description {
  color: rgba(4, 4, 19, 0.56);
  font-weight: 400;
  line-height: 20px;
}
.select-keywords {
  width: 320px;
  margin-bottom: 8px;
  display: block;
  ::v-deep .zm-icon-search {
    color: #6e7680;
  }
  ::v-deep .zm-select-input {
    padding-left: 4px;
  }
  ::v-deep .zm-select-prefix {
    margin: 0;
  }
}
.date-select {
  ::v-deep .date-button {
    width: 208px;
  }
}
.total-count {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #6e7680;
  margin: 8px 0 32px;
}
.no-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 220px 0;
  line-height: 24px;
  color: #6e7680;
}
.content-item {
  border-bottom: 1px solid #dfe3e8;
  margin-bottom: 18px;
  .transcript-info {
    margin: 0 0 16px 18px;
    .text {
      font-weight: 400;
      line-height: 16px;
      margin-bottom: 16px;
    }
    .info {
      position: relative;
      padding-left: 122px;
      font-weight: 400;
      line-height: 20px;
      height: 20px;
      margin-bottom: 8px;
      .desc {
        position: absolute;
        left: 0;
        font-weight: 400;
        line-height: 20px;
        color: rgba(4, 4, 19, 0.56);
      }
    }
    .view-more-button {
      font-weight: 400;
      padding: 0;
      line-height: 20px;
    }
    &::v-deep .text--highlight {
      color: #222230;
      background: rgb(246, 192, 86);
    }
  }
}

.panel {
  width: 418px;
  display: inline-block;
  margin-bottom: 8px;
}
.deal-filter {
  ::v-deep .reference-button {
    z-index: 0;
  }
}
.view-more {
  font-weight: 400;
  padding: 0;
  line-height: 20px;
  margin-bottom: 16px;
}
.content-title {
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  padding-bottom: 16px;
  background: #ffffff;
  width: 100%;
  .title-icon {
    font-size: 14px;
    color: #6e7680;
    position: relative;
    top: 1px;
  }
}
.subscription {
  &:hover {
    .subscription-title-btn {
      display: inline-flex;
    }
  }
  &-title {
    height: 20px;
    overflow: hidden;
    &-text {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: #6e7680;
    }
    &-btn {
      display: none;
      height: 20px;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      margin-left: 16px;
    }
  }
  .subscribe-info {
    display: flex;
    justify-content: space-between;
    .mention-title {
      font-weight: 600;
      white-space: nowrap;
      margin-right: 32px;
    }
    .content {
      overflow: hidden;
      display: flex;
      align-items: center;
    }
    .first-row {
      margin-bottom: 16px;
      font-size: 20px;
      font-weight: 600;
      line-height: 24px;
    }
    .second-row {
      display: flex;
      line-height: 20px;
    }
  }
}
.grid-container {
  overflow: hidden;
  width: 100%;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: 1fr max-content;
}

      </style>