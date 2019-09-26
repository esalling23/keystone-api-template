const keystone = require('keystone')
const { Types } = keystone.Field

/**
 * Model Config
 */
const User = new keystone.List('User', {
  label: 'User',
  sortable: true
})

/**
 * Model Schema
 */
User.add({
  isAdmin: {
    type: Types.Boolean,
    default: false
  },
  name: {
    first: {
      type: String,
      required: true,
      initial: true,
      dependsOn: {
        admin: false
      }
    },
    last: {
      type: String,
      required: true,
      initial: true,
      dependsOn: {
        admin: false
      }
    }
  },
  email: {
    type: Types.Email,
    required: true,
    initial: true,
    unique: true
  },
  password: {
    type: Types.Password
  },
  token: String,
  cohort: {
    type: String,
    dependsOn: {
      admin: false
    }
  }
  // access: {
  //   type: Types.Number,
  //   required: true,
  //   initial: true,
  //   dependsOn: {
  //     admin: false
  //   }
  // }
})

// Keystone Admin Virtual
User.schema.virtual('canAccessKeystone').get(function () {
  if (this.isAdmin) return true
})

/**
 * Hooks
 */
User.schema.pre('save', function (next) {
  // Save state for post hook
  this.wasNew = this.isNew
  this.wasModified = this.isModified()

  next()
})

User.schema.post('save', function (next) {
  // Post hooks
})

/**
 * Model Registration
 */
User.defaultColumns = 'email'
User.register()

module.exports = User
