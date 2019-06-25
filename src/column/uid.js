import HashIDs from 'hashids'
import emptyObj from 'empty/object'


export const keyspace = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
const keyspaceRe = new RegExp(`^[${keyspace}]+$`)
export const hashids = new HashIDs('', 0, keyspace)

export const encode = (uid) => {
  if (isNaN(uid) === false)
    return hashids.encode(uid)

  return uid
}

export const decode = (uid) => {
  if (uid === void 0 || uid === null)
    return uid

  if (uid.match(keyspaceRe))
    return hashids.decode(uid).join('')

  return uid
}

export default (options = emptyObj) => {
  const {required, ...schema} = options
  return {
    beforeDelete (model, name) {
      const value = model[name]
      if (value === void 0)
        return

      model[name] = decode(value)
    },
    beforeInsert (model, name) {
      const value = model[name]
      model[name] = decode(value)
    },
    beforeUpdate (model, name, modelOptions) {
      const value = model[name]
      if (modelOptions.patch && value === void 0)
        return

      model[name] = decode(value)
    },
    encode,
    decode,
    type: 'string',
    required,
    schema
  }
}
