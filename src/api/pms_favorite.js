import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Favorite/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Favorite/addFavorite', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Favorite/updateFavorite', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Favorite/deleteFavorite/' + id, method: 'DELETE' })
}

