export const select = (selector, scope = document) => scope.querySelector(selector)

export const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)]

export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])

export const padNumber = (value, size = 2) => String(value).padStart(size, '0')
