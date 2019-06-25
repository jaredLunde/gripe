import {raw} from 'objection'


/**
 await MyModel.upsert({
  insert: {foo: 'bar'},
  conflicts: 'baz'
 })
 */
export default (Model) => {
	class UpsertQueryBuilder extends Model.QueryBuilder {
    upsert (data, conflicts, set) {
      conflicts = !conflicts ? Object.keys(data) : conflicts
      conflicts = Array.isArray(conflicts) ? conflicts : [conflicts]
      const insertQuery = this.insert(data)
      const doSet =
        Object
          .entries(set || data)
          .filter(([k]) => !!set || conflicts.includes(k) === false)
          .map(kv => raw(`?? = ?`, kv))

      const upsertQuery = this.modelClass().raw(
        `
          ${insertQuery.toSql().replace(/returning ".+?"/, '')}
          ON CONFLICT (${conflicts.map(_ => '??').join(',')}) 
          DO UPDATE SET ${doSet.map(_ => ' ?? ').join()}
        `,
        [...conflicts, ...doSet]
      )

      return upsertQuery
    }
	}

	return class extends Model {
		static QueryBuilder = UpsertQueryBuilder
	}
}
