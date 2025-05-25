export const useBreadCrumb = () => useState(() => []);
export const usePermissions = () =>
  useState(() => ({
    canSuperMenuExam : false,
    canSuperMenuSuperAdmin : false,
    canSuperMenuMschool : false,
    canSuperMenuQltv : false,
    canSuperMenuCambridge : false,
    canSuperMenuBankExam : false,

    canSuperAdmin : false,
    canSuperAdminEdit : false,
    canSuperAdminDelete : false,
    canSuperAdminAdd : false,

    canSuperAdminPermission : false,
    canSuperAdminPermissionEdit : false,
    canSuperAdminPermissionDelete : false,
    canSuperAdminPermissionAdd : false,

    canSuperAdminGroups : false,
    canSuperAdminGroupsEdit : false,
    canSuperAdminGroupsDelete : false,
    canSuperAdminGroupsAdd : false,

    canSuperAdminMschoolManagementSite : false,
    canSuperAdminMschoolManagementSiteAdd : false,
    canSuperAdminMschoolManagementSiteEdit : false,
    canSuperAdminMschoolManagementSiteDelete : false,

    canSuperAdminMschoolManagementSettingPackage : false,
    canSuperAdminMschoolManagementSettingPackageAdd : false,
    canSuperAdminMschoolManagementSettingPackageEdit : false,
    canSuperAdminMschoolManagementSettingPackageDelete : false,

    canSuperAdminMschoolDashboard : false,
    canSuperAdminMschoolCustomerSupport : false,
    canSuperAdminMschoolStatisticalLiveClass : false,
    canSuperAdminMschoolStatisticalTestRoom : false,
    canSuperAdminMschoolStatisticalSchool : false,

    canSuperAdminMschoolManagementTkbCustomer : false,

    canSuperAdminQltvManagementSite : false,
    canSuperAdminQltvManagementSiteAdd : false,
    canSuperAdminQltvManagementSiteEdit : false,
    canSuperAdminQltvManagementSiteDelete : false,

    // EXAM

    canSuperAdminEXamDashboard : false,
    canSuperAdminExamStatisticalExam : false,
    canSuperAdminExamStatisticalRoom : false,
    canSuperAdminExamStatisticalUser : false,

    canSuperAdminExamManagementUser : false,
    canSuperAdminExamManagementUserAdd : false,
    canSuperAdminExamManagementUserEdit : false,
    canSuperAdminExamManagementUserDelete : false,


    // Cambridge
    canSuperAdminCambridgeDashboard : false,
    canSuperAdminCambridgeEndUser : false,
    canSuperAdminCambridgeSettingTime : false,
    canSuperAdminCambridgeSettingTimeAdd : false,
    canSuperAdminCambridgeSettingTimeEdit : false,
    canSuperAdminCambridgeSettingTimeDelete : false,

    // BankExam
    canSuperAdminBankExamDashboard : false,
    canSuperAdminBankExamStatisticalSystem : false,
    canSuperAdminBankExamStatisticalUnit : false,
    canSuperAdminBankExamManagementUserAll : false,
    canSuperAdminBankExamManagementUserAllAdd : false,
    canSuperAdminBankExamManagementUserAllEdit : false,
    canSuperAdminBankExamManagementUserAllDelete : false,
    canSuperAdminBankExamManagementUserOnline : false,

    canSuperAdminBankExamManagementUnitList : false,
    canSuperAdminBankExamManagementUnitListAdd : false,
    canSuperAdminBankExamManagementUnitListEdit : false,
    canSuperAdminBankExamManagementUnitListDelete : false,
    canSuperAdminBankExamManagementUnitType : false,
    canSuperAdminBankExamManagementUnitTypeAdd : false,
    canSuperAdminBankExamManagementUnitTypeEdit : false,
    canSuperAdminBankExamManagementUnitTypeDelete : false,
    canSuperAdminBankExamManagementSubjectList : false,
    canSuperAdminBankExamManagementSubjectListAdd : false,
    canSuperAdminBankExamManagementSubjectListEdit : false,
    canSuperAdminBankExamManagementSubjectListDelete : false,
    canSuperAdminBankExamManagementSubjectGroup : false,
    canSuperAdminBankExamManagementSubjectGroupAdd : false,
    canSuperAdminBankExamManagementSubjectGroupEdit : false,
    canSuperAdminBankExamManagementSubjectGroupDelete : false,
    canSuperAdminBankExamManagementSettingInfo : false,
    canSuperAdminBankExamManagementSettingInfoAdd : false,
    canSuperAdminBankExamManagementSettingInfoEdit : false,
    canSuperAdminBankExamManagementSettingInfoDelete : false,
    canSuperAdminBankExamManagementSettingTutorial : false,
    canSuperAdminBankExamManagementSettingTutorialAdd : false,
    canSuperAdminBankExamManagementSettingTutorialEdit : false,
    canSuperAdminBankExamManagementSettingTutorialDelete : false,

  }));