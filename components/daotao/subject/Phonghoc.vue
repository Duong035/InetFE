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
    interface Classroom {
      id: string;
      name: string;
      capacity: number;
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

    const classrooms = ref<Classroom[]>([]);
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
        classrooms.value = resData.value.data.data || [];
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      } finally {
        isLoading.value = false;
      }
    };

    // const addClassroom = async (newClassroom) => {
    //   try {
    //     const { error } = await restAPI.cms.createClassroom(newClassroom);
    //     if (error?.value) throw new Error(error.value.data?.message || "Lỗi khi thêm phòng học");

    //     message.success("Thêm phòng học thành công");
    //     loadClassrooms();
    //   } catch (error) {
    //     message.error(error.message || "Lỗi khi thêm phòng học");
    //     console.error(error);
    //   }
    // };

    // const editClassroom = async (updatedClassroom) => {
    //   try {
    //     const { error } = await restAPI.cms.updateClassroom(updatedClassroom.id, updatedClassroom);
    //     if (error?.value) throw new Error(error.value.data?.message || "Lỗi khi cập nhật phòng học");

    //     message.success("Cập nhật phòng học thành công");
    //     loadClassrooms();
    //   } catch (error) {
    //     message.error(error.message || "Lỗi khi cập nhật phòng học");
    //     console.error(error);
    //   }
    // };

    // const deleteClassroom = async (id) => {
    //   try {
    //     const { error } = await restAPI.cms.deleteClassroom(id);
    //     if (error?.value) throw new Error(error.value.data?.message || "Lỗi khi xóa phòng học");

    //     message.success("Xóa phòng học thành công");
    //     loadClassrooms();
    //   } catch (error) {
    //     message.error(error.message || "Lỗi khi xóa phòng học");
    //     console.error(error);
    //   }
    // };

    function createColumns(): DataTableColumns<Classroom> {
      return [
        { title: "ID", key: "id" },
        { title: "Tên phòng học", key: "name" },
        { title: "Sức chứa", key: "capacity" },
        {
          title: "Hành động",
          key: "actions",
          align: "center",
          // render(row) {
          //   return h("div", { class: "flex gap-2 justify-center" }, [
          //     h(
          //       NButton,
          //       {
          //         size: "small",
          //         type: "primary",
          //         onClick: () => editClassroom(row),
          //       },
          //       "Sửa",
          //     ),
          //     h(
          //       NButton,
          //       {
          //         size: "small",
          //         type: "error",
          //         onClick: () => deleteClassroom(row.id),
          //       },
          //       "Xóa",
          //     ),
          //   ]);
          // },
        },
      ];
    }

    onMounted(() => {
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
