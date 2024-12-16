import request from '@/utils/request'

export function getToken() {
  return request({
    url: '/qiniu/upload/token', // 假地址 自行替换
    method: 'get'
  })
}

export function getSettings() {
  return request({
    url: 'portal/user/getSettings',
    method: 'get'
  })
}
// getCurrentStatus
export function getCurrentStatus(params) {
  return request({
    url: 'eld/getCurrentStatus',
    method: 'post',
    params
  })
}
export function getLogbookList(params) {
  return request({
    url: 'eld/logbook/list',
    method: 'get',
    params
  })
}
export function changeStatus(params) {
  return request({
    url: 'eld/changeStatus',
    method: 'post',
    params
  })
}
