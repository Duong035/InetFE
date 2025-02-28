<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import dayjs from "dayjs";
import {
  defineComponent,
  ref,
  h,
  reactive,
  computed,
  onMounted,
  toRaw,
} from "vue";
import { NButton, NDataTable } from "naive-ui";
import { message } from "ant-design-vue";

export default defineComponent({
  setup() {
    interface RowData {
      id: string;
      subjectName: string;
      classType: string;
      startAt: string;
      status: string;
      endAt: string;
    }

    const paginationReactive = reactive({
      page: 1,
      pageSize: 5,
      showSizePicker: true,
      pageSizes: [3, 5, 7],
      itemCount: computed(() => data.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });

    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);
    const isLoading = ref(false);

    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClasses({});

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data?.classes;
        if (Array.isArray(rawData)) {
          data.value = rawData.map((item: any, index: number) => ({
            stt: index + 1,
            id: item.id || "N/A",
            subjectName: item.subject?.name || "N/A",
            classType: item.type ? `Loại ${item.type}` : "N/A",
            startAt: item.start_at ? item.start_at.split("T")[0] : "N/A",
            endAt: item.end_at ? item.end_at.split("T")[0] : "N/A",
            status: item.status === 1 ? "Hoạt động" : "Không hoạt động",
          }));
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };
    function checkStatusByDate(startAt: string, endAt: string): string {
      const today = new Date();
      const startDate = new Date(startAt);
      const endDate = new Date(endAt);

      if (today >= startDate && today <= endDate) {
        return "Đang diễn ra";
      } else if (today < startDate) {
        return "Sắp diễn ra";
      } else {
        return "Đã kết thúc";
      }
    }

    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "STT",
          key: "stt",
          titleAlign: "center",
        },
        {
          title: "Tên môn học",
          key: "subjectName",
        },
        {
          title: "Loại lớp học",
          key: "classType",
        },
        {
          title: "Thời gian học",
          key: "timeRange",
          render(row) {
            return (
              dayjs(row.startAt).format("DD/MM/YYYY") +
              " - " +
              dayjs(row.endAt).format("DD/MM/YYYY")
            );
          },
        },
        {
          title: "Trạng thái",
          key: "status",
          render(row) {
            const status = checkStatusByDate(row.startAt, row.endAt);
            return h(
              "span",
              {
                style: {
                  padding: "5px 10px",
                  borderRadius: "10px",
                  color:
                    status === "Đang diễn ra"
                      ? "#00974F"
                      : status === "Sắp diễn ra"
                        ? "#FFA500"
                        : "#4D6FA8",
                  background:
                    status === "Đang diễn ra"
                      ? "#F0FFF8"
                      : status === "Sắp diễn ra"
                        ? "#FFF8E5"
                        : "#ECF1F9",
                },
              },
              status,
            );
          },
        },
      ];
    }

    onMounted(() => {
      loadData();
    });

    return {
      isLoading,
      data,
      columns: createColumns(),
      pagination: paginationReactive,
    };
  },
});
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-white">
    <div class="flex-1">
      <div class="h-full bg-white text-black">
        <n-data-table
          :bordered="false"
          :single-line="false"
          :columns="columns"
          :data="data"
          :scroll-x="1000"
          :pagination="pagination"
        />
      </div>
    </div>
  </div>
</template>
