<template>
<div class="wrapper">
  <zm-row type="flex" align="center">
    <zm-col :span="12">
      <span class="title">
        {{ $t("upcoming_conversations") }}
        <zm-tooltip
          v-if="hasIntegrateCalendarService"
          :content="lastRefreshDateI18n"
          placement="top"
        >
          <zm-button
            ghost
            class="mgl-sm refresh-button"
            :class="refreshingMeeting ? 'loading' : ''"
            icon="zm-icon-refresh"
            @click="refreshUpComingMeetings"
          />
        </zm-tooltip>
      </span>
    </zm-col>
  </zm-row>
  <zm-skeleton :loading="loading" animated style="height: calc(100% - 24px)">
    <template #template>
      <div style="font-size: 0">
        <zm-skeleton-item class="mgt-md skeleton-item-first" />
        <zm-skeleton-item class="skeleton-item-second" />
      </div>
    </template>
    <!--  for the style wrong display because the css isolation by vue  -->
    <div style="height: 100%">
      <div
        v-if="!hasIntegrateCalendarService"
        class="content-tip no-calendar"
      >
        <img src="@/assets/calender.svg" />
        <p>{{ $t("no_integrate_calendar_tips") }}</p>
        <p>
          <zm-button type="link" @click="openSettingLink">
            {{ $t("go_to_settings") }}
          </zm-button>
        </p>
      </div>
      <div v-else-if="meetingList.length === 0" class="no-meeting gray">
        <img src="@/assets/empty.svg" />
        <p>{{ $t("you_do_not_have_upcoming_conversations") }}</p>
      </div>
      <div v-else class="content">
        <zm-scrollbar
          class="zm-scrollbar__focus"
          wrap-style="height: 290px;"
          view-style="padding-right: 16px"
          @scroll-end="onScrollEnd"
        >
          <zm-collapse
            accordion
            class="collapse-wrapper"
            @change="handleCollapseChanged"
          >
            <zm-collapse-item
              v-for="(meeting, meetingIndex) in meetingList"
              :key="meetingIndex + meeting.eventId"
              :name="meeting.eventId"
            >
              <template #title>
                <meeting-header
                  :meeting="meeting"
                  :meeting-index="meetingIndex"
                  class="meeting-header-wrapper"
                />
              </template>
              <meeting-deal-info
                :meeting-index="meetingIndex"
                :meeting="meeting"
                :my-key="meetingIndex + meeting.eventId"
                :deal-info="cachedDealInfoList[meeting.eventId]"
                :loading-deal="
                  !!loadingDeals.find(
                    (eventId) => eventId === meeting.eventId
                  )
                "
                @import-deal="openImportDealDialog(meeting.eventId)"
              />
            </zm-collapse-item>
          </zm-collapse>
          <div
            v-show="loadingNextPage"
            v-loading="loadingNextPage"
            class="mgt-md zm-select__loading"
            style="z-index: 10"
          />
        </zm-scrollbar>
      </div>
    </div>
  </zm-skeleton>
  <import-deal-dialog
    v-if="editingEventID"
    :visible="showEditDealDialog"
    :deal-info="getDealInfoByIndex(editingEventID).deal"
    :lead-info="getDealInfoByIndex(editingEventID).lead"
    is-upcoming
    :meeting-id="editingEventID"
    @close="closeImportDealDialog"
    @refreshDealInfo="dealInfoGetter(editingEventID, true)"
  />
</div>
</template>
    <script lang="ts">
import { cloneDeep, isEmpty } from "lodash-es";
import { formatInTimeZone } from "shared/js/format-date";
import { useStore } from "vuex";
import { sleep } from "shared/js/utils";
import {
  getUpcomingMeetingListApi,
  getBindingDealApi,
} from "@api/dashboard-new";
import { openLink } from "@common/js/client";
import ImportDealDialog from "@views/recording-detail/components/import-deal-dialog";
import MeetingDealInfo from "./meeting-deal-info";
import MeetingHeader from "./meeting-header";
import { defineComponent, ref, computed, onMounted } from "vue";

export default defineComponent({
  name: "UpcomingConversations",
  components: { ImportDealDialog, MeetingHeader, MeetingDealInfo },
  setup() {
    const store = useStore();
    const loading = ref(false);
    const loadingNextPage = ref(true);
    const page = ref(1);
    const hasMore = ref(false);
    const meetingList = ref([]);
    const cachedDealInfoList = ref({});
    const lastRefreshDateI18n = ref(
      store.$t("last_updated", {
        time: formatInTimeZone(Date.now(), "HH:mm a, MMM dd"),
      })
    );
    const showEditDealDialog = ref(false);
    const tryPollingErrorTimes = ref({});
    const hasIntegrateCalendarService = ref(true);
    const refreshingMeeting = ref(false);
    const loadingDeals = ref([]);
    const editingEventID = ref(null);

    const currentUser = computed(() => store.state.currentUser);

    const meetingListGetter = async (pageNum = 1) => {
      if (pageNum === 1) {
        loading.value = true;
      } else {
        loadingNextPage.value = true;
      }
      const PAGE_SIZE = 9;
      return getUpcomingMeetingListApi({
        page: pageNum,
        page_size: PAGE_SIZE,
      })
        .then((res = {}) => {
          const { meetings = [], hasIntegrateCalendarService: hasService = false } = res;
          const { data: meetingData = [], page: resPage, total } = meetings || {};
          hasIntegrateCalendarService.value = hasService;
          if (meetings == null) {
            return;
          }
          hasMore.value = resPage * PAGE_SIZE < total;
          page.value = resPage;
          const nextPageMeetings = meetingData?.slice().sort((a, b) => {
            return new Date(a.startTime) - new Date(b.startTime);
          });
          meetingList.value.push(...nextPageMeetings);
        })
        .finally(() => {
          loading.value = false;
          loadingNextPage.value = false;
        });
    };

    const dealInfoGetter = async (eventId, forceUpdate = false) => {
      if (!eventId) {
        return Promise.resolve();
      }
      const cachedDealInfo = cachedDealInfoList.value[eventId];
      if (cachedDealInfo && forceUpdate === false) {
        return Promise.resolve();
      }
      updateRefreshDate();
      loadingDeals.value = [...new Set([...loadingDeals.value, eventId])];
      const newDealInfo = await getBindingDealApi({
        event_id: eventId,
      }).catch((err) => {
        store.$message.error(err.message);
      });
      const normalizeDealInfo = (date = {}) => {
        const { deal, last_activity, lead } = date;
        const sorted_next_steps = cloneDeep(last_activity?.next_steps || [])
          .map((item) => {
            return item.section?.[0];
          })
          .sort((a, b) => {
            return a?.item_id - b?.item_id;
          });
        return {
          deal,
          lead,
          last_activity: {
            ...last_activity,
            next_steps: sorted_next_steps,
          },
        };
      };
      const handleAfterPolling = () => {
        tryPollingErrorTimes.value[eventId] = 0;
        loadingDeals.value = loadingDeals.value.filter(
          (item) => item !== eventId
        );
        cachedDealInfoList.value = {
          ...cachedDealInfoList.value,
          [eventId]: normalizeDealInfo(newDealInfo),
        };
      };
      if (
        isEmpty(newDealInfo?.deal || newDealInfo?.lead) &&
        newDealInfo?.hasBound === true
      ) {
        tryPollingErrorTimes.value[eventId] ||= 0;
        ++tryPollingErrorTimes.value[eventId];
        if (tryPollingErrorTimes.value[eventId] < 3) {
          await sleep(10 * 1000);
          await dealInfoGetter(eventId, forceUpdate);
        } else {
          handleAfterPolling();
        }
      } else {
        handleAfterPolling();
      }
      return Promise.resolve();
    };

    const openSettingLink = () => {
      openLink("/profile");
    };

    const updateRefreshDate = () => {
      lastRefreshDateI18n.value = store.$t("last_updated", {
        time: formatInTimeZone(Date.now(), "HH:mm a, MMM dd"),
      });
    };

    const refreshUpComingMeetings = () => {
      refreshingMeeting.value = true;
      meetingList.value = [];
      cachedDealInfoList.value = {};
      loadingDeals.value = [];
      meetingListGetter().finally(() => {
        refreshingMeeting.value = false;
      });
    };

    const openImportDealDialog = (eventId) => {
      editingEventID.value = eventId;
      nextTick(() => {
        showEditDealDialog.value = true;
      });
    };

    const closeImportDealDialog = () => {
      showEditDealDialog.value = false;
    };

    const getDealInfoByIndex = (eventId) => {
      return cachedDealInfoList.value[eventId] || {};
    };

    const handleCollapseChanged = (activeEventId) => {
      dealInfoGetter(activeEventId);
    };

    const onScrollEnd = () => {
      if (!(loading.value || loadingNextPage.value) && hasMore.value) {
        page.value++;
        meetingListGetter(page.value);
      }
    };

    onMounted(() => {
      meetingListGetter();
    });

    return {
      loading,
      loadingNextPage,
      page,
      hasMore,
      meetingList,
      cachedDealInfoList,
      lastRefreshDateI18n,
      showEditDealDialog,
      tryPollingErrorTimes,
      hasIntegrateCalendarService,
      refreshingMeeting,
      loadingDeals,
      editingEventID,
      currentUser,
      meetingListGetter,
      dealInfoGetter,
      openSettingLink,
      updateRefreshDate,
      refreshUpComingMeetings,
      openImportDealDialog,
      closeImportDealDialog,
      getDealInfoByIndex,
      handleCollapseChanged,
      onScrollEnd,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.wrapper {
  height: 100%;
  padding-top: 14px !important;
}
.content {
  height: calc(100% - 48px);
  color: #131619;
  .collapse-wrapper {
    border-top: 0px;
    ::v-deep .zm-collapse-item {
      &.is-active {
        .arrow {
          transform: rotate(90deg);
        }
        .meeting-header-wrapper {
          border-bottom-color: transparent;
        }
      }
      .meeting-header-wrapper {
        border-bottom: 1px solid #dfe3e8;
      }

      .zm-collapse-item__header {
        padding: 16px 0px 10px 0px;
        padding: 0;
        margin: 0;
        border-bottom: 0;
        color: #131619;

        .zm-collapse-item__arrow {
          display: none;
          float: left;
          font-size: 14px;
        }
      }
      .zm-collapse-item__content {
        padding-bottom: 8px;
      }
    }
  }
}

.content-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #444b53;
}
.title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  height: 24px;
  color: #131619;
}

.refresh-button {
  height: 34px;
  display: flex;
  align-items: center;
}

.no-calendar {
  flex-direction: column;
  height: 100%;
}
.no-meeting {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.loading {
  animation: rotating 1.2s linear infinite;
}

.skeleton-item-first {
  height: 40px;
  margin-bottom: 16px;
}
.skeleton-item-second {
  height: 216px;
}

      </style>