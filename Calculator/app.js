function press(value) {
  document.getElementById("display").value += value;
}

function calculate() {
  let expression = document.getElementById("display").value;
  document.getElementById("display").value = eval(expression);
}

function clearDisplay() {
  document.getElementById("display").value = "";
}
