<template>
<div style="overflow: hidden">
  <div class="mgb-md" style="margin-left: -4px">
    <zm-button type="link" @click="backHome">
      <i class="zm-icon-left back-icon" />{{ $t("common.back") }}
    </zm-button>
  </div>
  <div class="notification-header">
    <span class="title">{{ $t("dashboard.notifications") }}</span>
    <zm-button
      v-if="notificationEnable"
      type="primary"
      ghost
      icon="zm-icon-settings-outline"
      @click="goToSettings"
    >
      {{ $t("notification_settings") }}
    </zm-button>
  </div>
  <zm-tabs
    v-model:activeName="currentType"
    class="notification-type mgt-lg"
    type="capsule"
  >
    <zm-tab-pane
      v-for="item in NOTIFY_TYPE"
      :key="item.type"
      :label="item.text"
      :name="item.type"
    >
      <template #label>
        <div style="position: relative">
          {{ item.text }}
          <div v-if="readStatus[item.type]" class="red-dot" />
        </div>
      </template>
    </zm-tab-pane>
  </zm-tabs>
  <div v-if="notificationEnable" class="unread-options">
    <span class="mgr-sm">{{ $t("show_unread_only") }}</span>
    <zm-switch
      v-model:checked="isShowUnread"
      size="small"
      @change="handleIsUnreadChange"
    />
    <zm-button type="link" class="mgl-md" @click="handleMarkAllRead">{{
      $t("mark_all_as_read")
    }}</zm-button>
  </div>
  <div
    v-loading="loading"
    style="min-height: 400px; margin-left: -16px"
    class="mgt-lg"
  >
    <div v-if="notificationList.length && !loading">
      <div v-show="notificationTodayList.length" class="day-part">
        <div class="day-title">{{ $t("common.today") }}</div>
        <transition-group name="slide">
          <notification-card
            v-for="notification in notificationTodayList.filter(
              (item) => item.biz_type <= 17
            )"
            :key="notification.id"
            :notification="notification"
            :view-more-loading.sync="viewMoreLoading"
            is-from-detail
            @delete-one="handleDelete"
            @read-change="updateReadStatus"
          />
        </transition-group>
      </div>
      <div v-show="notificationYesterdayList.length" class="day-part">
        <div class="day-title">{{ $t("common.yesterday") }}</div>
        <transition-group name="slide">
          <notification-card
            v-for="notification in notificationYesterdayList.filter(
              (item) => item.biz_type <= 17
            )"
            :key="notification.id"
            :notification="notification"
            :view-more-loading.sync="viewMoreLoading"
            is-from-detail
            @delete-one="handleDelete"
            @read-change="updateReadStatus"
          />
        </transition-group>
      </div>
      <div v-show="notificationOlderList.length" class="day-part">
        <div
          v-if="
            notificationTodayList.length || notificationYesterdayList.length
          "
          class="day-title"
        >
          {{ $t("older") }}
        </div>
        <transition-group name="slide">
          <notification-card
            v-for="notification in notificationOlderList.filter(
              (item) => item.biz_type <= 17
            )"
            :key="notification.id"
            :notification="notification"
            :view-more-loading.sync="viewMoreLoading"
            is-from-detail
            @delete-one="handleDelete"
            @read-change="updateReadStatus"
          />
        </transition-group>
      </div>
      <div v-show="haveMore" key="view-more" class="view-more">
        <div
          v-if="viewMoreLoading"
          v-loading="viewMoreLoading"
          class="spinner-container"
        />
        <zm-button
          v-else
          type="link"
          :loading="viewMoreLoading"
          @click="
            () => {
              handleViewMoreClick();
            }
          "
        >
          {{ $t("common.view_more") }}
        </zm-button>
      </div>
    </div>
    <div v-else-if="!loading" style="margin-top: 100px">
      <zm-empty
        :description="$t('dashboard.notifications_will_appear_here')"
      />
    </div>
  </div>
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { openLink } from "@common/js/client";
import {
  deleteNotification,
  getNotifications,
  getReadStatus,
  setNotificationRead,
} from "@api/dashboard-new";
import NotificationCard from "@views/dashboard/dashboard-new/components/1-2-notifications/notification-card";
import { startOfYesterday, startOfToday } from "date-fns";
import { cloneDeep } from "lodash-es";

export default defineComponent({
  name: "NotificationDetail",
  components: { NotificationCard },
  setup() {
    const store = useStore();
    const NOTIFY_TYPE = ref([
      {
        type: "all",
        text: store.getters["i18n/t"]("all_notifications"),
      },
      {
        type: "conversations",
        text: store.getters["i18n/t"]("recording_page_title"),
      },
      {
        type: "comments",
        text: store.getters["i18n/t"]("common.comments"),
      },
      {
        type: "playlist",
        text: store.getters["i18n/t"]("recording.playlists"),
      },
      {
        type: "indicators",
        text: store.getters["i18n/t"]("indicators"),
      },
      {
        type: "coaching",
        text: store.getters["i18n/t"]("coaching.page_title"),
      },
      {
        type: "deal_risk",
        text: store.getters["i18n/t"]("deal_risk_signals"),
      },
    ]);
    const currentType = ref("all");
    const isShowUnread = ref(false);
    const notificationList = ref([]);
    const notificationTodayList = ref([]);
    const notificationYesterdayList = ref([]);
    const notificationOlderList = ref([]);
    const viewMoreLoading = ref(false);
    const haveMore = ref(false);
    const loading = ref(false);
    const readStatus = ref({});

    const currentUser = computed(() => store.state.currentUser);
    const notificationEnable = computed(() => {
      const currentUser = store.state.currentUser || {};
      return !!currentUser.features?.enable_notification_center;
    });
    const enableCrmCustomField = computed(() => {
      return currentUser.value.features?.enable_crm_custom_field || false;
    });

    watch(
      enableCrmCustomField,
      (val) => {
        if (val) {
          NOTIFY_TYPE.value.push({
            type: "system_error",
            text: store.getters["i18n/t"]("attentions"),
          });
        }
      },
      { immediate: true }
    );

    watch(currentType, () => {
      getNotificationList();
    });

    onMounted(() => {
      getNotificationList();
    });

    const updateNotificationList = (list: any) => {
      store.commit("dashboard/UPDATE_NOTIFICATION_LIST", list);
    };

    const backHome = () => {
      store.router.back();
    };

    const updateReadStatus = () => {
      getReadStatus({
        start_time: new Date().getTime(),
        notify_parent_types: NOTIFY_TYPE.value
          .map((type) => type.type)
          .filter((type) => type !== "all"),
      }).then((res) => {
        readStatus.value = res;
      });
    };

    const handleMarkAllRead = () => {
      notificationList.value.forEach((item) => {
        item.read = true;
      });
      readStatus.value[currentType.value] = false;
      setNotificationRead({
        notify_parent_type: currentType.value,
        change_type: 1,
      })
        .then(() => {})
        .catch((e) => store.dispatch("message/error", e.errorMessage));
    };

    const updateDayPartData = () => {
      const startOfTodayTime = startOfToday().getTime();
      const startOfYesterdayTime = startOfYesterday().getTime();

      notificationTodayList.value = notificationList.value.filter(
        (item) => new Date(item.create_time).getTime() >= startOfTodayTime
      );
      notificationYesterdayList.value = notificationList.value.filter(
        (item) =>
          new Date(item.create_time).getTime() < startOfTodayTime &&
          new Date(item.create_time).getTime() >= startOfYesterdayTime
      );
      notificationOlderList.value = notificationList.value.filter(
        (item) => new Date(item.create_time).getTime() < startOfYesterdayTime
      );
    };

    const getNotificationList = () => {
      const page_size = 20;
      const start_time = new Date().getTime();
      loading.value = true;
      updateReadStatus();
      getNotifications({
        page_size,
        start_time,
        notify_parent_type: currentType.value,
        only_show_unread: isShowUnread.value,
      })
        .then((res) => {
          notificationList.value = res.notifications || [];
          updateNotificationList(cloneDeep(notificationList.value));
          updateDayPartData();
          haveMore.value = res.have_more || false;
          lastNotificationTime.value = notificationList.value.length
            ? new Date(
                notificationList.value[
                  notificationList.value.length - 1
                ].create_time
              ).getTime() - 1
            : new Date().getTime();
        })
        .catch((e) => store.dispatch("message/error", e.errorMessage))
        .finally(() => (loading.value = false));
    };

    const goToSettings = () => {
      openLink(
        "/profile/setting?tab=iq&openDialog=true#kiwiNotificationCenter"
      );
    };

    const handleIsUnreadChange = () => {
      getNotificationList();
    };

    const handleDelete = (id: string, notify_type: string) => {
      notificationList.value = notificationList.value.filter(
        (item) => item.id !== id
      );
      updateDayPartData();
      viewMoreLoading.value = true;
      deleteNotification({
        notify_id: id,
        notify_type: notify_type,
      })
        .then(() => {
          if (haveMore.value) {
            handleViewMoreClick(1);
          }
        })
        .catch((e) => {
          store.dispatch("message/error", e.errorMessage);
          viewMoreLoading.value = false;
        })
        .finally();
    };

    const handleViewMoreClick = (page_size = 20) => {
      viewMoreLoading.value = true;
      getNotifications({
        page_size: page_size,
        start_time: lastNotificationTime.value,
        notify_parent_type: currentType.value,
        only_show_unread: isShowUnread.value,
      })
        .then((res) => {
          notificationList.value = notificationList.value.concat(
            res.notifications || []
          );
          updateDayPartData();
          lastNotificationTime.value = notificationList.value.length
            ? new Date(
                notificationList.value[
                  notificationList.value.length - 1
                ].create_time
              ).getTime() - 1
            : new Date().getTime();
          haveMore.value = res.have_more || false;
        })
        .catch((e) => store.dispatch("message/error", e.errorMessage))
        .finally(() => (viewMoreLoading.value = false));
    };

    return {
      NOTIFY_TYPE,
      currentType,
      isShowUnread,
      notificationList,
      notificationTodayList,
      notificationYesterdayList,
      notificationOlderList,
      viewMoreLoading,
      haveMore,
      loading,
      readStatus,
      currentUser,
      notificationEnable,
      enableCrmCustomField,
      backHome,
      updateReadStatus,
      handleMarkAllRead,
      updateDayPartData,
      getNotificationList,
      goToSettings,
      handleIsUnreadChange,
      handleDelete,
      handleViewMoreClick,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.notification-header {
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
  }
}
.notification-type {
  margin-bottom: 10px;
}
::v-deep .zm-tabs--capsule > .zm-tabs__header .zm-tabs__item {
  &.is-active {
    background-color: #0e72ed !important;
    color: #fff;
  }
  &:hover {
    background: #f7f9fa;
  }
  &:active {
    background: #f1f4f6;
  }
  border: 1px solid #dfe3e8;
  color: #131619;
  display: inline-flex;
  align-items: center;
  height: 32px;
  border-radius: 100px;
  margin-right: 8px;
  padding: 0 16px;
  transition: none;
  cursor: pointer;
}
.unread-options {
  line-height: 24px;
  height: 32px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.view-more {
  height: 20px;
  line-height: 20px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  ::v-deep .zm-button--link {
    color: #0e72ed;
  }
  .spinner-container {
    width: 30px;
    ::v-deep .zm-loading-spinner .circular {
      height: 30px;
      position: relative;
      left: -7px;
    }
  }
}
.day-part {
  .day-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    color: #6e7680;
    margin: 20px 0 16px 16px;
  }
}
.red-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff2638;
  position: absolute;
  top: 0;
  right: -16px;
}
.slide-enter-active {
  animation: slide-in 0.5s ease-out;
}
.slide-leave-active {
  animation: slide-out 0.2s ease-out;
  position: absolute;
  opacity: 0;
}
.slide-move {
  transition: all 0.6s;
}

@keyframes slide-in {
  from {
    transform: translateX(30px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(30px);
  }
}

      </style>