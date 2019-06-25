import aes256 from 'aes256'
import emptyObj from 'empty/object'


const encryptedRe = /^aes256\$[a-zA-Z0-9\/\+]+$/

export const isEncrypted = (value) => value.match(encryptedRe) !== null

export const encrypt = (value, secret) => {
  if (isEncrypted(value)) return value
  return `aes256$${aes256.encrypt(secret, value)}`
}

export const decrypt = (value, secret) => {
  if (!value) return
  let [id, encryptedValue] = value.split('$')
  return id !== 'aes256' ? void 0 : aes256.decrypt(secret, encryptedValue)
}

export default (options = emptyObj) => {
  const {required, getSecret, ...schema} = options

  if (getSecret === void 0)
    throw ({message: `No getSecret(model) callback was provided to 'encrypt' column`})

  return {
    beforeDelete (model, name) {
      const value = model[name]
      if (value === void 0) {
        return
      }

      model[name] = encrypt(value, getSecret(model))
    },
    beforeInsert (model, name) {
      const value = model[name]
      model[name] = encrypt(value, getSecret(model))
    },
    beforeUpdate (model, name, modelOptions) {
      const value = model[name]
      if (modelOptions.patch && value === void 0) return
      model[name] = encrypt(value, getSecret(model))
    },
    encrypt: value => encrypt(value, getSecret({})),
    decrypt: value => decrypt(value, getSecret({})),
    isEncrypted,
    type: 'string',
    required,
    schema
  }
}
