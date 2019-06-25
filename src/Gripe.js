import Filterable from './Filterable'
import Sortable from './Sortable'
import Upsertable from './Upsertable'


const hooks = [
  '$beforeValidate',
  '$afterValidate',
  '$beforeInsert',
  '$afterInsert',
  '$beforeUpdate',
  '$afterUpdate',
  '$beforeDelete',
  '$afterDelete',
  '$afterGet',
]

function generateJSONSchema (columns) {
  const required = []
  const properties = {}

  Object.entries(columns).forEach(
    ([columnName, column]) => {
      if (column.required === true) {
        required.push(columnName)
      }

      properties[columnName] = {type: column.type, ...column.schema}
    }
  )

  return {type: 'object', required, properties}
}

export default function Columns (Model, columns, propName = 'columns') {
  class ModelWithColumns extends Model {
    static jsonSchema = generateJSONSchema(columns)
  }

  ModelWithColumns[propName] = columns

  for (let hook of hooks) {
    ModelWithColumns.prototype[hook] = async function (...context) {
      typeof Model[hook] === 'function' && (await Model[hook](...context))
      hook = hook.slice(1)
      await Promise.all(
        Object.entries(this.constructor[propName]).map(
          ([columnName, column]) =>
            typeof column[hook] === 'function'
              && column[hook](this, columnName, ...context)
        ).filter(
          column => column !== false
        )
      )
    }
  }

  return Upsertable(Sortable(Filterable(ModelWithColumns)))
}
