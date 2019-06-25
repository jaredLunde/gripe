import {promisify} from 'util'
import * as crypto  from 'crypto'
import emptyObj from 'empty/object'
import safeCompare from 'safe-compare'
import randomString from 'crypto-random-string'
import {validateInvariant} from './utils'


const
  scrypt = promisify(crypto.scrypt),
  scryptRe = /^scrypt\$N=[0-9]+,r=[0-9]+,p=[0-9]+\$[a-zA-Z0-9\/\+]+\$[a-zA-Z0-9\/\+]+$/,
  defaultOptions = {
    N: 1 << 15,
    r: 8,
    p: 2,
    maxmem: 64 * 1024 * 1024
  }

export const getSalt = () => randomString({length: 24})

export const isScryptHash = string =>
  string === void 0 || string === null ? false : string.match(scryptRe) !== null

export const hash = (string, salt, options) => {
  if (isScryptHash(string) === true)
    return string

  options = Object.assign({}, defaultOptions, options)
  return scrypt(string, salt, 32, options).then(
    key =>
      `scrypt`
      + `$N=${options.N},r=${options.r},p=${options.p},maxmem=${options.maxmem}`
      + `$${salt}`
      + `$${key.toString('hex')}`
  )
}

const parseOptions = options => {
  if (!options) return {}
  options = options.split(',')
  const out = {}
  for (let option of options) {
    const [key, value] = option.split('=')
    out[key] = parseInt(value)
  }
  return out
}

export const verify = async (original, against) => {
  let
    [algorithm, options, salt, key] = original.split('$'),
    derivedAgainst = await hash(against, salt, parseOptions(options)),
    [_a, _o, _s, againstKey] = derivedAgainst.split('$')

  return safeCompare(key, againstKey)
}

const validate = (column, value, options = emptyObj) => {
  const {minLength, maxLength, pattern} = options

  if (!value) {
    return true
  }

  if (minLength) {
    validateInvariant(
      column,
      value.length >= minLength,
      `Field '${column}' did not meet the minimum length requirement of '${minLength}'`
    )
  }

  if (maxLength) {
    validateInvariant(
      column,
      value.length <= maxLength,
      `Field '${column}' exceeded the maximum length requirement of '${maxLength}'`
    )
  }

  if (pattern) {
    validateInvariant(
      column,
      pattern.test(value),
      `Field '${column}' included disallowed characters`
    )
  }

  return true
}

const defaultMatch = /.*/

export default ({
  // hash options
  hashOptions,
  // validation
  minLength = 8,
  maxLength = Infinity,
  pattern = defaultMatch,
  // schema
  required,
  ...schema
}) => {
  const validationOptions = {minLength, maxLength, pattern}

  return {
    // hooks
    async beforeInsert (model, name) {
      // the issue si that this column isn't attached to the model's prototype
      const value = model[name]
      validate(name, value, validationOptions)
      model[name] = await hash(value, getSalt(), hashOptions)
    },
    async beforeUpdate (model, name, modelOptions) {
      const value = model[name]
      if (modelOptions.patch && value === void 0) {
        return
      }

      validate(name, value, validationOptions)
      model[name] = await hash(value, getSalt(), hashOptions)
    },
    // helpers
    hash,
    validate,
    verify,
    isScryptHash,
    // jsonSchema
    type: 'string',
    required,
    schema
  }
}
