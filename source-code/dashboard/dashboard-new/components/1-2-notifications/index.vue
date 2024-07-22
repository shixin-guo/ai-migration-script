<template>
<div class="wrapper">
  <div class="title">
    <div>
      <span>{{ $t("dashboard.notifications") }}</span>
      <zm-button
        class="mgl-xs"
        style="font-size: 20px"
        type="icon"
        icon="zm-icon-right"
        ghost
        size="mini"
        @click="handleRightIconClick"
      />
    </div>
    <zm-button
      v-if="notificationEnable"
      style="font-size: 14px"
      class="mgr-sm"
      type="icon"
      icon="zm-icon-settings-outline"
      ghost
      size="mini"
      @click="goToSettings"
    />
  </div>
  <zm-skeleton
    :loading="loading"
    animated
    :throttle="500"
    style="height: calc(100% - 24px); padding-top: 16px"
  >
    <template #template>
      <div class="mgr-sm mgl-sm skeleton-container" style="font-size: 0">
        <zm-skeleton-item variant="p" class="skeleton-item" />
        <zm-skeleton-item variant="p" class="skeleton-item" />
        <zm-skeleton-item variant="p" class="skeleton-item" />
      </div>
    </template>
    <zm-scrollbar
      v-if="notificationList.length || haveMore"
      style="height: 100%; margin-right: -4px"
      wrap-style="overflow-x: hidden;"
    >
      <transition-group name="slide" tag="div">
        <notification-card
          v-for="notification in notificationList.filter(
            (item) => item.biz_type <= 17
          )"
          :key="notification.id"
          :notification="notification"
          :view-more-loading.sync="viewMoreLoading"
          @delete-one="handleDelete"
          @align-click="handleAlignClick"
        />
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
      </transition-group>
    </zm-scrollbar>
    <div v-else-if="!loading" class="no-content">
      {{ $t("dashboard.notifications_will_appear_here") }}
    </div>
  </zm-skeleton>
  <align-dialog
    v-model:visible="confirmAlignDialogVisible"
    :click-folder-id="clickFolderId"
    :click-playlist-id="clickPlaylistId"
    :click-user-name="clickUserName"
    :click-playlist-name="clickPlaylistName"
    @refresh-list="getNotificationList"
  />
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { deleteNotification, getNotifications } from "@api/dashboard-new";
import NotificationCard from "@views/dashboard/dashboard-new/components/1-2-notifications/notification-card";
import AlignDialog from "@views/dashboard/dashboard-new/components/1-2-notifications/align-dialog";
import { openLink } from "@common/js/client-compatible-fns/navigator";
import { cloneDeep } from "lodash-es";

export default defineComponent({
  name: "DashboardNotifications",
  components: { NotificationCard, AlignDialog },
  setup() {
    const store = useStore();
    const loading = ref(true);
    const viewMoreLoading = ref(false);
    const notificationList = ref<any[]>([]);
    const haveMore = ref(false);
    const lastNotificationTime = ref(new Date().getTime());
    const confirmAlignDialogVisible = ref(false);
    const clickUserName = ref("");
    const clickFolderId = ref("");
    const clickPlaylistId = ref("");
    const clickPlaylistName = ref("");

    const updateNotificationList = (list: any[]) => {
      store.commit("dashboard/UPDATE_NOTIFICATION_LIST", list);
    };

    const goToSettings = () => {
      openLink("/profile/setting?tab=iq&openDialog=true#kiwiNotificationCenter");
    };

    const notificationEnable = () => {
      const currentUser = store.state.currentUser || {};
      return !!currentUser.features?.enable_notification_center;
    };

    const handleRightIconClick = () => {
      store.$router.push({ name: "notification-detail" });
    };

    const getNotificationList = (page_size = 10, start_time = new Date().getTime()) => {
      loading.value = true;
      getNotifications({ page_size, start_time })
        .then((res) => {
          notificationList.value = res.notifications || [];
          updateNotificationList(cloneDeep(notificationList.value));
          haveMore.value = res.have_more || false;
          lastNotificationTime.value = notificationList.value.length
            ? new Date(notificationList.value[notificationList.value.length - 1].create_time).getTime() - 1
            : new Date().getTime();
        })
        .catch((e) => store.$message.error(e.errorMessage))
        .finally(() => (loading.value = false));
    };

    const handleDelete = (id: string, notify_type: string) => {
      notificationList.value = notificationList.value.filter((item) => item.id !== id);
      viewMoreLoading.value = true;
      deleteNotification({ notify_id: id, notify_type })
        .then(() => {
          if (haveMore.value) {
            handleViewMoreClick(1);
          }
        })
        .catch((e) => {
          store.$message.error(e.errorMessage);
          viewMoreLoading.value = false;
        })
        .finally();
    };

    const handleViewMoreClick = (page_size = 10) => {
      viewMoreLoading.value = true;
      getNotifications({ page_size, start_time: lastNotificationTime.value })
        .then((res) => {
          notificationList.value = notificationList.value.concat(res.notifications || []);
          lastNotificationTime.value = notificationList.value.length
            ? new Date(notificationList.value[notificationList.value.length - 1].create_time).getTime() - 1
            : new Date().getTime();
          haveMore.value = res.have_more || false;
        })
        .catch((e) => store.$message.error(e.errorMessage))
        .finally(() => (viewMoreLoading.value = false));
    };

    const handleAlignClick = (biz_id: string, sender_name: string, biz_name: string) => {
      const idList = biz_id.split(",");
      clickFolderId.value = idList[0];
      clickPlaylistId.value = idList[1];
      clickUserName.value = sender_name;
      clickPlaylistName.value = biz_name;
      confirmAlignDialogVisible.value = true;
    };

    onMounted(() => {
      getNotificationList();
    });

    return {
      loading,
      viewMoreLoading,
      notificationList,
      haveMore,
      lastNotificationTime,
      confirmAlignDialogVisible,
      clickUserName,
      clickFolderId,
      clickPlaylistId,
      clickPlaylistName,
      goToSettings,
      notificationEnable,
      handleRightIconClick,
      getNotificationList,
      handleDelete,
      handleViewMoreClick,
      handleAlignClick,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.wrapper {
  height: 100%;
  .skeleton-item {
    height: 80px;
    margin-bottom: 16px;
  }
  .title {
    font-weight: 600;
    font-size: 20px;
    height: 24px;
    line-height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    margin: 8px 0 0 8px;
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

  ::v-deep .no-content {
    height: 100%;
    margin-top: -16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6e7680;
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
  // handle scrollbar bug
  ::v-deep .zm-scrollbar__bar.is-horizontal {
    display: none;
  }
}

      </style>