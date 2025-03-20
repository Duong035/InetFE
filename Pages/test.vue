<script lang="ts">
import type { DataTableColumns, DataTableRowKey, SelectOption } from "naive-ui";
import { defineComponent, ref, h, onMounted } from "vue";
import { c, NButton, NDataTable, NDropdown } from "naive-ui";

export default defineComponent({
  setup() {
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const hocvienStatus = ref("");
    const accountStatus = ref("");
    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }
    onMounted(() => {
      filterStatus();
    });

    return {
      hocvienStatus,
      accountStatus,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: {
        pageSize: 5,
      },
      filterStatus() {
        if (dataTableInstRef.value) {
          if (hocvienStatus.value === "All") {
            if (accountStatus.value == "All") {
              dataTableInstRef.value.filter(null);
            } else {
              dataTableInstRef.value.filter({
                status: [accountStatus.value || ""],
              });
            }
          } else {
            if (accountStatus.value == "All") {
              dataTableInstRef.value.filter({
                hocvienstatus: [hocvienStatus.value || ""],
              });
            } else {
              dataTableInstRef.value.filter({
                hocvienstatus: [hocvienStatus.value || ""],
                status: [accountStatus.value || ""],
              });
            }
          }
        }
      },
      rowKey: (row: RowData) => row.status,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
      },
      time: ref(null),
      value: ref(null),
      options: [
        {
          label: "All",
          value: "All",
        },
        {
          label: "Học viên tiềm năng",
          value: "Học viên tiềm năng",
        },
        {
          label: "Học viên học thử",
          value: "Học viên học thử",
        },
        {
          label: "Học viên chính thức",
          value: "Học viên chính thức",
        },
      ],
      statusoptions: [
        {
          label: "All",
          value: "All",
        },
        {
          label: "Hoạt động",
          value: "Hoạt động",
        },
        {
          label: "Khóa",
          value: "Khóa",
        },
      ],
    };
  },
});
interface RowData {
  stt: number;
  hocvien: string;
  email: string;
  mhht: string;
  mdxl: string;
  date: string;
  hocvienstatus: string;
  status: string;
}
const actionMenu = [
  {
    title: "Xếp lớp",
    key: "Xep",
  },
  {
    title: "Dừng hoạt động",
    key: "Stop",
  },
];
function createColumns(): DataTableColumns<RowData> {
  return [
    {
      type: "selection",
    },
    {
      title: "STT",
      key: "stt",
      titleAlign: "center",
    },
    {
      title: "Học viên",
      key: "hocvien",
    },
    {
      title: "Email",
      key: "email",
    },
    {
      title: "Trạng thái học viên",
      key: "hocvienstatus",
      render(row) {
        let color = "";
        let background = "";
        // switch (row.status) {
        //   case "Đang học":
        //     color = "#00974F";
        //     background = "#F0FFF8";
        //     break;
        //   case "Chưa xếp lớp":
        //     color = "#FF7A00";
        //     background = "#FFF6E1";
        //     break;
        //   case "Bảo lưu":
        //     color = "#4D6FA8";
        //     background = "#ECF1F9";
        //     break;
        //   default:
        //     color = "gray";
        // }
        return h(
          "span",
          // {
          //   style: {
          //     padding: "5px 10px",
          //     borderRadius: "10px",
          //     color,
          //     background,
          //   },
          // },
          row.hocvienstatus,
        );
      },
      defaultFilterOptionValues: [
        "Học viên tiềm năng",
        "Học viên học thử",
        "Học viên chính thức",
      ],
      filter(value, row) {
        return row.hocvienstatus.includes(value as string);
      },
    },
    {
      title: "Ngày tạo",
      key: "date",
    },
    {
      title: "Trạng thái",
      key: "status",
      render(row) {
        let color = "";
        let background = "";
        switch (row.status) {
          case "Hoạt động":
            color = "#00974F";
            background = "#F0FFF8";
            break;
          case "Khóa":
            color = "#4D6FA8";
            background = "#ECF1F9";
            break;
          default:
            color = "gray";
        }
        return h(
          "span",
          {
            style: {
              padding: "5px 10px",
              borderRadius: "10px",
              color,
              background,
            },
          },
          row.status,
        );
      },
      defaultFilterOptionValues: ["Hoạt động", "Khóa"],
      filter(value, row) {
        return row.status.includes(value as string);
      },
    },
    {
      title: "Action",
      key: "actions",
      titleAlign: "center",
      render(row) {
        return h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "center", // Center horizontally
              alignItems: "center", // Align items vertically
              gap: "10px", // Add spacing between buttons
            },
          },
          [
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                style: { backgroundColor: "transparent", color: "green" },
              },
              {
                default: () =>
                  h("i", {
                    class: "fa-regular fa-pen-to-square",
                  }),
              },
            ),
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                style: { backgroundColor: "transparent", color: "red" },
              },
              { default: () => h("i", { class: "fa-solid fa-trash" }) },
            ),
            h(
              NDropdown,
              {
                trigger: "click",
                options: actionMenu,
                quaternary: true,
                style: { color: "gray" },
                onSelect(key) {
                  if (key === "Xếp lớp") {
                    editRow(row);
                  } else if (key === "Dừng hoạt động") {
                    deleteRow(row);
                  }
                },
              },
              { default: () => h("i", { class: "fa-solid fa-ellipsis-v" }) },
            ),
          ],
        );
      },
    },
  ];
}

const data = [
  {
    stt: 1,
    hocvien: "Nguyen Van A",
    email: "leanhkhoi@gmail.com",
    date: "21/07/2023",
    hocvienstatus: "Học viên tiềm năng",
    status: "Hoạt động",
  },
  {
    stt: 2,
    hocvien: "Nguyen Van B",
    email: "leanhkhoi@gmail.com",
    date: "21/07/2022",
    hocvienstatus: "Học viên tiềm năng",
    status: "Khóa",
  },
  {
    stt: 3,
    hocvien: "Nguyen Van C",
    email: "leanhkhoi@gmail.com",
    date: "21/07/2022",
    hocvienstatus: "Học viên học thử",
    status: "Khóa",
  },
  {
    stt: 3,
    hocvien: "Nguyen Van D",
    email: "leanhkhoi@gmail.com",
    date: "21/07/2022",
    hocvienstatus: "Học viên học thử",
    status: "Hoạt động",
  },
  {
    stt: 3,
    hocvien: "Nguyen Van E",
    email: "leanhkhoi@gmail.com",
    date: "21/07/2022",
    hocvienstatus: "Học viên chính thức",
    status: "Khóa",
  },
];
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full">
        <n-card class="h-full bg-gray-50">
          <div class="mx-5 my-5 flex items-center gap-4">
            <h1 class="text-4xl font-bold text-[#133D85]">
              Danh sách tài khoản
            </h1>
            <n-button
              type="info"
              class="h-13 mx-5 flex w-40 items-center justify-center text-center text-xl"
              @click="$router.push('addhocvien')"
            >
              Thêm mới
              <i class="fa-solid fa-plus ml-1 px-2"></i>
            </n-button>
          </div>
          <n-grid
            class="min-h-fit w-full"
            :x-gap="30"
            cols="1 m:7"
            responsive="screen"
          >
            <n-gi span="2">
              <n-form-item>
                <n-input type="text" placeholder="Tìm kiếm học viên" />
              </n-form-item>
            </n-gi>
            <n-gi span="1">
              <n-form-item>
                <n-select
                  v-model="hocvienStatus"
                  :options="options"
                  @change="
                    (() => {
                      hocvienStatus = $event;
                      filterStatus();
                    })()
                  "
                  placeholder="Trạng thái học viên"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="1">
              <n-form-item>
                <n-select
                  v-model="accountStatus"
                  :options="statusoptions"
                  @change="
                    (() => {
                      accountStatus = $event;
                      filterStatus();
                    })()
                  "
                  placeholder="Trạng thái tài khoản"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="1">
              <n-form-item>
                <n-select
                  v-model="accountStatus"
                  :options="statusoptions"
                  @change="
                    (() => {
                      accountStatus = $event;
                      filterStatus();
                    })()
                  "
                  placeholder="Tất cả thời gian"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="1"></n-gi>
            <n-gi span="1" class="flex justify-end">
              <n-form-item>
                <n-button type="info" class="w-42 w-32">
                  Xuất file
                  <i class="fa-solid fa-file-export ml-1"></i>
                </n-button>
              </n-form-item>
            </n-gi>

            <n-gi span="1 m:7">
              <n-data-table
                ref="dataTableInst"
                :bordered="false"
                :single-line="false"
                :columns="columns"
                :data="data"
                :pagination="pagination"
                :row-key="rowKey"
                @update:checked-row-keys="handleCheck"
              />
            </n-gi>
          </n-grid>
        </n-card>
      </div>
    </div>
  </div>
</template>
