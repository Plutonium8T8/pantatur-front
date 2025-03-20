export const pick = (obj, fields) => {
  return fields.reduce((result, field) => {
    if (field in obj) {
      result[field] = obj[field]
    }
    return result
  }, {})
}
