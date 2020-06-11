exports.findRoleByName = function (roles, roleName) {
  return roles.find((r) => r.name === roleName)
}
