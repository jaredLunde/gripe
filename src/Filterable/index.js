const expression = op => (col, val) => [col, op, val]
const knexExpression = op => (col, val) => ({[op]: val !== void 0 ? [col, val] : [col]})

export const FILTERS = {
  gt: expression('>'),
  ge: expression('>='),
  lt: expression('<'),
  le: expression('<='),
  between: knexExpression('whereBetween'),
  notBetween: knexExpression('whereNotBetween'),
  eq: expression('='),
  notEq: expression('<>'),
  like: expression('LIKE'),
  notLike: expression('NOT LIKE'),
  iLike: expression('ILIKE'),
  notILike: expression('NOT ILIKE'),
  startsWith: (col, val) => FILTERS.iLike(col, `${val}%`),
  endsWith: (col, val) => FILTERS.iLike(col, `%${val}`),
  contains: (col, val) => FILTERS.iLike(col, `%${val}%`),
  similarTo: expression('SIMILAR TO'),
  notSimilarTo: expression('NOT SIMILAR TO'),
  in: expression('IN'),
  notIn: expression('NOT IN'),
  isNull: knexExpression('whereNull'),
  isNotNull: knexExpression('whereNotNull'),
  exists: knexExpression('whereExists'),
  notExists: knexExpression('whereNotExists'),
}

/**
Accounts.query.filter({username$notEq: ['foo', 'bar']})
*/
export default (Model) => {
	class FilterQueryBuilder extends Model.QueryBuilder {
    _filterable (whereFunc = 'where', filters) {
      const filterKeys = Object.keys(filters)

      for (let i = 0; i < filterKeys.length; i++) {
        const key = filterKeys[i]
        const val = filters[key]
        let expression
        const [col, op] = key.split('$')

        if (Model.columns[col] === void 0) {
          throw ({
            message: `Column '${col}' was not found in ${this._modelClass.name}`
          })
        }

        if (op === void 0) {
          expression = [col, val]
        }
        else {
          if (FILTERS[op] === void 0) {
            throw ({
              message: `'${op}' is not a valid column filter`
            })
          }

          expression = FILTERS[op](col, val)
        }

        if (Array.isArray(expression)) {
          this[whereFunc](...expression)
        }
        else {
          whereFunc = Object.keys(expression)[0]
          this[whereFunc](...expression[whereFunc])
        }
      }

      return this
    }

		filter (filters) {
      return this._filterable('where', filters)
		}

    andFilter (filters) {
      return this._filterable('andWhere', filters)
		}

    orFilter (filters) {
      return this._filterable('orWhere', filters)
		}
	}

	return class extends Model {
		static QueryBuilder = FilterQueryBuilder
	}
}
