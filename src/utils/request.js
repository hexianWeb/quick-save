import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
/* import { getToken } from '@/utils/auth' */
// process.env.VUE_APP_BASE_API
// create an axios instance

const service = axios.create({
  // baseURL: trackrp,
  baseURL: process.env.VUE_APP_BASE_API + 'server', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000,
  headers: {
    // 设置默认请求头
    'Content-Type': 'application/json'
  }
})
service.interceptors.request.use(
  config => {
    // 设置请求头
    const jsonStr = localStorage.getItem('token')
    const json = JSON.parse(jsonStr)
    const token = json.token
    config.headers['Authorization'] = token
    if (store.getters.token) {
      // ['X-Token'] is a custom headers key
      // config.headers['X-Token'] = getToken();
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 返回响应=>响应 定义代码确定请求状态
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res === '') {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
