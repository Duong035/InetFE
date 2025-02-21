<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { defineComponent, ref, h, reactive, computed } from "vue";
import { NButton, NDataTable, NDropdown } from "naive-ui";
import { onMounted } from "vue";

export default defineComponent({
  setup() {
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
    const delModal = ref(false);
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const Danhmuclist = ref("");
    const Status = ref("");
    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }
    onMounted(() => {
      filterStatus();
    });

    return {
      delModal,
      Status,
      Danhmuclist,
      data,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,
      filterStatus() {
        if (dataTableInstRef.value) {
          if (Danhmuclist.value === "All") {
            if (Status.value == "All") {
              dataTableInstRef.value.filter(null);
            } else {
              dataTableInstRef.value.filter({
                status: [Status.value || ""],
              });
            }
          } else {
            if (Status.value == "All") {
              dataTableInstRef.value.filter({
                danhmuc: [Danhmuclist.value || ""],
              });
            } else {
              dataTableInstRef.value.filter({
                danhmuc: [Danhmuclist.value || ""],
                status: [Status.value || ""],
              });
            }
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
      },
      danhmucoptions: [
        {
          label: "Tất cả danh mục",
          value: "All",
        },
        {
          label: "Thiết kế đồ họa",
          value: "Thiết kế đồ họa",
        },

        {
          label: "Công nghệ thông tin",
          value: "Công nghệ thông tin",
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
          label: "Không hoạt động",
          value: "Không hoạt động",
        },
      ],
    };
  },
});
function createColumns(): DataTableColumns<RowData> {
  return [
    {
      title: "STT",
      key: "stt",
      titleAlign: "center",
      defaultSortOrder: "ascend",
      sorter: "default",
    },
    {
      title: "Môn học",
      key: "monhoc",
    },
    {
      title: "Danh mục",
      key: "danhmuc",
      defaultFilterOptionValues: ["Thiết kế đồ họa", "Công nghệ thông tin"],
      filter(value, row) {
        return row.danhmuc.includes(value as string);
      },
    },
    {
      title: "Học phí(VNĐ)",
      key: "hocphi",
      defaultSortOrder: "ascend",
      sorter: "default",
    },
    {
      title: "Số buổi",
      key: "sobuoi",
      defaultSortOrder: "ascend",
      sorter: "default",
    },
    {
      title: "Số lớp",
      key: "solop",
      defaultSortOrder: "ascend",
      sorter: "default",
    },
    {
      title: "Số học viên chưa xếp lớp",
      key: "chuaxep",
      defaultSortOrder: "ascend",
      sorter: "default",
    },
    {
      title: "Ngày tạo",
      key: "date",
      defaultSortOrder: "ascend",
      sorter: "default",
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
          case "Không hoạt động":
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
      defaultFilterOptionValues: ["Hoạt động", "Dừng hoạt động"],
      filter(value, row) {
        return row.status.includes(value as string);
      },
    },

    {
      title: "Action",
      key: "actions",
      titleAlign: "center",
      render(row) {
        return h("div", [
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
              style: {
                backgroundColor: "transparent",
                color: "red",
                onClick: () => openDeleteModal(),
              },
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
                if (key === "Xem học viên chưa xếp lớp") {
                  this.editRow(row);
                } else if (key === "Xem danh sách môn học") {
                  this.deleteRow(row);
                }
              },
            },
            { default: () => h("i", { class: "fa-solid fa-ellipsis-v" }) },
          ),
        ]);
      },
    },
  ];
}
interface RowData {
  id: string;
  stt: number;
  monhoc: string;
  danhmuc: string;
  hocphi: string;
  sobuoi: string;
  solop: string;
  chuaxep: string;
  date: string;
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
const data = ref<RowData[]>([
  {
    id: "1",
    stt: 1,
    monhoc: "MH2412345-Thiết kế cơ bản",
    danhmuc: "Thiết kế đồ họa",
    hocphi: "2.000.000",
    sobuoi: "12",
    solop: "11",
    chuaxep: "10",
    date: "25/10/2024",
    status: "Hoạt động",
  },
  {
    id: "1",
    stt: 2,
    monhoc: "MH2412345-Thiết kế cơ bản",
    danhmuc: "Thiết kế đồ họa",
    hocphi: "1.000.000",
    sobuoi: "12",
    solop: "11",
    chuaxep: "10",
    date: "25/10/2024",
    status: "Hoạt động",
  },
  {
    id: "1",
    stt: 3,
    monhoc: "MH2412345-Thiết kế cơ bản",
    danhmuc: "Công nghệ thông tin",
    hocphi: "1.000.000",
    sobuoi: "12",
    solop: "11",
    chuaxep: "10",
    date: "25/10/2024",
    status: "Không hoạt động",
  },
]);
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="h-full bg-white text-black">
        <n-grid
          class="-mt-5 min-h-fit w-full"
          :x-gap="20"
          cols="1 m:5"
          responsive="screen"
        >
          <n-gi span="2">
            <n-form-item>
              <n-input type="text" placeholder="Tìm kiếm mã, tên môn học" />
            </n-form-item>
          </n-gi>
          <n-gi span="1">
            <n-form-item>
              <n-select
                v-model="Danhmuclist"
                :options="danhmucoptions"
                placeholder="Danh mục"
                @change="
                  (() => {
                    Danhmuclist = $event;
                    filterStatus();
                  })()
                "
              />
            </n-form-item>
          </n-gi>
          <n-gi span="1">
            <n-form-item>
              <n-select
                v-model="Status"
                :options="statusoptions"
                @change="
                  (() => {
                    Status = $event;
                    filterStatus();
                  })()
                "
                placeholder="Tất cả  trạng thái"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item>
              <n-button type="info" class="w-28">
                Xuất file
                <Icon
                  name="fe:export"
                  width="24"
                  height="24"
                  style="margin-left: 5px"
                />
              </n-button>
            </n-form-item>
          </n-gi>

          <n-gi span="1 m:20">
            <n-data-table
              ref="dataTableInst"
              :bordered="false"
              :single-line="false"
              :columns="columns"
              :data="data"
              :scroll-x="1000"
              :pagination="pagination"
              :row-key="rowKey"
              @update:checked-row-keys="handleCheck"
            />
          </n-gi>
        </n-grid>
      </div>
    </div>
    <n-modal
      v-model:show="showModal"
      preset="card"
      title="Xác nhận xóa"
      closable
      @close="showModal = false"
      style="max-width: 450px; width: 90%; margin: 0 auto; text-align: center"
    >
      <p>Bạn có chắc chắn muốn xóa nhu cầu học tập này không?</p>
      <template #footer>
        <div class="flex justify-center gap-2">
          <n-button @click="showModal = false">Hủy</n-button>
          <n-button type="error" @click="confirmDelete">Xác nhận</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
