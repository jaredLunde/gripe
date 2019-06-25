import emptyObj from 'empty/object'


export default (column, options = emptyObj) => {
  const {required, ...schema} = options
  return {
    // jsonSchema
    type: 'array',
    required,
    schema: {
      items: {type: column.type, ...column.schema},
      ...schema
    }
  }
}
