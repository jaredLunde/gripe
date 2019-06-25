import emptyObj from 'empty/object'


export default (values, options = emptyObj) => {
  const {type = 'string', required, ...schema} = options
  return {
    // jsonSchema
    type,
    enum: values,
    required,
    schema
  }
}
