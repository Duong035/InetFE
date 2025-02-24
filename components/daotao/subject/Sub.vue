<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { defineComponent, ref, h, reactive, computed, onMounted } from "vue";
import { NButton, NDataTable, NDropdown } from "naive-ui";
import axios from "axios";
import dayjs from "dayjs";
// Định nghĩa interface cho dữ liệu bảng
interface RowData {
  created_at: string;
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
    title: "Xem học viên chưa xếp lớp",
    key: "Xem học viên chưa xếp lớp",
  },
  {
    title: "Xem danh sách môn học",
    key: "Xem danh sách môn học",
  },
];

export default defineComponent({
  setup() {
    // Cấu hình phân trang
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
    const data = ref<RowData[]>([]);
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const Danhmuclist = ref("");
    const Status = ref("");
    const token = ref("");
    const loading = ref(false);

    // Retrieve token from localStorage safely
    if (typeof window !== "undefined" && window.localStorage) {
      token.value =
        localStorage.getItem("authToken") ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDA4MjU2MzEsInJvbGUiOiJvd25lciIsInJvbGVfaWQiOjIsInNpdGVfaWQiOiIwYjc4YjA5Yi0wOGQ0LTRiYTYtODc2Yy04NDZmMDYwMmU1ZWYiLCJzdGF0dXMiOnRydWUsInVzZXJfaWQiOiI5OWMzZGE0My1jNWRmLTQ1ZGYtODk0ZS1hODg0NDgwNzAxYTAifQ.ehgQDrm2XIVXqIDXR7KGqx1QvznSz4WDd-A2-0qkpgc";
    }
    // Mảng chứa dữ liệu bảng

    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }

    // Lấy dữ liệu subjects từ API và chuyển đổi sang RowData
    async function fetchData() {
      loading.value = true;
      try {
        console.log("Fetching users...");
        console.log("Token used:", token.value);
        const response = await axios.get(
          "http://localhost:3000/api/admin/subjects",
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          },
        );
        const subjects = response.data.data.subjects;
        data.value = subjects.map((subject: any, index: number) => ({
          id: subject.id,
          stt: index + 1,
          monhoc: subject.name,
          danhmuc: subject.category ? subject.category.name : "",
          hocphi: subject.origin_fee.toString(),
          sobuoi: subject.total_lessons.toString(),
          solop: subject.class_total.toString(),
          chuaxep: subject.student_pendings.toString(),
          date: subject.created_at,
          status: subject.is_active ? "Hoạt động" : "Không hoạt động",
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    onMounted(() => {
      filterStatus();
      fetchData();
    });

    // Hàm cập nhật dữ liệu (Edit)
    const editRow = async (row: RowData) => {
      const newName = prompt("Nhập tên môn học mới:", row.monhoc);

      if (newName !== null && newName !== row.monhoc) {
        try {
          const response = await axios.patch(
            `http://localhost:3000/api/admin/subject`,
            { id: row.id, name: newName },
            {
              headers: {
                Authorization: `Bearer ${token.value}`,
              },
            },
          );
          // Cập nhật lại dữ liệu trong mảng cục bộ
          const index = data.value.findIndex(
            (subject) => subject.id === row.id,
          );
          if (index !== -1) {
            data.value[index].monhoc = newName;
          }
          console.log("Môn học đã được cập nhật:", response.data);
        } catch (error) {
          console.error("Lỗi cập nhật môn học:", error);
        }
      }
    };

    // Hàm xóa dữ liệu (Delete)
    const deleteSub = async (row: RowData) => {
      if (confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
        try {
          const response = await axios.delete(
            `http://localhost:3000/api/admin/subject`,
            {
              headers: {
                Authorization: `Bearer ${token.value}`,
              },
              data: { id: row.id },
            },
          );
          data.value = data.value.filter((subject) => subject.id !== row.id);
          console.log("Môn học đã được xóa:", response.data);
        } catch (error) {
          console.error("Lỗi xóa môn học:", error);
        }
      }
    };
    // Tạo các cột của bảng, truyền editRow và deleteSub vào hàm createColumns
    const columns = createColumns(editRow, deleteSub);

    return {
      delModal,
      Status,
      Danhmuclist,
      data,
      columns,
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

// Hàm tạo cột cho n-data-table, nhận hai hàm editRow và deleteSub từ setup
function createColumns(
  editRow: (row: RowData) => void,
  deleteSub: (row: RowData) => void,
): DataTableColumns<RowData> {
  return [
    {
      title: "STT",
      key: "stt",
      titleAlign: "center",
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
      key: "created_at",
      defaultSortOrder: "ascend",
      sorter: "default",
      render(row) {
        return dayjs(row.created_at).format("DD-MM-YYYY");
      },
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
      defaultFilterOptionValues: ["Hoạt động", "Không hoạt động"],
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
              onclick: () => editRow(row),
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
              onclick: () => deleteSub(row),
            },
            { default: () => h("i", { class: "fa-solid fa-trash" }) },
          ),
          // h(
          //   NDropdown,
          //   {
          //     trigger: "click",
          //     options: actionMenu,
          //     quaternary: true,
          //     style: { color: "gray" },
          //     onSelect(key) {
          //       if (key === "Xem học viên chưa xếp lớp") {
          //         editRow(row);
          //       } else if (key === "Xem danh sách môn học") {
          //         deleteSub(row);
          //       }
          //     },
          //   },
          //   { default: () => h("i", { class: "fa-solid fa-ellipsis-v" }) },
          // ),
        ]);
      },
    },
  ];
}
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
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
                placeholder="Tất cả trạng thái"
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
  </div>
</template>
