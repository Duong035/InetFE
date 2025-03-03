<script setup>
import { onMounted, ref, nextTick } from "vue";
import { NPopover } from "naive-ui";
import { useRoute } from "vue-router";

const { restAPI } = useApi();
const switchValue = ref(2);
const PermsList = ref([]);
const selectedData = defineModel();
const keyLevel1 = ref();
const keyLevel2 = ref();
const route = useRoute();

const isAll = ref(false);
const formValue = ref({
  name: null,
});

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

const rules = {
  name: {
    required: true,
    trigger: ["input", "blur"],
    validator: (rule, value) => {
      const newValue = value?.trim();
      return new Promise((resolve, reject) => {
        if (!newValue) reject(Error("Tên nhóm quyền không được để trống."));
        else if (newValue.length > 50)
          reject(Error("Bạn đã nhập vượt quá 50 ký tự."));
        else return resolve();
      });
    },
  },
};

const { data: resData, error } = await restAPI.cms.getPermissionTags({});
console.log("Dtc", resData);
const listPer = resData.value?.data?.data || [];
const permissionWith = resData.value?.data?.permissions_going_with || {};
listPer.forEach((level1) => {
  const lv1 = {
    id: level1.id,
    name: level1.name,
    key: level1?.key || null,
    checked: !!isAll.value,
    countSelected: 0, // <--- Initialize countSelected
    listLevel1: level1.sub_tags?.map((level2) => {
      const lv2 = {
        id: level2.id,
        name: level2.name,
        key: level2?.key || null,
        checked: !!isAll.value,
        total: level2.permissions?.length || 0,
        listLevel2: level2.permissions?.map((level3) => {
          return {
            id: level3.id,
            name: level3.name,
            disabled: false,
            action: level3.action,
            checked: false,
          };
        }),
      };
      return lv2;
    }),
  };

  lv1.countSelected = lv1.listLevel1.reduce((acc, curr) => {
    return acc + (curr.listLevel2?.length || 0);
  }, 0);

  PermsList.value.push(lv1);
});

if (route.params.slug && !isAll.value) {
  const editDataTags = props.data?.tags || [];
  updateCheckedStatus(editDataTags, PermsList.value);
  updatePermissions(PermsList.value, permissionWith);
} else {
  updatePermissions(PermsList.value, permissionWith);
}
console.log(PermsList);
selectedData.value = PermsList.value;

function updateCheckedStatus(oldArray, newArray) {
  function updateLevel(oldList, newList) {
    for (let oldItem of oldList) {
      const newItem = newList.find((item) => item.id === oldItem.id);
      if (newItem) {
        newItem.checked = oldItem.checked;

        if (oldItem.listLevel1 && newItem.listLevel1) {
          updateLevel(oldItem.listLevel1, newItem.listLevel1);
        }
        if (oldItem.listLevel2 && newItem.listLevel2) {
          updateLevel(oldItem.listLevel2, newItem.listLevel2);
        }
      }
    }
  }

  updateLevel(oldArray, newArray);
}
watch(
  () => selectedData.value,
  () => {
    const currentTag = selectedData.value.find((t) => t.id == keyLevel1.value);
    if (currentTag) {
      currentTag.checked = currentTag.listLevel1.every((tag) => tag.checked);
    }
    isAll.value = selectedData.value.every((tag) => tag.checked);
    updatePermissions(selectedData.value, permissionWith);
  },
  {
    deep: true,
  },
);
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  console.log("Initial keyLevel1 value:", keyLevel1.value);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

function handleCheckAll(checked) {
  selectedData.value.forEach((lv1) => {
    lv1.checked = checked;
    lv1.listLevel1.forEach((lv2) => {
      lv2.checked = checked;
      lv2.listLevel2.forEach((lv3) => {
        lv3.checked = checked;
        if (!checked) lv3.disabled = checked;
      });
    });
  });
}
function handleSelectLevel1(checked, tag) {
  tag.checked = checked;
  tag.listLevel1.forEach((lv1) => {
    lv1.checked = checked;
    lv1.listLevel2.forEach((lv2) => {
      lv2.checked = checked;
      if (!checked) lv2.disabled = checked;
    });
  });
}
function handleSelectLevel2(checked, tag) {
  tag.checked = checked;
  tag.listLevel2.forEach((lv2) => {
    lv2.checked = checked;
    lv2.disabled = false;
  });
  const tagLevel1 = selectedData.value.find((t) => t.id == keyLevel1.value);
  tagLevel1.checked = tagLevel1.listLevel1.every((tag) => tag.checked);
}
async function handleSelectLevel3(checked, tag) {
  tag.checked = checked;
  const tagLevel1 = selectedData.value.find((t) => t.id == keyLevel1.value);
  const tagLevel2 = tagLevel1.listLevel1.find((t) => t.id == keyLevel2.value);

  if (checked) {
    const actionList = permissionWith[tag.action] || [];
    const actionTag = tagLevel2.listLevel2.filter((c) =>
      actionList.includes(c.action),
    );
    await Promise.all(
      actionTag.map(async (tag) => {
        tag.checked = checked;
        tag.disabled = checked;
      }),
    );
  } else {
    const disabledTag = tagLevel2.listLevel2.filter((t) => t.disabled);
    await Promise.all(
      disabledTag.map(async (tag) => {
        tag.checked = false;
        tag.disabled = false;
      }),
    );
  }
  tagLevel2.checked = tagLevel2.listLevel2.every((tag) => tag.checked);
}
function handleOpenMenuLevel1(tag) {
  if (tag.id == keyLevel1.value) handleClickOutside();
  else {
    if (tag.listLevel1.length) keyLevel1.value = tag.id;
    else keyLevel1.value = null;
  }
  console.log("keyLevel1 after click:", keyLevel1.value);
}
function handleOpenMenuLevel2(tag) {
  if (tag.id == keyLevel2.value) keyLevel2.value = null;
  else {
    if (tag.listLevel2.length) keyLevel2.value = tag.id;
    else keyLevel2.value = null;
  }
}
function handleClickOutside(e) {
  keyLevel1.value = null;
  keyLevel2.value = null;
}

function updatePermissions(data, permissionWith) {
  data.forEach((level0) => {
    level0.listLevel1.forEach((level1) => {
      level1.listLevel2.forEach((level2) => {
        if (level2.checked) {
          const requiredActions = permissionWith[level2.action] || [];
          level1.listLevel2.forEach((item) => {
            if (requiredActions.includes(item.action)) {
              item.checked = true;
              item.disabled = true;
            }
          });
        }
      });
    });

    level0.countSelected = level0.listLevel1.reduce((acc, curr) => {
      return acc + curr.listLevel2.length;
    }, 0);
  });
}
</script>
<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-gray-50">
    <!-- Main Content -->
    <n-form
      class="mx-10 w-full overflow-auto py-10"
      :rules="rules"
      :model="formValue"
    >
      <n-grid cols="4" :x-gap="40" class="text-[#133D85]">
        <n-gi span="1">
          <n-form-item
            label="Tên nhóm quyền"
            path="name"
            :label-style="{ fontSize: '16px' }"
          >
            <n-input
              placeholder="Tên nhóm quyền"
              v-model:value="formValue.name"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="1">
          <n-form-item
            class="mt-7"
            label="Trạng thái hoạt động"
            label-placement="left"
            path="switchValue"
            :label-style="{ fontSize: '16px' }"
          >
            <n-switch
              v-model:value="switchValue"
              :unchecked-value="1"
              :checked-value="2"
              :rail-style="railStyle"
            />
          </n-form-item>
        </n-gi>
        <n-gi span="2"></n-gi>
        <n-gi span="2">
          <n-form-item
            label="Phân quyền:"
            label-placement="left"
            :label-style="{ fontSize: '16px', transform: 'translateY(-10px)' }"
          >
            <n-space vertical>
              <n-checkbox
                label="Chọn tất cả"
                @click.stop
                :on-update:checked="handleCheckAll"
              />
              <div v-for="tag in selectedData" :key="tag">
                <n-checkbox
                  :checked="tag.checked"
                  :label="`${tag.name} (${tag.countSelected})`"
                  :on-update:checked="
                    (checked) => handleSelectLevel1(checked, tag)
                  "
                />

                <n-popover
                  :show="keyLevel1 == tag.id"
                  placement="right-start"
                  trigger="manual"
                  @click.stop
                >
                  <template #trigger>
                    <button
                      class="px-2 py-1.5"
                      @click.stop="handleOpenMenuLevel1(item)"
                    ></button>
                  </template>
                  <div>
                    <div
                      v-if="
                        selectedData?.find((t) => t.id == keyLevel1)?.listLevel1
                          ?.length
                      "
                    >
                      <div
                        v-for="item in selectedData?.find(
                          (t) => t.id == keyLevel1,
                        )?.listLevel1"
                        :key="item.id"
                        class="w-full"
                      >
                        <div
                          class="flex w-full items-center justify-between py-1.5 pl-3.5 text-left"
                          :class="
                            keyLevel1 == item.id
                              ? 'bg-#E6F7FF per-shadow'
                              : keyLevel1 && 'per-shadow-x'
                          "
                        >
                          <n-checkbox
                            :checked="item.checked"
                            :label="`${item.name} (${item.listLevel2.filter((child) => child.checked).length})`"
                            class="my-checkbox"
                            :on-update:checked="
                              (checked) => handleSelectLevel2(checked, item)
                            "
                          />
                          <n-popover
                            :show="keyLevel2 == item.id"
                            placement="right-start"
                            trigger="click"
                            class="per-popover"
                          >
                            <template #trigger>
                              <button
                                class="px-2 py-1.5"
                                @click="handleOpenMenuLevel2(item)"
                              ></button>
                            </template>
                            <div
                              v-if="keyLevel2 == item.id"
                              class="per-shadow bg-white py-2"
                            >
                              <div v-if="item.listLevel2.length">
                                <div
                                  v-for="child in item.listLevel2"
                                  :key="child.id"
                                  class="px-3.5 py-1.5"
                                >
                                  <n-checkbox
                                    :label="child.name"
                                    class="my-checkbox-child"
                                    :checked="child.checked"
                                    :disabled="child.disabled"
                                    :on-update:checked="
                                      (checked) =>
                                        handleSelectLevel3(checked, child)
                                    "
                                  />
                                </div>
                              </div>
                              <div
                                v-else
                                class="font-500 px-5 py-2 text-primary"
                              >
                                Chưa có quyền nào
                              </div>
                            </div>
                          </n-popover>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="keyLevel1"
                      class="font-500 px-5 py-2 text-primary"
                    >
                      Chưa có quyền nào
                    </div>
                  </div>
                </n-popover>
              </div>
            </n-space>
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
  </div>
</template>
