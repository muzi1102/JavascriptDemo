window.onload = function() {
    var keys = document.querySelectorAll('#calculator span');
    var operators = ['+', '-', 'x', '÷'];
    var decimalAdded = false
    for (var i = 0, len = keys.length; i < len; i++) {
        keys[i].onclick = function(e) {
            console.log("a")
            var input = document.querySelector('.screen'),
                inputVal = input.innerHTML,
                btnVal = this.innerHTML;
            // btn clear
            if (btnVal == 'C') {
                input.innerHTML = '';
                decimalAdded = false;
            }
            // btn =
            else if (btnVal == '=') {
                var equation = inputVal,
                    lastChar = equation[equation.length - 1];
                equation = equation.replace(/x/g, '*').replace(/÷/g, '/');
                if (operators.indexOf(operators) > -1 || lastChar == '.') {
                    equation = equation.replace(/.$/, '')
                }
                if (equation) {
                    input.innerHTML = eval(equation)
                }
                decimalAdded = false;
            }
            // btn operators
            else if (operators.indexOf(btnVal) > -1) {
                var lastChar = inputVal[inputVal.length - 1];
                if (inputVal != '' && operators.indexOf(lastChar) == -1) {
                    input.innerHTML += btnVal;
                } else if (inputVal == '' && btnVal == '-') {
                    input.innerHTML += btnVal;
                }
                if (operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
                    input.innerHTML = inputVal.replace(/.$/, btnVal)
                }
                decimalAdded = false;
            } //btn .
            else if (btnVal == '.') {
                if (!decimalAdded) {
                    input.innerHTML += btnVal;
                    decimalAdded = true;
                }
            } else {
                input.innerHTML += btnVal
            }
            e.preventDefault();
        }
    }
}
