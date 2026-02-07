db.employees.insertMany([
  {
    emp_id: 102,
    name: "Jane Smith",
    email: "Jane.smith@example.com",
    position: "Project Manager",
    department: "IT",
    salary: 90000,  
    location: "San Francisco",
    date: Date()
  },
    {
    emp_id: 103,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    position: "Data Analyst",
    department: "IT",
    salary: 80000,
    location: "Chicago",
    },
    {
    emp_id: 104,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    position: "HR Manager",
    department: "HR",
    salary: 85000,
    location: "New York",
    date: Date()
  },
    {
    emp_id: 105,
    name: "David Wilson",
    email: "david.wilson@example.com",  
    position: "Marketing Specialist",
    department: "Marketing",
    salary: 70000,
    location: "Los Angeles",
    date: Date()
  }
]);