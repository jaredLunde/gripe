import {pascalCase} from 'change-case'


/**
Accounts.query.sort({by: 'new', next: 20, after: 300})
*/
export default (Model) => {
	class SortQueryBuilder extends Model.QueryBuilder {
    sort ({by, next, after}, props) {
      if (typeof by === 'string') {
        try {
          this._modelClass[`by${pascalCase(by)}`](this, props)
        }
        catch (err) {
          throw ({message: `Cannot sort '${this._modelClass.tableName}' by ${by}`})
        }
      }

      if (after) {
        this.offset(after)
      }

      if (next) {
        this.limit(next)
      }

      return this
    }
	}

	return class extends Model {
		static QueryBuilder = SortQueryBuilder
	}
}
