const keystone = require('keystone')
const { Types } = keystone.Field

/**
 * Model Config
 */
const Example = new keystone.List('Example', {
  label: 'Example',
  sortable: true,
  defaultSort: 'unit',
  track: true,
  autokey: {
    path: 'key',
    from: 'name',
    unique: true
  }
})

/**
 * Model Schema
 */
Example.add({
  title: {
    type: String,
    required: true,
    initial: true
  },
  text: {
    type: String,
    required: true,
    initial: true
  },
  owner: {
    type: Types.Relationship,
    ref: 'User'
  }
})

/**
 * Hooks
 */
Example.schema.pre('save', function (next) {
  // Save state for post hook
  this.wasNew = this.isNew
  this.wasModified = this.isModified()

  next()
})

Example.schema.post('save', function (next) {
  // Post hooks
})

/**
 * Model Registration
 */
Example.defaultColumns = 'title, text'
Example.register()

module.exports = Example
