<template>
<div style="overflow: hidden">
  <app-page-header :title="dashboardWelcomeTitle">
    <zm-input
      #title-tail
      v-model="searchTopic"
      class="search-topic"
      :placeholder="$t('common.search')"
      prefix-icon="zm-icon-search"
      @keydown="handleSearchTopic"
    />
  </app-page-header>
  <div class="block-container">
    <upcoming-conversations class="block-item block-upcoming" />
    <notifications class="block-item block-notifications" />
    <my-open-deals class="block-item block-open-deals" />
    <my-performance class="block-item block-performance" />
    <subscribed-indicators class="block-item" />
  </div>
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import AriaUtils from "@zoom/zoom-ui-meeting/src/utils/aria-utils";

import UpcomingConversations from "@views/dashboard/dashboard-new/components/1-1-upcoming-conversations";
import MyOpenDeals from "@views/dashboard/dashboard-new/components/2-1-my-open-deals";
import SubscribedIndicators from "@views/dashboard/dashboard-new/components/2-3-subscribed-indicators";
import MyPerformance from "@views/dashboard/dashboard-new/components/2-2-my-performance";
import Notifications from "@views/dashboard/dashboard-new/components/1-2-notifications/index";
import AppPageHeader from "@components/app-layout/app-page-header.vue";

export default defineComponent({
  name: "DashboardNew",
  components: {
    UpcomingConversations,
    MyOpenDeals,
    Notifications,
    MyPerformance,
    SubscribedIndicators,
    AppPageHeader,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const searchTopic = ref("");

    const currentUser = computed(() => store.state.currentUser);
    const dashboardWelcomeTitle = computed(() => store.getters.$t("dashboard.my_dashboard"));

    const handleSearchTopic = (e: KeyboardEvent) => {
      if (e?.keyCode === AriaUtils?.keys?.enter) {
        router.push({
          name: "recording-search-list",
          params: { searchTopic: searchTopic.value },
        });
      }
    };

    return {
      searchTopic,
      currentUser,
      dashboardWelcomeTitle,
      handleSearchTopic,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.search-topic {
  max-width: 300px;
  margin: 4px;
}
.block-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 352px 396px;
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  margin-top: 24px;
  padding-bottom: 20px;
  .block-item {
    grid-area: span 1 / span 1 / auto / auto;
    box-sizing: border-box;
    border-radius: 8px;
    border: 1px solid #dfe3e8;
    padding: 16px;
  }
  .block-upcoming {
    grid-area: 1 / 1 / 2 / 3;
  }
  .block-open-deals,
  .block-notifications,
  .block-performance {
    padding: 8px !important;
  }
}

@media screen and (max-width: 1438px) {
  .block-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 352px repeat(2, 396px);
    .block-notifications {
      ::v-deep {
        .skeleton-container {
          margin-top: 24px;
        }
        .skeleton-item {
          height: 82px;
        }
      }
    }
  }
}

@media screen and (max-width: 900px) {
  .block-container {
    grid-template-columns: 1fr;
    grid-template-rows: 352px repeat(4, 396px);
  }
  .block-container .block-upcoming {
    grid-area: span 1 / span 1 / auto / auto;
  }
}

      </style>