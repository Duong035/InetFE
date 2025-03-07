<script lang="ts">
import type { DataTableColumns } from "naive-ui";
import dayjs from "dayjs";
import { defineComponent, ref, h, reactive, onMounted, watchEffect } from "vue";
import { NDataTable } from "naive-ui";
import { message } from "ant-design-vue";

export default defineComponent({
  setup() {
    interface RowData {
      stt: number;
      id: string;
      subjectName: string;
      classType: string;
      startAt: string;
      endAt: string;
      status: number;
    }

    const pagination = reactive({
      page: 1,
      pageSize: 5,
      showSizePicker: true,
      pageSizes: [3, 5, 7],
      itemCount: 0,
      onUpdatePage: (page: number) => (pagination.page = page),
      onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize;
        pagination.page = 1;
      },
    });

    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);
    const isLoading = ref(false);

    const classTypeMap: Record<number, string> = {
      1: "Online",
      2: "Offline",
      3: "Hybrid",
    };

    const statusMap: Record<
      number,
      { text: string; color: string; bg: string }
    > = {
      1: { text: "Sắp diễn ra", color: "#FFA500", bg: "#FFF8E5" },
      2: { text: "Đang diễn ra", color: "#00974F", bg: "#F0FFF8" },
      3: { text: "Đã kết thúc", color: "#4D6FA8", bg: "#ECF1F9" },
      4: { text: "Đã hủy", color: "#D32F2F", bg: "#FDECEA" },
    };

    const loadData = async () => {
      isLoading.value = true;
      try {
        const { data: resData, error } = await restAPI.cms.getClasses({});
        if (error?.value)
          throw new Error(error.value.data?.message || "Lỗi tải dữ liệu");

        const rawData = resData.value?.data?.classes || [];
        data.value = rawData
          .map((item: any, index: number) => ({
            stt: index + 1,
            id: item.id || "N/A",
            subjectName: item.subject?.name || "N/A",
            classType: classTypeMap[item.type] || "Không xác định",
            startAt: item.start_at ? item.start_at.split("T")[0] : "N/A",
            endAt: item.end_at ? item.end_at.split("T")[0] : "N/A",
            status: item.status,
          }))
          .filter((row: any) => row.status === 2);

        pagination.itemCount = data.value.length;
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      } finally {
        isLoading.value = false;
      }
    };

    const columns: DataTableColumns<RowData> = [
      { title: "STT", key: "stt", align: "center" },
      { title: "Tên môn học", key: "subjectName" },
      { title: "Loại lớp học", key: "classType" },
      {
        title: "Thời gian học",
        key: "timeRange",
        render: (row) =>
          `${dayjs(row.startAt).format("DD/MM/YYYY")} - ${dayjs(row.endAt).format("DD/MM/YYYY")}`,
      },
      {
        title: "Trạng thái",
        key: "status",
        render: (row) => {
          const { text, color, bg } = statusMap[row.status] || {
            text: "Không xác định",
            color: "#000",
            bg: "#FFF",
          };
          return h(
            "span",
            {
              style: {
                padding: "5px 10px",
                borderRadius: "10px",
                color,
                background: bg,
              },
            },
            text,
          );
        },
      },
    ];

    onMounted(loadData);
    watchEffect(() => (pagination.itemCount = data.value.length));

    return { isLoading, data, columns, pagination };
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
          :loading="isLoading"
          :scroll-x="1000"
          :pagination="pagination"
        />
      </div>
    </div>
  </div>
</template>
