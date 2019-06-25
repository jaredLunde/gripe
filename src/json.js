import emptyObj from 'empty/object'


export default (properties = emptyObj, options = emptyObj) => {
  const {required, requiredProperties, ...schema} = emptyObj
  return {
    // jsonSchema
    type: 'object',
    required,
    schema: {
      required: requiredProperties,
      properties,
      ...schema
    }
  }
}
