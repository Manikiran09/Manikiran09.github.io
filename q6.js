db.employees.find(
  { salary: { $lt: 80000 }, department: "IT" },
  { _id: 0, name: 1, email: 1 },
);

db.employees.find(
  { department: {$ne:"HR"} },
  { _id: 0, name: 1, position: 1, salary: 1 },
);