<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { defineComponent, ref, h, reactive, computed, onMounted } from "vue";
import { NButton, NDataTable, NDropdown, NInputNumber } from "naive-ui";
import axios from "axios";
import dayjs from "dayjs";

// Định nghĩa interface cho dữ liệu bảng
interface RowData {
  created_at: string;
  id: string;
  stt: number;
  monhoc: string;
  danhmuc: string;
  hocphi: number;
  sobuoi: number;
  solop: number;
  chuaxep: number;
  date: string;
  status: string;
  input_require: string;
  output_require: string;
  fee_type: number | string;
  thumbnail: string;
  total_lessons: number;
  origin_fee: number;
  discount_fee: number;
  color: string;
}

export default defineComponent({
  name: "SubjectComponent",
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
    const data = ref<RowData[]>([]);
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const Danhmuclist = ref("");
    const Status = ref("");
    const token = ref("");
    const loading = ref(false);
    const danhmucoptions = ref([{ label: "Tất cả danh mục", value: "All" }]);
    const danhmucstate = ref<"info" | "list">("list");
    const danhmucId = ref<string>("");
    const formValue = reactive({
      name: "",
      description: "",
      is_active: true,
      input_require: "",
      output_require: "",
      fee_type: "",
      total_lessons: 0,
      thumbnail: "",
      code: "",
      origin_fee: 0,
      discount_fee: 0,
      color: "",
    });
    const isLoading = ref<boolean>(false);
    const railStyle = { backgroundColor: "#ccc" };

    if (typeof window !== "undefined" && window.sessionStorage) {
      token.value = localStorage.getItem("auth_token") || "";
    }

    async function fetchData() {
      loading.value = true;
      try {
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
          hocphi: subject.origin_fee,
          sobuoi: subject.total_lessons,
          solop: subject.class_total,
          chuaxep: subject.student_pendings,
          date: subject.created_at,
          input_require: subject.input_require,
          output_require: subject.output_require,
          fee_type: subject.fee_type,
          total_lessons: subject.total_lessons,
          thumbnail: subject.thumbnail,
          origin_fee: subject.origin_fee,
          discount_fee: subject.discount_fee,
          status: subject.is_active ? "Hoạt động" : "Không hoạt động",
          color: subject.metadata?.color || "",
        }));

        // Lấy danh mục từ subjects
        const categorySet = new Set<string>();
        subjects.forEach((subject: any) => {
          if (subject.category && subject.category.name) {
            categorySet.add(subject.category.name);
          }
        });
        danhmucoptions.value = [
          { label: "Tất cả danh mục", value: "All" },
          ...Array.from(categorySet).map((name) => ({
            label: name,
            value: name,
          })),
        ];
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      fetchData();
    });

    // lấy thông tin subject theo id
    const fetchSubjectById = async (id: string) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/admin/subject/?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          },
        );
        const subjectInfo = response.data.data;
        console.log("Thông tin subject:", subjectInfo);
        return subjectInfo;
      } catch (error: any) {
        console.error(
          "Lỗi lấy thông tin subject theo id:",
          error.response?.data || error.message,
        );
        return null;
      }
    };

    // API lấy thông tin subject theo id
    const editRow = async (row: RowData) => {
      danhmucstate.value = "info";
      danhmucId.value = row.id;
      const subjectInfo = await fetchSubjectById(row.id);
      if (subjectInfo) {
        formValue.name = subjectInfo.name;
        formValue.description = subjectInfo.description;
        formValue.is_active = subjectInfo.is_active;
        formValue.input_require = subjectInfo.input_require;
        formValue.output_require = subjectInfo.output_require;
        formValue.fee_type = subjectInfo.fee_type.toString();
        formValue.total_lessons = subjectInfo.total_lessons;
        formValue.thumbnail = subjectInfo.thumbnail;
        formValue.code = subjectInfo.code;
        formValue.origin_fee = subjectInfo.origin_fee;
        formValue.discount_fee = subjectInfo.discount_fee;
        formValue.color = subjectInfo.metadata?.color || "";
      }
    };

    const handleSubmit = async () => {
      isLoading.value = true;
      try {
        const payload = {
          id: danhmucId.value,
          name: formValue.name,
          is_active: formValue.is_active,
          description: formValue.description,
          input_require: formValue.input_require,
          output_require: formValue.output_require,
          code: formValue.code,
          fee_type: Number(formValue.fee_type),
          total_lessons: formValue.total_lessons,
          origin_fee: formValue.origin_fee,
          discount_fee: formValue.discount_fee,
          metadata: {
            color: formValue.color,
          },
          thumbnail: formValue.thumbnail,
        };

        console.log("Payload gửi đi:", payload);

        const response = await axios.patch(
          `http://localhost:3000/api/admin/subject`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.value}`,
            },
          },
        );

        const index = data.value.findIndex(
          (subject) => subject.id === danhmucId.value,
        );
        if (index !== -1) {
          data.value[index].monhoc = formValue.name;
          data.value[index].status = formValue.is_active
            ? "Hoạt động"
            : "Không hoạt động";
        }
        console.log("Môn học đã được cập nhật:", response.data);
        danhmucstate.value = "list";
        danhmucId.value = "";
      } catch (error: any) {
        console.error(
          "Lỗi cập nhật môn học:",
          error.response?.data || error.message,
        );
      } finally {
        isLoading.value = false;
      }
    };

    const cancelEdit = () => {
      danhmucstate.value = "list";
      danhmucId.value = "";
    };

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
      danhmucoptions,
      statusoptions: [
        { label: "All", value: "All" },
        { label: "Hoạt động", value: "Hoạt động" },
        { label: "Không hoạt động", value: "Không hoạt động" },
      ],
      danhmucstate,
      danhmucId,
      formValue,
      isLoading,
      railStyle,
      handleSubmit,
      cancelEdit,
    };
  },
});

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
      filter(value, row) {
        return row.danhmuc.includes(value as string);
      },
    },
    {
      title: "Học phí(VNĐ)",
      key: "hocphi",
      defaultSortOrder: "ascend",
      sorter: "default",
      render(row) {
        return row.fee_type == 1
          ? "miễn phí"
          : Number(row.hocphi).toLocaleString("en-US");
      },
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
        ]);
      },
    },
  ];
}
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <div class="flex-1" v-show="danhmucstate === 'list'">
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
    <div v-show="danhmucstate === 'info'" class="w-full p-4">
      <n-grid cols="1" class="w-full">
        <n-gi>
          <n-grid cols="2" :x-gap="40">
            <n-gi>
              <n-gi>
                <n-form-item label="Tên danh mục" path="name">
                  <n-input
                    v-model:value="formValue.name"
                    placeholder="Nhập tên danh mục"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Mô tả" path="description">
                  <n-input
                    v-model:value="formValue.description"
                    placeholder="Nhập mô tả"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item
                  class="flex text-4xl"
                  label="Trạng thái hoạt động"
                  label-placement="left"
                  path="switchValue"
                >
                  <n-switch
                    v-model:value="formValue.is_active"
                    :unchecked-value="false"
                    :checked-value="true"
                  />
                </n-form-item>
              </n-gi>
            </n-gi>
            <n-gi>
              <n-gi>
                <n-form-item label="Ảnh đại diện khóa học" path="cover">
                  <div>
                    <img
                      src="../../../public/images/subject.png"
                      :square="false"
                      :width="250"
                      :height="150"
                      class="rounded-xl"
                    />
                    <div class="mt-2">
                      <label
                        for="cover-upload"
                        class="cursor-pointer text-sm text-blue-500 hover:underline"
                      >
                        Chỉnh sửa ảnh
                      </label>
                      <input
                        type="file"
                        id="cover-upload"
                        class="hidden"
                        accept="image/*"
                      />
                    </div>
                    <p class="text-xs text-gray-500">
                      Cho phép ảnh jpeg, jpg, png. Size ảnh tối đa 3.1 MB
                    </p>
                  </div>
                </n-form-item>
              </n-gi>
            </n-gi>
          </n-grid>
        </n-gi>

        <n-gi>
          <n-grid cols="1" class="mt-4" :x-gap="20">
            <n-gi>
              <n-form-item label="Input Require" path="input_require">
                <n-input
                  v-model:value="formValue.input_require"
                  placeholder="Nhập input require"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Output Require" path="output_require">
                <n-input
                  v-model:value="formValue.output_require"
                  placeholder="Nhập output require"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Fee Type" path="fee_type">
                <n-input
                  v-model:value="formValue.fee_type"
                  placeholder="Nhập fee type"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Total Lessons" path="total_lessons">
                <n-input-number
                  v-model:value="formValue.total_lessons"
                  placeholder="Nhập tổng số buổi học"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Thumbnail" path="thumbnail">
                <n-input
                  v-model:value="formValue.thumbnail"
                  placeholder="Nhập URL thumbnail hoặc chọn file"
                />
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-gi>
        <n-gi style="display: flex; justify-content: center">
          <n-grid cols="2" :x-gap="40">
            <n-gi style="display: flex; justify-content: flex-end">
              <n-button
                round
                class="h-12 w-52 rounded-2xl text-lg text-blue-400"
                @click="cancelEdit"
              >
                Hủy
              </n-button>
            </n-gi>
            <n-gi>
              <n-button
                round
                type="info"
                :loading="isLoading"
                class="h-12 w-52 rounded-2xl text-lg"
                @click.prevent="handleSubmit"
              >
                Lưu
              </n-button>
            </n-gi>
          </n-grid>
        </n-gi>
      </n-grid>
    </div>
  </div>
</template>
