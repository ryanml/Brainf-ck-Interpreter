// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {

  // Constants
  const TOKENS = '.,<>[]+-';

  // Dom elements
  var codeArea = document.getElementById('code');
  var input = document.getElementById('code-input');
  var output = document.getElementById('code-output');
  var error = document.getElementById('error');
  var run = document.getElementById('run');
  var clear = document.getElementById('clear');

  // Events
  run.addEventListener('click', start);
  clear.addEventListener('click', clearFields);

  // Start event
  function start() {
    interpreter.parse(codeArea.value);
  }

  // Clears all fields
  function clearFields() {
    code.value = '';
    input.value = '';
    error.innerHTML = '';
    output.value = '';
  }

  // Interpreter object
  var interpreter = {
    parse: (code) => {
      console.log(code)
    }
  };
}
