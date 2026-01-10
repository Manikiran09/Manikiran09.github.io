const users=[];
function addUser()
{
  let name=document.getElementById("name").value;
  let email=document.getElementById("regEmail").value;
  let password=document.getElementById("regPass").value;     
let user={
  name:name,
  email:email,
  password:password
};
users.push(user);
showLoginForm();
console.log(users);
}
function my()
{
let email=document.getElementById("log").value;
let password=document.getElementById("pass").value;
let found=users.find((element) => element.email===email && element.password===password);
if(found){
  document.getElementById("LBMSG").innerHTML="Welcome " + found.name;
  return;
}
else
{
  document.getElementById("LBMSG").innerHTML="Invalid email or password";
}
}

function showLoginForm() {
  let str=`<h3>Log in form</h3>
    <p><label id="LBMSG"></label></p>
    <p> <input type="email" id="log" placeholder="Email"></p>
    <p> <input type="password" id="pass" placeholder="Password"></p>
    <p><button class="login-btn" onclick="my()">Log in</button></p> 
    <hr>
    <p><button class="login-btn" onclick="showRegisterForm()">Create Account</button></p>   
    ` 
    root.innerHTML=str;
}

function showRegisterForm() {
  let str=`<h3>Register form</h3>
    <p><label id="LBMSG"></label></p>
    <p> <input type="text" id="name" placeholder="Name"></p>
    <p> <input type="email" id="regEmail" placeholder="Email"></p>
    <p> <input type="password" id="regPass" placeholder="Password"></p>
    <p><button class="register-btn" onclick="addUser()">Register</button></p> 
    <hr>
    <p>Existed user get back to login <button class="create" onclick="showLoginForm()">Back to Login</button></p>   
    ` 
    root.innerHTML=str;
}