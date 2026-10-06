const read = (store, key) => {
  try {
    const raw = store.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

const write = (store, key, value) => {
  try {
    store.setItem(key, JSON.stringify(value))
  } catch (error) {
    return
  }
}

export const readLocal = (key) => read(window.localStorage, key)
export const writeLocal = (key, value) => write(window.localStorage, key, value)
export const readSession = (key) => read(window.sessionStorage, key)
export const writeSession = (key, value) => write(window.sessionStorage, key, value)
