import { defineStore } from "pinia"

export const useUserStore = defineStore("userStore", {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}"),
    permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
    accessAll: JSON.parse(localStorage.getItem("accessAll") || "false"),
    import_file: {}, // not persisted
    import_pdf: {},  // not persisted
    import_docx: {}, // not persisted
  }),

  actions: {
    setUserInfo(value) {
      this.userInfo = value
      localStorage.setItem("userInfo", JSON.stringify(value))
    },
    setPermissions(access, permissions) {
      this.accessAll = access || false
      this.permissions = permissions
      localStorage.setItem("accessAll", JSON.stringify(this.accessAll))
      localStorage.setItem("permissions", JSON.stringify(this.permissions))
    },
    setPDFTemp(value) {
      this.import_pdf = value // not stored in localStorage
    },
    setDocxTemp(value) {
      this.import_docx = value // not stored in localStorage
    },
    login(userInfo) {
      this.userInfo = userInfo || {}
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
    },
    logOut() {
      this.userInfo = {}
      this.permissions = []
      this.accessAll = false
      this.import_file = {}
      this.import_pdf = {}
      this.import_docx = {}
      localStorage.removeItem("userInfo")
      localStorage.removeItem("permissions")
      localStorage.removeItem("accessAll")
    },
    checkAuth() {
      if (useExpToken(this.userInfo.token)) return true
      return false
    },
  },
})
