import emptyObj from 'empty/object'


export default (options = emptyObj) => {
  const {required, ...schema} = options
  return {
    // jsonSchema
    type: 'string',
    required,
    schema
  }
}
