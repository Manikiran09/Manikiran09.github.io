
use("kitsw");

//db.employees.find({$and: [{salary: {$gt:70000}}, {department:"HR"}]})
//db.employees.find({department: {$not: {$eq: "HR"}}})
db.employees.find({$nor: [{salary: {$gt:70000}}, {department:"HR"}]})