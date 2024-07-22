<template>
<div class="wrapper">
  <div class="topic-header">
    <span class="title">
      {{ $t("deal.my_open_deals") }}
      <zm-button
        icon="zm-icon-right"
        size="mini"
        class="mgl-xs"
        style="font-size: 20px"
        ghost
        @click="openMyOpenDealListPage"
      />
    </span>
    <span>
      <zm-dropdown @command="handleCommand">
        <zm-button ghost class="deal-sort-button">
          <zm-icon name="sort" size="mini" class="sort-button" />
        </zm-button>
        <zm-dropdown-menu>
          <zm-dropdown-item :command="sortType.closeDate">
            <i class="zm-icon-arrow-up" />
            {{ $t("recording.close_date") }}
          </zm-dropdown-item>
          <zm-dropdown-item :command="sortType.lastActivityModifyDate">
            <i class="zm-icon-arrow-down" />
            {{ $t("deal.last_activity") }}
          </zm-dropdown-item>
          <zm-dropdown-item :command="sortType.amount">
            <i class="zm-icon-arrow-down" />
            {{ $t("deal.deal_size") }}
          </zm-dropdown-item>
        </zm-dropdown-menu>
      </zm-dropdown>
    </span>
  </div>
  <zm-skeleton
    :loading="loadingList"
    animated
    :throttle="500"
    style="height: calc(100% - 40px)"
  >
    <template #template>
      <div class="mgr-sm mgl-sm" style="padding-top: 24px; font-size: 0">
        <zm-skeleton-item class="skeleton-item" />
        <zm-skeleton-item class="skeleton-item" />
        <zm-skeleton-item class="skeleton-item" />
      </div>
    </template>
    <div v-if="dealList.length === 0 && !loadingList" class="content-tip">
      <div>
        {{ $t("your_deals_will_appear_here") }}
      </div>
    </div>
    <div v-else-if="noConfigCrm" class="content-tip">
      {{ $t("deal.set_up_crm_integrations_ra") }}
    </div>
    <div v-else class="deal-list">
      <zm-scrollbar
        style="height: 100%; margin-right: -4px"
        wrap-style="overflow-x: hidden;"
      >
        <div class="mgr-xs">
          <div
            v-for="deal in dealList"
            :key="deal.id"
            class="deal"
            @click="openDealDetail(deal)"
          >
            <div class="customer">
              {{ deal.customerCrmAccountNames }}
            </div>
            <div>
              <router-link
                tabindex="-1"
                :to="{ name: 'deal-detail', params: { id: deal.id } }"
              >
                <span class="deal-name"> {{ deal.name }}</span>
              </router-link>

              <span class="deal-stage">{{ deal.stage }}</span>
            </div>

            <p
              v-if="sortBy === sortType.closeDate"
              class="deal-close-date mgt-xs mgb-xs"
            >
              <span class="close-date-label">
                {{ $t("deal.close_date") }}:
              </span>
              <span class="close-date">{{ deal.closeDate }}</span>
            </p>
            <p
              v-if="sortBy === sortType.lastActivityModifyDate"
              class="deal-close-date mgt-xs mgb-xs"
            >
              <span class="close-date-label">
                {{ $t("deal.last_activity_time") }}:</span
              >
              <span class="close-date">{{
                formatActivityTime(deal.lastActivityModifyDate)
              }}</span>
            </p>
            <p
              v-if="sortBy === sortType.amount"
              class="deal-close-date mgt-xs mgb-xs"
            >
              <span class="close-date-label">
                {{ $t("deal.deal_size") }}:
              </span>
              <span class="close-date">{{
                deal.amount
                  ? `${formatCurrency(deal.amount)} ${deal.currencyType}`
                  : "-"
              }}</span>
            </p>
          </div>
        </div>
        <div class="footer">
          <zm-button
            v-if="hasMore"
            type="link"
            style="color: #0e72ed"
            @click="openMyOpenDealListPage"
          >
            {{ $t("common.view_more") }}
          </zm-button>
        </div>
      </zm-scrollbar>
    </div>
  </zm-skeleton>
</div>
</template>
    <script lang="ts">
import { getDealList } from "@api/deal";
import {
  sortType,
  MAX_DATE,
  formatActivityTime,
} from "@views/deals/deal-list/util";
import { useStore } from "vuex";
import { formatCurrency } from "shared/js/utils";
import { defineComponent, ref, computed, onMounted } from "vue";

export default defineComponent({
  name: "MyOpenDeals",
  setup() {
    const store = useStore();
    const loadingList = ref(true);
    const dealList = ref([]);
    const hasMore = ref(false);
    const sortBy = ref(sortType.closeDate);
    const noConfigCrm = ref(false);

    const currentUser = computed(() => store.state.currentUser);

    const formatCurrencyMethod = formatCurrency;
    const formatActivityTimeMethod = formatActivityTime;

    const handleCommand = (command = sortType.lastActivityModifyDate) => {
      sortBy.value = command;
      onSearchDeals();
    };

    const onSearchDeals = (page = 1) => {
      loadingList.value = true;
      const { zm_user_id = "" } = currentUser.value;
      const params = {
        owner_id: [zm_user_id],
        page,
        page_size: 10,
        min_activity_modify_date: 0,
        max_activity_modify_date: MAX_DATE.valueOf(),
        sort_by: sortBy.value,
        sort_order: sortBy.value === sortType.closeDate ? "asc" : "desc",
        only_list_open_deal: true,
        from_my_deals: true,
      };
      getDealList(params)
        .then(({ data, total }) => {
          hasMore.value = total > 10;
          if (!data) {
            dealList.value = [];
            return;
          }
          dealList.value = data.map(
            ({
              id,
              close_date: closeDate,
              last_activity_modify_date: lastActivityModifyDate,
              currency_type: currencyType,
              amount,
              name,
              stage,
              customer_crm_account_name: customerCrmAccountNames,
            }) => {
              return {
                id,
                name,
                stage,
                closeDate,
                lastActivityModifyDate,
                customerCrmAccountNames,
                amount,
                currencyType,
              };
            }
          );
        })
        .catch((e) => {
          store.dispatch("message", {
            message: e.errorMessage,
            type: "error",
          });
        })
        .finally(() => (loadingList.value = false));
    };

    const openMyOpenDealListPage = () => {
      store.dispatch("router/push", {
        name: "open-deals",
        query: {
          from: "dashboard-my-open-deal",
          sort_by: sortBy.value,
          sort_order: sortBy.value === sortType.closeDate ? "asc" : "desc",
        },
      });
    };

    const openDealDetail = (deal) => {
      deal.id &&
        store.dispatch("router/push", {
          name: "deal-detail",
          params: { id: deal.id },
        });
    };

    onMounted(() => {
      onSearchDeals();
    });

    return {
      loadingList,
      dealList,
      hasMore,
      sortBy,
      noConfigCrm,
      currentUser,
      formatCurrencyMethod,
      formatActivityTimeMethod,
      handleCommand,
      onSearchDeals,
      openMyOpenDealListPage,
      openDealDetail,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.wrapper {
  height: 100%;
}
.content-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 48px);
  color: #6e7680;
  margin: 0 32px;
  text-align: center;
  line-height: 20px;
}
.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  margin: 8px 8px 16px;
  .title {
    display: flex;
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    color: #131619;
  }
  .deal-sort-button {
    width: 24px;
    height: 24px;
    margin-top: 5px;
    padding: 0;
  }
  .sort-button {
    width: 14px;
    height: 14px;
  }
}
.deal {
  padding: 10px 8px;
  margin-bottom: 8px;
  word-break: break-all;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
  &:hover {
    background-color: #f1f4f6;
    border-radius: 8px;
  }
  .deal-name {
    color: #131619;
  }
  .deal-close-date {
    color: #6e7680;
  }
}
.customer,
.deal-stage {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #6e7680;
}
.deal-stage {
  background: #f7f9fa;
  white-space: nowrap;
  border: 1px solid #dfe3e8;
  color: #444b53;
  border-radius: 4px 8px;
  margin-left: 4px;
  padding: 0 6px;
}
.deal-list {
  height: 100%;
}
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}
.skeleton-item {
  height: 82px;
  margin-bottom: 16px;
}

      </style>