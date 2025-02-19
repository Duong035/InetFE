
const API_ENDPOINTS = {
  cms: {
    login: "/api/auth/login",
    admin_login: "/api/auth/login",
    forgot_password: "/api/auth/forgot",
    register: "/api/auth/register",
    verify_token: "/api/auth/verify_token",
    verify_email: "/api/auth/verify_email",
    resend_otp: "/api/auth/send-otp",
    unit_information: "/api/admin/center",
    reset_pass: "/api/auth/forgot",
    students: "/api/admin/students",
    study_need: "/api/admin/study-needs",
    list_study_need: "/api/admin/list-study-needs",
    provinces: "/api/admin/provinces",
    districts: "/api/admin/districts",
    branches: "/api/admin/branches",
  },
}

class Request {
  constructor() {
    const route = useRoute()
    this.baseURL = "http://localhost:4000"
    const getToken = () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("auth_token") || "";
      }
      return "";
    };
    
    this.accessToken = `Bearer ${getToken()}`;
    this.headers = {}
    this.handleFetch = {
      onRequest() {},
      onRequestError({ _, __, error }) {
        console.error("Request error: ", error.message)
      },
      onResponse() {},
      onResponseError({ _, response }) {
        if (response._data?.error === 6039) {
          const numberOfLectures = Number(response._data?.message)

          if (isNaN(numberOfLectures)) return window["$message"].error("Unknown error")

          if (numberOfLectures > 0) return window["$message"].error(t(response._data?.error, { numberOfLectures: response._data?.message }))

          if (numberOfLectures < 0) return window["$message"].error(t("lectures.exceeded", { numberOfLectures: response._data?.message * -1 }))
        }
        if (route.path.includes("profile")) return
        if (response._data?.error === 2008) return
        else window["$message"].error(ERROR_CODES[response._data?.error] || response._data?.message)

        console.error("Response error: ", response._data?.message)

        if (response.status == 401 || response._data?.error === 6101) return navigateTo(window["$loginUrl"], { external: true })
      },
    }
  }

  fetch(url, method, options) {
    const headers = {
      "Content-type": "application/json",
      Authorization: this.accessToken,
    };
  
    return useFetch(url, {
      baseURL: this.baseURL,
      method,
      headers,
      ...options,
      // onResponse({ response }) {
      //   if (!response.ok) {
      //     message.error(`Error: ${response.statusText}`);
      //   }
      // },
    });
  }

  get(url, options) {
    return this.fetch(url, "GET", options)
  }
  post(url, options) {
    return this.fetch(url, "POST", options)
  }
  put(url, options) {
    return this.fetch(url, "PUT", options)
  }
  patch(url, options) {
    return this.fetch(url, "PATCH", options)
  }
  delete(url, options) {
    return this.fetch(url, "DELETE", options)
  }


}

class CMSManager {
  constructor(request) {
    this.request = request
  }
  // Auth_____________________________________________________________________________________
  async login(data) {
    return this.request.post(API_ENDPOINTS.cms.login, data)
  }

  async adminLogin(data) {
    return this.request.post(API_ENDPOINTS.cms.admin_login, data)
  }

  async forgotPassword(data) {
    return this.request.post(API_ENDPOINTS.cms.forgot_password, data)
  }
  async register(data) {
    return this.request.post(API_ENDPOINTS.cms.register, data)
  }

  async verifyToken(data) {
    return this.request.post(API_ENDPOINTS.cms.verify_token, data)
  }

  async verifyEmail(data) {
    return this.request.post(API_ENDPOINTS.cms.verify_email, data)
  }

  async resendOtp(data) {
    return this.request.post(API_ENDPOINTS.cms.resend_otp, data)
  }
  //__________________________________________________________________________________________

  //Unit______________________________________________________________________________________
  async getUnitInformation(data) {
    return this.request.get(API_ENDPOINTS.cms.unit_information, data)
    
  }
  async updateUnitInformation(data) {
    return this.request.put(API_ENDPOINTS.cms.unit_information, data)
  }
  //__________________________________________________________________________________________
  
  //Students__________________________________________________________________________________
  async getStudents(data) {
    return this.request.get(API_ENDPOINTS.cms.students, data)
  }
  async createStudent(data) {
    return this.request.post(API_ENDPOINTS.cms.students, data)
  }
  async getStudentDetail(data) {
    return this.request.get(`${API_ENDPOINTS.cms.students}/${data.id}`, data)
  }
  async updateStudent(data) {
    return this.request.put(`${API_ENDPOINTS.cms.students}/${data.id}`, data)
  }
  async deleteStudents(data) {
    return this.request.delete(API_ENDPOINTS.cms.students, data)
  }
  //__________________________________________________________________________________________

  //Study neesd_______________________________________________________________________________
  async createStudyNeed(data) {
    return this.request.post(API_ENDPOINTS.cms.study_need, data)
  }
  async getStudyNeedDetail(data) {
    return this.request.get(`${API_ENDPOINTS.cms.study_need}/${data.id}`, data)
  }
  async updateStudyNeed(data) {
    return this.request.put(`${API_ENDPOINTS.cms.study_need}/${data.id}`, data)
  }
  async listStudyNeed(data) {
    return this.request.get(API_ENDPOINTS.cms.list_study_need, data)
  }
  async deleteStudyNeed(data) {
    return this.request.delete(`${API_ENDPOINTS.cms.study_need}/${data.id}`, data)
  }
  //__________________________________________________________________________________________


  // Branches_________________________________________________________________________________
  async getBranches(data) {
    return this.request.get(API_ENDPOINTS.cms.branches, data)
  }
  //__________________________________________________________________________________________

  //administrative - Đơn vị hành chính________________________________________________________
  async getProvinces(data) {
    return this.request.get(API_ENDPOINTS.cms.provinces, data)
  }
  async getDistricts(data) {
    return this.request.get(API_ENDPOINTS.cms.districts, data)
  }
  //__________________________________________________________________________________________

}

class RestAPI {
  constructor() {
    this.request = new Request()
    this.cms = new CMSManager(this.request)
  }
}

export default () => ({ restAPI: new RestAPI() })
