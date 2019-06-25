import aes256 from 'aes256'
import emptyObj from 'empty/object'


const encryptedRe = /^\$aes256\$[a-zA-Z0-9\/\+]+$/

export const isEncrypted = (value) => {
  return value.match(encryptedRe)
}

export const encrypt = (value, secret) => {
  if (isEncrypted(value)) {
    return value
  }

  return `$aes256$${aes256.encrypt(secret, value)}`
}

export const decrypt = (value, secret) => {
  if (!value) {
    return
  }

  let [_, id, encryptedValue] = value.split('$')
  if (id !== 'aes256') {
    return
  }

  return aes256.decrypt(secret, encryptedValue)
}

export default (options = emptyObj) => {
  const {required, getSecret, ...schema} = options

  if (getSecret === void 0)
    throw ({message: `No getSecret() callback was provided to 'encrypt' column`})

  return {
    beforeDelete (model, name) {
      const value = model[name]
      if (value === void 0) {
        return
      }

      model[name] = encrypt(value, getSecret())
    },
    beforeInsert (model, name) {
      const value = model[name]
      model[name] = encrypt(value, getSecret())
    },
    beforeUpdate (model, name, modelOptions) {
      const value = model[name]
      if (modelOptions.patch && value === void 0) {
        return
      }

      model[name] = encrypt(value, getSecret())
    },
    encrypt,
    decrypt,
    isEncrypted,
    type: 'string',
    required,
    schema
  }
}
