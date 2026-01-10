function my()
{

//alert(document.getElementById("log").value);  
//let hi=LBMSG.innerHTML="email:"+document.getElementById("log").value+
//" password:"+document.getElementById("pass").value;  
//alert(hi)
let email=document.getElementById("log").value;
let password=document.getElementById("pass").value;
const regex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|zohomail\.in|kitsw\.ac\.in)$/;
if (email="manikiran649@gmail.com"&&password==="1234") {

  LBMSG.innerHTML="Welcome!";
  LBMSG.style.color="green";
}
else{
  LBMSG.innerHTML="Invalid email domain. Please use valid email.";
}
}

function showLoginForm() {
  let str=`<h3>Log in form</h3>
    <p><label id="LBMSG"></label></p>
    <p> <input type="email" id="log"></p>
    <p> <input type="password" id="pass"></p>
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
    <p><button class="register-btn" onclick="register()">Register</button></p> 
    <hr>
    <p><button class="create" onclick="showLoginForm()">Back to Login</button></p>   
    ` 
    root.innerHTML=str;
}