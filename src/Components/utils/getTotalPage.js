import { MAX_PAGE_SIZE } from "../../app-constants"

export const getTotalPages = (items) => {
  return Math.ceil(items / MAX_PAGE_SIZE)
}
