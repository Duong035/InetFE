<script lang="ts">
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { defineComponent, ref, h, reactive, computed, onMounted } from "vue";
import { NButton, NDataTable, useMessage } from "naive-ui";

export default defineComponent({
  setup() {
    const message = useMessage();

    const railStyle = ({ focused, checked }) => {
      const style = {};
      if (checked) {
        style.background = "#2080f0";
        if (focused) {
          style.boxShadow = "0 0 0 2px #2080f0";
        }
      }
      return style;
    };

    interface RowData {
      id: string;
      danhmuc: string;
      creator: string;
      date: string;
      status: string;
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
    const danhmucstate = ref("list");
    const danhmucId = ref("");
    const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
    const dataTableInstRef = ref<InstanceType<typeof NDataTable> | null>(null);
    const Status = ref("");
    const isLoading = ref(false);
    const showSpin = ref(false);

    const formValue = reactive({
      name: null,
      thumbnail: null,
      description: null,
      is_active: true,
    });

    function filterStatus() {
      if (dataTableInstRef.value) {
        return dataTableInstRef.value.filter(null);
      }
    }
    function createColumns(): DataTableColumns<RowData> {
      return [
        {
          title: "Danh mục",
          key: "danhmuc",
        },
        {
          title: "Người tạo",
          key: "creator",
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
          width: 100,
          render(row) {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                },
              },
              [
                h(
                  NButton,
                  {
                    size: "small",
                    quaternary: true,
                    style: { backgroundColor: "transparent", color: "green" },
                    onClick: () => edit(row),
                  },
                  () => h("i", { class: "fa-regular fa-pen-to-square" }),
                ),

                h(
                  NButton,
                  {
                    size: "small",
                    quaternary: true,
                    style: { backgroundColor: "transparent", color: "red" },
                    onClick: () => delID(row),
                  },
                  () => h("i", { class: "fa-solid fa-trash" }),
                ),
              ],
            );
          },
        },
      ];
    }

    const data = ref<RowData[]>([]);
    const loadData = async () => {
      //wait 3 second
      showSpin.value = true;

      await new Promise((resolve) => setTimeout(resolve, 1));

      try {
        const { data: resData, error } = await restAPI.cms.getCategories({});

        const rawData = toRaw(resData.value)?.data;
        if (Array.isArray(rawData)) {
          data.value = rawData.map((item: any, index) => ({
            id: item.id || "N/A",
            danhmuc: item.name || "N/A",
            creator: item.created_by.full_name || "N/A",
            date: item.created_at ? item.created_at.split("T")[0] : "N/A",

            status: item.is_active ? "Hoạt động" : "Không hoạt động",
          }));
        } else {
          const errorCode = error.value.data.error;
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resData.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
      } catch (err) {
        showSpin.value = false;
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

    function edit(value: RowData) {
      danhmucId.value = value.id;
      danhmucinfo();
    }

    async function danhmucinfo() {
      if (danhmucId.value) {
        const { data: resData } = await restAPI.cms.getCategoryDetail({
          id: danhmucId.value,
        });
        if (resData.value?.status) {
          const data = resData.value?.data;
          formValue.name = data.name || null;
          formValue.thumbnail = data.thumbnail || null;
          formValue.description = data.description || null;
          formValue.is_active = data.is_active || null;
        }
      } else {
        formValue.name = null;
        formValue.thumbnail = null;
        formValue.description = null;
        formValue.is_active = true;
      }
      danhmucstate.value = "info";
    }

    const handleSubmit = async () => {
      if (isLoading.value) return;

      const { name, thumbnail, description, is_active } = formValue;
      let body = {
        name,
        thumbnail,
        description,
        is_active,
      };
      try {
        if (danhmucId.value && String(danhmucId.value).trim() !== "") {
          const { data: resUpdate, error } = await restAPI.cms.updateCategory({
            id: danhmucId.value,
            body,
          });
          if (resUpdate?.value?.status) {
            message.success("Cập nhật danh mục thành công!");
          } else {
            const errorCode = error.value.data.error;
            const errorMessage =
              ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
              resUpdate.value?.message ||
              "Đã xảy ra lỗi, vui lòng thử lại!";

            message.warning(errorMessage);
          }
        } else {
          const { data: resCreate, error } = await restAPI.cms.createCategory({
            body,
          });
          if (resCreate?.value?.status) {
            message.success("Tạo danh mục thành công!");
          } else {
            const errorCode = error.value.data.error;
            const errorMessage =
              ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
              resCreate.value?.message ||
              "Đã xảy ra lỗi, vui lòng thử lại!";

            message.warning(errorMessage);
          }
        }
      } catch {
      } finally {
        isLoading.value = false;
        loadData();
        danhmucstate.value = "list";
        danhmucId.value = "";
      }
    };

    function delID(value: RowData) {
      danhmucId.value = value.id;
      handleDelete(danhmucId.value);
    }
    const handleDelete = async (e) => {
      if (isLoading.value) return;

      try {
        const { data: resdel, error } = await restAPI.cms.deleteCategory({
          id: danhmucId.value,
        });
        if (resdel?.value?.status) {
          message.success("Xóa danh mục thành công!");
        } else {
          const errorCode = error.value.data.error;
          console.log(errorCode);
          const errorMessage =
            ERROR_CODES[errorCode as keyof typeof ERROR_CODES] ||
            resdel.value?.message ||
            "Đã xảy ra lỗi, vui lòng thử lại!";

          message.warning(errorMessage);
        }
      } catch {
      } finally {
        isLoading.value = false;
        loadData();
        danhmucstate.value = "list";
      }
    };
    onMounted(() => {
      filterStatus();
      loadData();
    });

    return {
      railStyle,
      danhmucstate,
      isLoading,
      danhmucId,
      handleSubmit,
      formValue,
      danhmucinfo,
      Status,
      data,
      showSpin,
      columns: createColumns(),
      dataTableInst: dataTableInstRef,
      checkedRowKeys: checkedRowKeysRef,
      pagination: paginationReactive,
      filterStatus() {
        if (dataTableInstRef.value) {
          if (Status.value == "All") {
            dataTableInstRef.value.filter(null);
          } else {
            dataTableInstRef.value.filter({
              status: [Status.value || ""],
            });
          }
        }
      },
      rowKey: (row: RowData) => row.id,
      handleCheck(rowKeys: DataTableRowKey[]) {
        checkedRowKeysRef.value = rowKeys;
      },
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
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-white">
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
              <n-input type="text" placeholder="Tìm kiếm danh mục" />
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
                <i class="fa-solid fa-file-export pl-2"></i>
              </n-button>
            </n-form-item>
          </n-gi>
          <n-gi style="display: flex; justify-content: flex-end">
            <n-form-item>
              <n-button type="info" class="w-28" @click="danhmucinfo">
                Thêm mới<i class="fa-solid fa-plus pl-2"></i>
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
            />
          </n-gi>
        </n-grid>
      </div>
    </div>
    <div v-show="danhmucstate === 'info'" class="w-full">
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
                    :rail-style="railStyle"
                  />
                </n-form-item>
              </n-gi>
            </n-gi>
            <n-gi
              ><n-gi>
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
        <n-gi style="display: flex; justify-content: center">
          <n-grid cols="2" :x-gap="40">
            <n-gi style="display: flex; justify-content: flex-end">
              <n-button
                round
                class="h-12 w-52 rounded-2xl text-lg text-blue-400"
                @click="
                  danhmucstate = 'list';
                  danhmucId = '';
                "
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
