<script lang="ts">
import { NButton, type DataTableColumns } from "naive-ui";
import {
  defineComponent,
  ref,
  h,
  reactive,
  computed,
  onMounted,
  toRaw,
} from "vue";
import { message } from "ant-design-vue";

export default defineComponent({
  setup() {
    interface Classrooms {
      id: string;
      stt: number;
      name: string;
      slots: number;
      is_active: boolean;
      room_type: string;
      branch_id: string;
      center_id: string;
      branches: string;
      center: string;
    }

    const { restAPI } = useApi();
    if (!restAPI?.cms?.getClassrooms) {
      console.error("API getClassrooms chưa được định nghĩa!");
    }

    const paginationReactive = reactive({
      page: 1,
      pageSize: 5,
      showSizePicker: true,
      pageSizes: [5, 10, 15],
      itemCount: computed(() => classrooms.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });

    const classrooms = ref<Classrooms[]>([]);
    const branches = ref<{ label: string; value: string }[]>([]);
    const center = ref<{ label: string; value: string }[]>([]);
    const data = ref<Classrooms[]>([]);
    const isLoading = ref(false);

    const loadClassrooms = async () => {
      try {
        isLoading.value = true;
        const { data: resData, error } = await restAPI.cms.getClassrooms({});

        if (error?.value) {
          throw new Error(
            error.value.data?.message || "Lỗi khi tải danh sách phòng học",
          );
        }

        classrooms.value = resData.value?.data?.data || [];
        data.value = classrooms.value.map(
          (classroom: Classrooms, index: number) => {
            return {
              id: classroom.id,
              stt: index + 1, // Gán số thứ tự
              name: classroom.name,
              slots: classroom.slots,
              is_active: classroom.is_active,
              room_type: classroom.room_type,
              branch_id: classroom.branch_id,
              center_id: classroom.center_id,
              branches: classroom.branches,
              center: classroom.center,
            };
          },
        );
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      } finally {
        isLoading.value = false;
      }
    };
    const fetchBranches = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getBranches({});
        if (error?.value) {
          message.error(
            error?.value?.data?.message || "Lỗi tải danh sách chi nhánh",
          );
          return;
        }
        branches.value =
          resData.value?.data?.map((branch: any) => ({
            label: branch.Name,
            value: branch.id,
          })) || [];
      } catch (err) {
        console.error("Lỗi khi tải danh sách chi nhánh:", err);
      }
    };

    const fetchCenter = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getCenter({});

        if (error?.value) {
          message.error(
            error?.value?.data?.message || "Lỗi tải danh sách trung tâm",
          );
          return;
        }

        const centerData = resData.value?.data;
        if (!centerData || typeof centerData !== "object") {
          message.error("Lỗi định dạng dữ liệu trung tâm.");
          return;
        }

        center.value = [
          {
            label: centerData.address,
            value: centerData.id,
          },
        ];
      } catch (err) {
        console.error("Lỗi khi tải danh sách trung tâm:", err);
      }
    };

    const addClassroom = async (newClassroom) => {
      try {
        const { error } = await restAPI.cms.createClassroom(newClassroom);
        if (error?.value)
          throw new Error(
            error.value.data?.message || "Lỗi khi thêm phòng học",
          );

        message.success("Thêm phòng học thành công");
        loadClassrooms();
      } catch (error) {
        message.error(error.message || "Lỗi khi thêm phòng học");
        console.error(error);
      }
    };

    const editClassroom = async (updatedClassroom) => {
      try {
        const { error } = await restAPI.cms.updateClassroom(
          updatedClassroom.id,
          updatedClassroom,
        );
        if (error?.value)
          throw new Error(
            error.value.data?.message || "Lỗi khi cập nhật phòng học",
          );

        message.success("Cập nhật phòng học thành công");
        loadClassrooms();
      } catch (error) {
        message.error(error.message || "Lỗi khi cập nhật phòng học");
        console.error(error);
      }
    };

    const deleteClassroom = async (id) => {
      try {
        const { error } = await restAPI.cms.deleteClassroom(id);
        if (error?.value)
          throw new Error(error.value.data?.message || "Lỗi khi xóa phòng học");

        message.success("Xóa phòng học thành công");
        loadClassrooms();
      } catch (error) {
        message.error(error.message || "Lỗi khi xóa phòng học");
        console.error(error);
      }
    };

    function createColumns(): DataTableColumns<Classrooms> {
      return [
        { title: "STT", key: "stt" },
        { title: "Tên phòng học", key: "name" },
        { title: "Sức chứa", key: "slots" },
        {
          title: "Chi nhánh",
          key: "branch_id",
          render(row) {
            return computed(() => {
              const branch = branches.value.find(
                (b) => b.value === row.branch_id,
              );
              return branch ? branch.label : "Không xác định";
            }).value;
          },
        },
        {
          title: "Trung tâm",
          key: "center_id",
          render(row) {
            return computed(() => {
              const cen = center.value.find((c) => c.value === row.center_id);
              return cen ? cen.label : "Không xác định";
            }).value;
          },
        },

        {
          title: "Loại phòng",
          key: "room_type",
          render(row) {
            const onlineTypes = ["Zoom", "Live class", "Google Meet"];
            const offlineTypes = ["practicing", "theory"];

            if (onlineTypes.includes(row.room_type)) {
              return `Online (${row.room_type})`;
            } else if (offlineTypes.includes(row.room_type)) {
              return `Offline (${row.room_type})`;
            } else {
              return "Không xác định";
            }
          },
        },
        {
          title: "Trạng thái",
          key: "is_active",
          render(row) {
            return row.is_active ? "Còn trống" : "Đã có lớp";
          },
        },
        {
          title: "Hành động",
          key: "actions",
          titleAlign: "center",
          render(row) {
            return h("div", { class: "flex gap-2 justify-center" }, [
              h(
                NButton,
                {
                  size: "small",
                  type: "primary",
                  // onClick: () => editClassroom(row),
                },
                "Sửa",
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "error",
                  // onClick: () => deleteClassroom(row.id),
                },
                "Xóa",
              ),
            ]);
          },
        },
      ];
    }

    onMounted(() => {
      fetchBranches();
      fetchCenter();
      loadClassrooms();
    });

    return {
      isLoading,
      classrooms,
      columns: createColumns(),
      pagination: paginationReactive,
    };
  },
});
</script>
<template>
  <div class="h-full w-full overflow-auto rounded-2xl bg-white p-4">
    <n-data-table
      :bordered="false"
      :single-line="false"
      :columns="columns"
      :data="classrooms"
      :loading="isLoading"
      :pagination="pagination"
    />
  </div>
</template>
