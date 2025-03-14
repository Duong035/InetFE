<script lang="ts">
import type { DataTableColumns } from "naive-ui";
import dayjs from "dayjs";
import { defineComponent, ref, h, reactive, onMounted, watchEffect } from "vue";
import { NDataTable, NButton } from "naive-ui";
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
      name: string;
      code: string;
      totalLessons: number;
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
    const router = useRouter();

    const classTypeMap: Record<number, string> = {
      1: "Online",
      2: "Offline",
      3: "Hybrid",
    };

    const statusMap: Record<
      number,
      { text: string; color: string; bg: string }
    > = {
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
          .map((item: any) => ({
            code: item.code || "N/A",
            id: item.id || "N/A",
            subjectName: item.subject?.name || "N/A",
            classType: item.type ? `${item.type}` : "N/A",
            startAt: item.start_at ? item.start_at.split("T")[0] : "N/A",
            endAt: item.end_at ? item.end_at.split("T")[0] : "N/A",
            status: item.status,
            name: item.name,
            totalLessons: item.subject?.total_lessons,
          }))
          .filter((row: any) => row.status === 4);

        pagination.itemCount = data.value.length;
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      } finally {
        isLoading.value = false;
      }
    };

    function convertClassType(classType: number): string {
      const ClassTypeMap: Record<number, string> = {
        1: "Online",
        2: "Offline",
        3: "Hybrid",
      };
      return ClassTypeMap[classType] || "Không xác định";
    }

    const editRow = (row: any) => {
      if (!row.id) {
        console.error("ID lớp học không hợp lệ:", row);
        return;
      }

      console.log("Edit:", row);
      router.push({
        path: "lophocinfo",
        query: { id: row.id.toString() },
      });
      message.success(`Chỉnh sửa lớp học: ${row.name}`);
    };

    const deleteRow = (row: RowData) => {
      console.log("Delete:", row);
      message.warning(`Dừng hoạt động lớp: ${row.name}`);
    };

    const addRow = (row: RowData) => {
      console.log("Add:", row);
      message.info(`Thêm lớp học liên quan đến: ${row.name}`);
    };

    const columns: DataTableColumns<RowData> = [
      { title: "Mã lớp học", key: "code", titleAlign: "center" },
      { title: "Tên Lớp học", key: "name", titleAlign: "center" },
      { title: "Tên môn học", key: "subjectName", titleAlign: "center" },
      {
        title: "Loại lớp học",
        key: "classType",
        titleAlign: "center",
        render(row) {
          return convertClassType(Number(row.classType));
        },
      },
      {
        title: "Số buổi học",
        key: "totalLessons",
        titleAlign: "center",
      },
      {
        title: "Thời gian học",
        key: "timeRange",
        align: "center",
        render: (row) =>
          `${dayjs(row.startAt).format("DD/MM/YYYY")} - ${dayjs(row.endAt).format("DD/MM/YYYY")}`,
      },
      {
        title: "Trạng thái",
        key: "status",
        align: "center",
        // render: (row) => {
        //   const { text, color, bg } = statusMap[row.status] || {
        //     text: "Không xác định",
        //     color: "#000",
        //     bg: "#FFF",
        //   };
        //   return h(
        //     "span",
        //     {
        //       style: {
        //         padding: "5px 10px",
        //         borderRadius: "10px",
        //         color,
        //         background: bg,
        //       },
        //     },
        //     text,
        //   );
        // },
      },
      {
        title: "Hành động",
        key: "actions",
        align: "center",
        render(row) {
          return h("div", { class: "flex gap-2 justify-center" }, [
            h(
              NButton,
              {
                size: "small",
                type: "primary",
                quaternary: true,
                onClick: () => editRow(row),
              },
              {
                default: () =>
                  h("i", {
                    class: "fa-regular fa-pen-to-square",
                    style: "color: green;",
                  }),
              },
            ),
            h(
              NButton,
              {
                size: "small",
                type: "error",
                quaternary: true,
                onClick: () => deleteRow(row),
              },
              {
                default: () =>
                  h("i", { class: "fas fa-ban", style: "color: red;" }),
              },
            ),
            h(
              NButton,
              {
                size: "small",
                type: "warning",
                quaternary: true,

                onClick: () => addRow(row),
              },
              {
                default: () =>
                  h("i", {
                    class: "fa-solid fa-square-plus",
                    style: "color: orange;",
                  }),
              },
            ),
          ]);
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
