import {ValidationError} from 'objection'


export const validateInvariant = (column, truthyFalsey, message) => {
  if (truthyFalsey === true) {
    return
  }

  throw new ValidationError({column, message})
}
