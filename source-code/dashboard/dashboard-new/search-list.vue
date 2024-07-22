<template>
<div class="my-record">
  <div class="search">
    <zm-button type="link" icon="zm-icon-left" @click="goBack">
      {{ $t("common.back") }}
    </zm-button>
    <zm-input
      v-model="searchTopic"
      class="mgl-md search-topic"
      :placeholder="$t('common.search')"
      prefix-icon="zm-icon-search"
      @change="handleSearchTopic"
    />
  </div>
  <recording-table
    :table-data="tableData"
    :loading="tableIsLoading"
    :current-page="page"
    :total-records="totalRecords"
    :search-topic="searchTopic"
    :enable-header-filter="false"
    row-key="meeting_id"
    @fetch-recording-list="handlePaginationChange"
  />
</div>
</template>
    <script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMyRecordingListApi } from "@api/recording";
import { sub } from "date-fns";
import RecordingTable from "@views/recording-list/components/list-table";

export const MIN_DATE = sub(new Date(), { months: 6 });
export const MAX_DATE = new Date();

export default defineComponent({
  name: "MyRecord",
  components: { RecordingTable },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const tableIsLoading = ref(false);
    const chosenDate = ref([MIN_DATE, MAX_DATE]);
    const tableData = ref([]);
    const totalRecords = ref(0);
    const page = ref(0);
    const searchTopic = ref(route.params.searchTopic);

    const getRecordingList = (filters = {}, page = 1, size = 20) => {
      let { min_date, max_date, stages, ...restFilter } = filters;
      page.value = page;
      tableIsLoading.value = true;
      tableData.value = [];
      getMyRecordingListApi({
        page,
        page_size: size,
        start_time: min_date || +chosenDate.value[0],
        end_time: max_date || +chosenDate.value[1],
        topic: searchTopic.value,
        stages_during_conversation: stages || [],
        ...restFilter,
      })
        .then((res) => {
          tableData.value = res.data;
          totalRecords.value = res.total;
        })
        .finally(() => {
          tableIsLoading.value = false;
        });
    };

    const handleSearchTopic = () => {
      getRecordingList();
    };

    const goBack = () => {
      router.go(-1);
    };

    const handlePaginationChange = (page) => {
      getRecordingList({}, page);
    };

    watch(
      () => route.params.searchTopic,
      (val) => {
        searchTopic.value = val;
        getRecordingList();
      }
    );

    onMounted(() => {
      searchTopic.value = route.params.searchTopic;
      getRecordingList();
    });

    return {
      tableIsLoading,
      chosenDate,
      tableData,
      totalRecords,
      page,
      searchTopic,
      handleSearchTopic,
      goBack,
      getRecordingList,
      handlePaginationChange,
    };
  },
});
</script>
    <style lang="scss" scoped>
        
.search {
  display: flex;
  justify-content: space-between;
  .search-topic {
    width: 300px;
  }
}

      </style>