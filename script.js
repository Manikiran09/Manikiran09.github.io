function cal() {
    let a = parseInt(document.getElementById("num1").value);
    let b = parseInt(document.getElementById("num2").value);
    if(!document.getElementById("add").value=="add"){
        let sum = a + b;
document.getElementById("result").innerHTML = "The sum is: " + sum;

    }
    else if(document.getElementById("sub").value=="sub"){
        let difference = a - b;
document.getElementById("result").innerHTML = "The difference is: " + difference;   


    }    else if(document.getElementById("mul").value=="mul"){
        let product = a * b;
document.getElementById("result").innerHTML = "The product is: " + product;
    }    else if(document.getElementById("div").value=="div"){
        let quotient = a / b;
document.getElementById("result").innerHTML = "The quotient is: " + quotient;
    }

}

