import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: 'release/lists',
    method: 'post',
    params: data
  })
}
/*
export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}
 */
export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}
export function fetchDel(id) {
  return request({
    url: '/release/delete',
    method: 'post',
    params: { id }
  })
}
export function createArticle(data) {
  return request({
    url: '/release/add',
    method: 'post',
    params: data
  })
}
export function updateArticle(data) {
  return request({
    url: '/release/add',
    method: 'post',
    params: data
  })
}
