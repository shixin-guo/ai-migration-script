<template>
  <div>
    <app-page-header :title="$t('user.users')">
      <template #title-suffix>
        <span class="title-card">
          <span class="res-count">{{ licenseUserCount }}</span
          >/{{ license_size }} {{ $t("licenses_provisioned") }}
        </span>
      </template>
    </app-page-header>
    <div class="search-container">
      <zm-input
        v-model="searchKeyword"
        class="search-input"
        :placeholder="$t('user.search_by')"
        clearable
        @change="handleKeywordChange"
      >
        <template #prefix>
          <i class="zm-input__icon zm-icon-search" />
        </template>
      </zm-input>
      <zm-button :loading="exportLoading" @click="handleExport">
        {{ $t("user.export") }}
      </zm-button>
    </div>
    <zm-table
      v-loading="loading"
      :data="tableData"
      class="user-table"
      style="width: 100%"
      :default-sort="{ prop: 'date', order: 'descending' }"
      sticky-bar
      @sort-change="onSort"
    >
      <zm-table-column
        :label="$t('coaching.create_label_scorecard_name')"
        sortable="custom"
        min-width="280"
        word-wrap="ellipsis"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="text-ellipsis">
            {{ scope.row.name }}
          </div>
          <div class="email text-ellipsis">
            {{ scope.row.email }}
          </div>
        </template>
      </zm-table-column>
      <zm-table-column
        prop="provisioned_date"
        :label="$t('provisioned_date')"
        min-width="150"
      />
      <zm-table-column
        prop="kiwi_role_name"
        :label="$t('user.role')"
        min-width="180"
      />
      <zm-table-column :label="$t('filter.team')" min-width="160">
        <template #default="scope">
          {{ scope.row.team_name || "-" }}
        </template>
      </zm-table-column>
      <template v-if="showExtraColumns">
        <zm-table-column :label="$t('team_manager')" min-width="160">
          <template #default="scope">
            <team-or-manager-name :name="getTeamManagerList(scope.row)" />
          </template>
        </zm-table-column>
        <zm-table-column :label="$t('team_managed')" min-width="160">
          <template #default="scope">
            <team-or-manager-name :name="getManagedTeamList(scope.row)" />
          </template>
        </zm-table-column>
      </template>
      <zm-table-column :label="$t('activity_capture')" min-width="150">
        <template #default="scope">
          <icon-list
            v-if="scope.row.contact_type !== 2"
            :meeting="scope.row.enable_meeting_analytic"
            :calendar="scope.row.enable_calendar"
            :email="scope.row.enable_email_integration"
            :calendar-sync="scope.row.enable_calendar_sync"
            :phone="{
              isEnabled: scope.row.enable_phone_analyze,
              isExist: scope.row.enable_phone_analyze !== undefined,
            }"
          />
          <span v-else> - </span>
        </template>
      </zm-table-column>
      <zm-table-column :label="$t('auto_record_enabled')" min-width="178">
        <template #default="scope">
          <icon-list
            v-if="scope.row.contact_type !== 2"
            :is-activity="false"
            :meeting="scope.row.enable_meeting_auto_recording"
            :phone="{
              isEnabled: scope.row.enable_phone_auto_recording,
              isExist: scope.row.enable_phone_auto_recording !== undefined,
            }"
          />
          <span v-else> - </span>
        </template>
      </zm-table-column>
      <column-concent-profile
        v-if="enableConsentProfile"
        :has-permission="consentProfileEditPermission"
        @user-changed-something="handleRefresh"
      />
    </zm-table>
    <div v-if="tableData.length" class="page-container">
      <zm-pagination
        :disabled="loading"
        :total="resCount"
        :page-size="10"
        v-model:currentPage="currentPage"
        small
        no-jump
        layout="prev, next"
        @current-change="handlePageChange"
      />
      <div class="count">{{ resCount }} {{ $t("user.results") }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const searchKeyword = ref('');
    const exportLoading = ref(false);
    const loading = ref(false);
    const tableData = ref([]);
    const showExtraColumns = ref(false);
    const enableConsentProfile = ref(false);
    const consentProfileEditPermission = ref(false);
    const currentPage = ref(1);
    const resCount = ref(0);
    const licenseUserCount = ref(0);
    const license_size = ref(0);

    const handleKeywordChange = () => {
      // handle keyword change logic
    };

    const handleExport = () => {
      // handle export logic
    };

    const onSort = () => {
      // handle sort change logic
    };

    const handlePageChange = () => {
      // handle page change logic
    };

    const getTeamManagerList = (row: any) => {
      // get team manager list logic
    };

    const getManagedTeamList = (row: any) => {
      // get managed team list logic
    };

    const handleRefresh = () => {
      // handle refresh logic
    };

    return {
      searchKeyword,
      exportLoading,
      loading,
      tableData,
      showExtraColumns,
      enableConsentProfile,
      consentProfileEditPermission,
      currentPage,
      resCount,
      licenseUserCount,
      license_size,
      handleKeywordChange,
      handleExport,
      onSort,
      handlePageChange,
      getTeamManagerList,
      getManagedTeamList,
      handleRefresh,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
</template>
    <script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import IconList from "./components/icon-list";
import {
  getUserList,
  asyncExportUsers,
  asyncExportUsersStatus,
} from "@api/users";
import { downloadByUrl } from "@common/js/client-compatible-fns/download";
import AppPageHeader from "@components/app-layout/app-page-header.vue";
import TeamOrManagerName from "@views/users/components/team-or-manager-name";
import ColumnConcentProfile from "./components/column-concent-profile.vue";

function pollingExportTaskStatus(options: any, timeInterval: number, timeout: number): Promise<string> {
  const startTime = new Date().getTime();
  return new Promise((resolve, reject) => {
    function getStatus() {
      asyncExportUsersStatus(options)
        .then((url) => {
          if (typeof url === "string") {
            return resolve(url);
          } else {
            next();
          }
        })
        .catch(() => {
          next();
        });
    }
    function next() {
      const now = new Date().getTime();
      if (now - startTime > timeout) {
        return reject(new Error("timeout"));
      }
      setTimeout(getStatus, timeInterval);
    }
    next();
  });
}

async function getExportUserUrl(options: any): Promise<string> {
  await asyncExportUsers(options);
  return await pollingExportTaskStatus(options, 3000, 5 * 60 * 1000);
}

export default defineComponent({
  name: "UsersIndex",
  components: {
    TeamOrManagerName,
    IconList,
    AppPageHeader,
    ColumnConcentProfile,
  },
  setup() {
    const store = useStore();
    const searchKeyword = ref("");
    const sortOrder = ref("desc");
    const loading = ref(false);
    const exportLoading = ref(false);
    const currentPage = ref(1);
    const resCount = ref(0);
    const license_size = ref(0);
    const licenseUserCount = ref(0);
    const activityOptions = ref<string[]>([]);
    const autoOptions = ref<string[]>([]);
    const options = ref("111111".split(""));
    const tableData = ref<any[]>([]);

    const showExtraColumns = computed(() => {
      return store.state.currentUser?.features?.enable_team_ext_info_in_user_page || false;
    });

    const enableConsentProfile = computed(() => {
      return store.state.currentUser?.features?.enable_consent_profile || false;
    });

    const consentProfileEditPermission = computed(() => {
      const { permissions = [] } = store.state.currentUser;
      return (
        permissions.includes("IQAccountSetting:Edit") ||
        permissions.includes("AccountSetting:Edit")
      );
    });

    watch(activityOptions, (arr) => {
      options.value[5] = arr.includes("meeting") ? "0" : "1";
      options.value[3] = arr.includes("calendar") ? "0" : "1";
      options.value[2] = arr.includes("email") ? "0" : "1";
    }, { deep: true });

    watch(autoOptions, (arr) => {
      options.value[1] = arr.includes("meetingAuto") ? "0" : "1";
    }, { deep: true });

    onMounted(() => {
      onSearch();
    });

    function onSort({ order }: { order: string }) {
      sortOrder.value = order === "descending" ? "desc" : "asc";
      onSearch();
    }

    function handleKeywordChange() {
      onSearch();
    }

    function getTeamManagerList(row: any = {}) {
      return row.team_manager_list?.map((team: any) => team.name)?.join(", ") || "-";
    }

    function getManagedTeamList(row: any = {}) {
      return row.managed_team_list?.map((team: any) => team.name)?.join(", ") || "-";
    }

    function onSearch(page = 1) {
      const params = {
        search_text: searchKeyword.value,
        page,
        page_size: 10,
        sort_order: sortOrder.value,
        options: calculateOptions(),
      };
      loading.value = true;
      currentPage.value = page;
      getUserList(params)
        .then((res) => {
          tableData.value = res.data || [];
          resCount.value = res.res_count || 0;
          license_size.value = res.license_size || 0;
          licenseUserCount.value = res.license_user_count || 0;
        })
        .catch((e) => {
          store.dispatch("message", {
            message: e.errorMessage,
            type: "error",
          });
        })
        .finally(() => (loading.value = false));
    }

    function handlePageChange(currentPage: number) {
      currentPage.value = currentPage;
      onSearch(currentPage);
    }

    function handleRefresh() {
      onSearch(currentPage.value);
    }

    function calculateOptions() {
      return parseInt(options.value.join(""), 2);
    }

    function handleExport() {
      exportLoading.value = true;
      getExportUserUrl({
        search_text: searchKeyword.value,
        options: calculateOptions(),
        sort_order: sortOrder.value,
      })
        .then((csvUrl) => {
          downloadByUrl(csvUrl);
        })
        .catch((e) => {
          store.dispatch("message", {
            message: e.errorMessage,
            type: "error",
          });
        })
        .finally(() => (exportLoading.value = false));
    }

    return {
      searchKeyword,
      sortOrder,
      loading,
      exportLoading,
      currentPage,
      resCount,
      license_size,
      licenseUserCount,
      activityOptions,
      autoOptions,
      options,
      tableData,
      showExtraColumns,
      enableConsentProfile,
      consentProfileEditPermission,
      onSort,
      handleKeywordChange,
      getTeamManagerList,
      getManagedTeamList,
      onSearch,
      handlePageChange,
      handleRefresh,
      calculateOptions,
      handleExport,
    };
  },
  beforeRouteLeave(from, to, next) {
    this.onSearch();
    next();
  },
});
</script>
    <style lang="scss" scoped>
        
.title-card {
  display: inline-block;
  margin-left: 6px;
  line-height: 32px;
  background: #f7f9fa;
  padding: 0 8px;
  font-weight: 600;
  font-size: 14px;
  .res-count {
    color: #0956b5;
  }
}
.email {
  color: #6e7680;
}
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 20px;
}
.search-container {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 24px;
  .search-input {
    width: 300px;
  }
}
.icon {
  width: 16px;
  height: 16px;
  color: #0e72ed;
}
.page-container {
  display: flex;
  margin-top: 24px;
  align-items: center;
  .count {
    margin-left: 16px;
    color: #6e7680;
    line-height: 24px;
  }
}
::v-deep .user-table.zm-table {
  td {
    padding: 0 4px;
  }
  .cell {
    padding: 0 4px;
    &.ellipsis {
      padding: 18px 4px;
    }
  }
}

      </style>