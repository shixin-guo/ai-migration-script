// You are a code translator who will translate a chunk of VUE2 JS code to a corresponding VUE3 JS code. You will just translate and output the VUE3 JS code directly without a preamble.

// The VUE2 code is

// <START VUE2>

// </END VUE2>

// NOTE: you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, NOT complete code.

// Now, the translated VUE3 code is

const SystemPrompt = `
  As an AI assistant specializing in Vue.js migration, 
  your task is to convert the provided Vue2 code into Vue3 Composition API using Typescript.
  The code could be a snippet of Vue template or a Vue script. 
  Generate the equivalent Vue3 code, 
  ensuring the output is in markdown file format and includes only the transformed part of the code, 
  without any extra or unrelated code. 
  You don't need to make it a full Vue file, 
  just follow the migration rule to do the language change. The response should be strictly code.
  However, if you identify something that could potentially cause a breaking change or regression,
    please add a comment starting with "@ai". 
  Please adhere to the following rules: 
  1. Do not use the <script setup> language feature.
  2. If you find some code that is not possible to migrate,
   add a comment that starts with @ai deprecated and the reason. 
  3. Vuex to pinia migration is required. 
  4. If I give you a template snippet, please make sure you return a template snippet.
  5. If I give you a script snippet, please make sure you return a script snippet.
  6. If I do not wrap the code with <template> or <script>, 
  please make sure you don't wrap the code with <template> or <script>.
  7. Do not change the variable name or function name, just do the language change.
  8. Do not change i18n key such as $t('xxx') or t('xxx').

  If some code is not clear, you can add a one-line comment to explain it.
  Start the comment with @ai explain. 
  I will only send you code, 
  so don't need to add any markdown syntax such as ${"```html"} or ${"```javascript"}, 
  and don't need "\n" at the start and the end of the line.
`;

const HumanPrompt = `
    <template>
  <div>
    <app-page-header :title="$t('user.users')">
      <span slot="title-suffix" class="title-card">
        <span class="res-count">{{ licenseUserCount }}</span
        >/{{ license_size }} {{ $t("licenses_provisioned") }}
      </span>
    </app-page-header>
    <div class="search-container">
      <zm-input
        v-model="searchKeyword"
        class="search-input"
        :placeholder="$t('user.search_by')"
        clearable
        @change="handleKeywordChange"
      >
        <i slot="prefix" class="zm-input__icon zm-icon-search" />
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
        <template slot-scope="scope">
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
        <template slot-scope="scope">
          {{ scope.row.team_name || "-" }}
        </template>
      </zm-table-column>
      <template v-if="showExtraColumns">
        <zm-table-column :label="$t('team_manager')" min-width="160">
          <template slot-scope="scope">
            <team-or-manager-name :name="getTeamManagerList(scope.row)" />
          </template>
        </zm-table-column>
        <zm-table-column :label="$t('team_managed')" min-width="160">
          <template slot-scope="scope">
            <team-or-manager-name :name="getManagedTeamList(scope.row)" />
          </template>
        </zm-table-column>
      </template>
      <zm-table-column :label="$t('activity_capture')" min-width="150">
        <template slot-scope="scope">
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
      <column-concent-profile
        v-if="enableConsentProfile"
        :has-permission="consentProfileEditPermission"
        @user-changed-something="handleRefresh"
      />
      <zm-table-column :label="$t('auto_record_enabled')" min-width="178">
        <template slot-scope="scope">
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
    </zm-table>
    <div v-if="tableData.length" class="page-container">
      <zm-pagination
        :disabled="loading"
        :total="resCount"
        :page-size="10"
        :current-page.sync="currentPage"
        small
        no-jump
        layout="prev, next"
        @current-change="handlePageChange"
      />
      <div class="count">{{ resCount }} {{ $t("user.results") }}</div>
    </div>
  </div>
</template>

<script>
import IconList from "./components/icon-list";
import {
  getUserList,
  asyncExportUsers,
  asyncExportUsersStatus,
} from "@api/users";
import { downloadByUrl } from "@common/js/client-compatible-fns/download";
import AppPageHeader from "@components/app-layout/app-page-header.vue";
import { mapState } from "vuex";
import TeamOrManagerName from "@views/users/components/team-or-manager-name";
import ColumnConcentProfile from "./components/column-concent-profile.vue";

function pollingExportTaskStatus(options, timeInterval, timeout) {
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
async function getExportUserUrl(options) {
  // trigger export task
  await asyncExportUsers(options);
  // polling export status
  return await pollingExportTaskStatus(options, 3000, 5 * 60 * 1000);
}
export default {
  name: "UsersIndex",
  components: {
    TeamOrManagerName,
    IconList,
    AppPageHeader,
    ColumnConcentProfile,
  },
  beforeRouteLeave(from, to, next) {
    this.onSearch();
    next();
  },
  data() {
    return {
      searchKeyword: "",
      sortOrder: "desc",
      loading: false,
      exportLoading: false,
      currentPage: 1,
      resCount: 0,
      license_size: 0,
      licenseUserCount: 0,
      activityOptions: [],
      autoOptions: [],
      options: "111111".split(""),
      tableData: [],
    };
  },
  computed: {
    ...mapState(["currentUser"]),
    showExtraColumns() {
      return (
        this.currentUser?.features?.enable_team_ext_info_in_user_page || false
      );
    },
    enableConsentProfile() {
      return this.currentUser?.features?.enable_consent_profile || false;
    },
    consentProfileEditPermission() {
      const { permissions = [] } = this.currentUser;
      return (
        permissions.includes("IQAccountSetting:Edit") ||
        permissions.includes("AccountSetting:Edit")
      );
    },
  },
  watch: {
    activityOptions: {
      handler(arr) {
        this.options[5] = arr.includes("meeting") ? "0" : "1";
        this.options[3] = arr.includes("calendar") ? "0" : "1";
        this.options[2] = arr.includes("email") ? "0" : "1";
      },
      deep: true,
    },
    autoOptions: {
      handler(arr) {
        this.options[1] = arr.includes("meetingAuto") ? "0" : "1";
      },
      deep: true,
    },
  },
  created() {
    this.onSearch();
  },
  methods: {
    onSort({ order }) {
      this.sortOrder = order === "descending" ? "desc" : "asc";
      this.onSearch();
    },
    handleKeywordChange() {
      this.onSearch();
    },
    getTeamManagerList(row = {}) {
      return row.team_manager_list?.map((team) => team.name)?.join(", ") || "-";
    },
    getManagedTeamList(row = {}) {
      return row.managed_team_list?.map((team) => team.name)?.join(", ") || "-";
    },
    onSearch(page = 1) {
      const params = {
        search_text: this.searchKeyword,
        page,
        page_size: 10,
        sort_order: this.sortOrder,
        options: this.calculateOptions(),
      };
      this.loading = true;
      this.currentPage = page;
      getUserList(params)
        .then((res) => {
          this.tableData = res.data || [];
          this.resCount = res.res_count || 0;
          this.license_size = res.license_size || 0;
          this.licenseUserCount = res.license_user_count || 0;
        })
        .catch((e) => {
          this.$message({
            message: e.errorMessage,
            type: "error",
          });
        })
        .finally(() => (this.loading = false));
    },
    handlePageChange(currentPage) {
      this.currentPage = currentPage;
      this.onSearch(currentPage);
    },
    handleRefresh() {
      this.onSearch(this.currentPage);
    },
    calculateOptions() {
      return parseInt(this.options.join(""), 2);
    },
    handleExport() {
      this.exportLoading = true;
      getExportUserUrl({
        search_text: this.searchKeyword,
        options: this.calculateOptions(),
        sort_order: this.sortOrder,
      })
        .then((csvUrl) => {
          downloadByUrl(csvUrl);
        })
        .catch((e) => {
          this.$message({
            message: e.errorMessage,
            type: "error",
          });
        })
        .finally(() => (this.exportLoading = false));
    },
  },
};
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

`;

export { SystemPrompt, HumanPrompt };
