<template>
  <MenuLayout :menus="menus" v-model:collapsed="collapsed" />
</template>

<script setup>
import AdmissionIcon from "@/assets/icons/menu/admissions.svg";
import DashboardIcon from "@/assets/icons/menu/dashboard.svg";
import FinanceIcon from "@/assets/icons/menu/finance.svg";
import QuestionMarkIcon from "@/assets/icons/menu/question-mark.svg";
import SettingIcon from "@/assets/icons/menu/setting.svg";
import StaffIcon from "@/assets/icons/menu/staff.svg";
import StatisticIcon from "@/assets/icons/menu/statistic.svg";
import TrainingIcon from "@/assets/icons/menu/training.svg";

import { renderIcon, renderIconChild, renderIconNoColor } from "./Render.js";

const userStore = useUserStore();

const { t } = useI18n();

const collapsed = defineModel("collapsed");

const permissionMapping = {
  "training/setting": [
    "training/setting/subject",
    "training/setting/classroom",
    "training/setting/program",
    "training/setting/category",
    "training/setting/certificate",
    "training/setting/other",
  ],
  "staff/setting": [
    "staff/setting/shift",
    "staff/setting/day-off",
    "staff/setting/formula",
  ],
  "staff/list": ["staff/list/permissions", "staff/setting/permissions"],
};

// return true
const checkPermissionMenu = (key) => {
  if (userStore.accessAll) return true;
  const path = key?.split("/");
  return userStore.permissions?.some((per) => {
    if (per?.key === key || per?.key === path[0]) {
      if (per?.checked) return true;

      return per?.listLevel1?.some((subP) => {
        const subKeys = permissionMapping[key];
        if (subKeys && subKeys.includes(subP?.key)) {
          if (subP?.checked) return true;
          return subP?.listLevel2?.some((pms) => pms?.checked);
        }
        if (per?.key === key || subP?.key === key) {
          if (subP?.checked) return true;
          return subP?.listLevel2?.some((pms) => pms?.checked);
        }
      });
    }
  });
};

const menus = ref([
  {
    label: t("dashboard"),
    key: `dashboard`,
    icon: renderIcon(DashboardIcon),
    link_breadcrumb: false,
  },
  {
    label: t("admissions"),
    key: `admissions`,
    show: checkPermissionMenu("admissions"),
    icon: renderIcon(AdmissionIcon),
    link_breadcrumb: false,
    children: [
      {
        label: t("admissions.plan"),
        // key: `admissions/plan`,
        show: checkPermissionMenu("admissions/plan"),
        icon: renderIconChild("/admissions/plan"),
      },
      {
        label: t("admissions.potential-student"),
        // key: `admissions/potential-student`,
        show: checkPermissionMenu("admissions/potential-student"),
        icon: renderIconChild("/admissions/potential-student"),
      },
      {
        label: t("admissions.trial-student"),
        // key: `admissions/trial-student`,
        show: checkPermissionMenu("admissions/trial-student"),
        icon: renderIconChild("/admissions/trial-student"),
      },
      {
        label: t("admissions.setting"),
        // key: `admissions/setting`,
        show: checkPermissionMenu("admissions/setting"),
        icon: renderIconChild("/admissions/setting"),
      },
    ],
  },
  {
    label: t("training"),
    key: `training`,
    show: checkPermissionMenu("training"),
    icon: renderIcon(TrainingIcon),
    link_breadcrumb: false,
    children: [
      {
        label: t("training.official_student"),
        key: `training/official_student`,
        show: checkPermissionMenu("training/official_student"),
        icon: renderIconChild("/training/official_student"),
      },
      {
        label: t("training.class"),
        key: `daotao/lophoc`,
        show: checkPermissionMenu("training/class"),
        icon: renderIconChild("/training/class"),
      },
      {
        label: t("training.schedule"),
        key: `daotao/lichhoc`,
        show: checkPermissionMenu("training/schedule"),
        icon: renderIconChild("/training/schedule"),
      },
      {
        label: t("common.subject"),
        key: `daotao/monhoc`,
        show: checkPermissionMenu("training/document"),
        icon: renderIconChild("/training/document"),
        // disabled: true,
      },
    ],
  },
  {
    label: t("staff"),
    key: `staff`,
    show: checkPermissionMenu("staff"),
    icon: renderIcon(StaffIcon),
    link_breadcrumb: false,
    children: [
      {
        label: t("staff.list"),
        key: `daotao/giangvien`,
        show: checkPermissionMenu("staff/list"),
        icon: renderIconChild("/staff/list"),
      },
      {
        label: t("staff.timesheet"),
        key: `staff/timesheet`,
        show: checkPermissionMenu("staff/timesheet"),
        icon: renderIconChild("/staff/timesheet"),
        // disabled: true,
      },
      {
        label: t("staff.setting"),
        key: `staff/setting`,
        show: checkPermissionMenu("staff/setting"),
        icon: renderIconChild("/staff/setting"),
      },
    ],
  },
  {
    label: t("setting"),
    key: `setting`,
    icon: renderIcon(SettingIcon),
    show: checkPermissionMenu("setting"),
    link_breadcrumb: false,
    children: [
      {
        label: t("setting.unit-information"),
        key: `setting/unit-information`,
        show: checkPermissionMenu("setting/unit-information"),
        icon: renderIconChild("/setting/unit-information"),
      },
      {
        label: t("setting.organization-structure"),
        key: `setting/organization-structure`,
        show: checkPermissionMenu("setting/organization-structure"),
        icon: renderIconChild("/setting/organization-structure"),
      },
      {
        label: t("setting.branch-list"),
        key: `setting/branch-list`,
        show: checkPermissionMenu("setting/branch-list"),
        icon: renderIconChild("/setting/branch-list"),
      },
      {
        label: t("setting.news-category"),
        key: `setting/news-category`,
        show: checkPermissionMenu("setting/news-category"),
        icon: renderIconChild("/setting/news-category"),
      },
      {
        label: t("setting.news-list"),
        key: `setting/news-list`,
        show: checkPermissionMenu("setting/news-list"),
        icon: renderIconChild("/setting/news-list"),
        // disabled: true,
      },
    ],
  },
  {
    label: t("help-center"),
    key: `help-center`,
    show: checkPermissionMenu("help-center"),
    icon: renderIconNoColor(QuestionMarkIcon),
    link_breadcrumb: false,
  },
]);
</script>
