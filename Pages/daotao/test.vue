<script setup lang="ts">
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { NButton, type DataTableColumns } from "naive-ui";
const router = useRouter();
interface RowData {
  id: string;
  subjectName: string;
  classType: string;
  startAt: string;
  status: string;
  endAt: string;
  name: string;
}
const activeTab = ref("all");
const { restAPI } = useApi();

// Định nghĩa kiểu dữ liệu
interface ClassData {
  id: string;
  subjectName: string;
  classType: number;
  startAt: string;
  endAt: string;
  status: number;
}
const params = ref({
  status: null,
});
const data = ref<ClassData[]>([]);
const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "isactive", label: "Đang diễn ra", value: 2 },
  { key: "unactive", label: "Sắp diễn ra", value: 1 },
  { key: "end", label: "Đã kết thúc", value: 3 },
  { key: "cancel", label: "Đã hủy", value: 4 },
];

function convertClassType(classType: number): string {
  const ClassTypeMap: Record<number, string> = {
    1: "Online",
    2: "Offline",
    3: "Hybrid",
  };
  return ClassTypeMap[classType] || "Không xác định";
}

function getClassStatus(status: number): string {
  const statusMap: Record<number, string> = {
    1: "Sắp diễn ra",
    2: "Đang diễn ra",
    3: "Đã kết thúc",
    4: "Đã hủy",
  };

  return statusMap[status] || "Không xác định";
}
const handleChangeTab = (tab: string) => {
  console.log("🚀 ~ handleChangeTab ~ tab:", tab);
  const statusParam = tabs.find((t) => t.key === tab)?.value;
  if (statusParam) params.value.status = statusParam;
  else params.value.status = null;

  activeTab.value = tab;
};

const editRow = (row: RowData) => {
  console.log("Edit:", row);
  router.push({
    path: "lophocinfo",
    query: { id: row.id },
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

// Hàm tải dữ liệu từ API
const loadData = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getClasses({ params });
    if (error?.value)
      throw new Error(error.value.data?.message || "Lỗi tải dữ liệu");

    data.value = resData.value?.data?.classes || [];
  } catch (err) {
    console.error("Error loading data:", err);
    message.error("Lỗi tải dữ liệu.");
  }
};

// Gọi API khi component được mount
await loadData();

function createColumns(): DataTableColumns<RowData> {
  return [
    { title: "STT", key: "stt", titleAlign: "center" },
    { title: "Tên Lớp học", key: "name" },
    { title: "Tên môn học", key: "subjectName" },
    {
      title: "Loại lớp học",
      key: "classType",
      render(row) {
        return convertClassType(Number(row.classType));
      },
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
        const status = getClassStatus(Number(row.status));
        const statusStyles: Record<
          string,
          { color: string; background: string }
        > = {
          "Đang diễn ra": { color: "#00974F", background: "#F0FFF8" },
          "Sắp diễn ra": { color: "#FFA500", background: "#FFF8E5" },
          "Đã kết thúc": { color: "#4D6FA8", background: "#ECF1F9" },
          "Đã hủy": { color: "#D32F2F", background: "#FDECEA" },
        };

        return h(
          "span",
          {
            style: {
              padding: "5px 10px",
              borderRadius: "10px",
              ...(statusStyles[status] || {
                color: "#000",
                background: "#FFF",
              }),
            },
          },
          status,
        );
      },
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
}

const columns = createColumns();

// Tính số lượng lớp học theo trạng thái
const totalClasses = computed(() => data.value.length);
// const activeClasses = computed(
//   () => data.value.filter((c) => c.status === 2).length,
// );
// const upcomingClasses = computed(
//   () => data.value.filter((c) => c.status === 1).length,
// );
// const endedClasses = computed(
//   () => data.value.filter((c) => c.status === 3).length,
// );
// const canceledClasses = computed(
//   () => data.value.filter((c) => c.status === 4).length,
// );
</script>
<template>
  <div class="h-min-fit flex w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="flex w-full px-7 pt-6 text-[#133D85]">
        <h1 class="text-4xl font-bold">Lớp học</h1>
        <n-button
          type="info"
          class="ml-auto h-12 w-40 text-xl"
          @click="$router.push('lophocinfo')"
        >
          Thêm mới
          <i class="fa-solid fa-plus ml-1 px-2"></i>
        </n-button>
      </div>
      <main class="box-border flex">
        <div class="min-h-fit w-full bg-white p-6">
          <!-- Tabs -->
          <n-tabs type="line" animated @update:value="handleChangeTab">
            <n-tab-pane v-for="tab in tabs" :name="tab.key" :tab="tab.label">
              <!-- {{ tab.label }} -->
              <div class="h-full bg-white text-black">
                <n-data-table
                  :bordered="false"
                  :single-line="false"
                  :columns
                  :data
                  :scroll-x="1000"
                />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </main>
    </div>
  </div>
</template>
