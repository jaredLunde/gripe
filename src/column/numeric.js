import emptyObj from 'empty/object'


// floats/decimals
export default (options = emptyObj) => {
  const {required, ...schema} = options
  return {
    // jsonSchema
    type: 'number',
    required,
    schema
  }
}
