// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {

  // Constants
  const TOKENS = '+-<>[].,';

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
    // Starts with a stack and a pointer to the first index
    stack: [],
    ptr: 0,
    // Checks for illegal characters
    parse: function(code) {
      this.stack = [];
      this.ptr = 0;
      var tokens = [...code];
      var badChars = tokens.filter((token) =>
        TOKENS.indexOf(token) < 0
      );
      if (badChars.length > 0) {
        this.giveError('Illegal Character');
      }
      else {
        this.interpret(tokens);
      }
    },
    interpret: function(tokens) {
      for (i = 0; i < tokens.length; i++) {
        switch(tokens[i]) {
          case '+':
            this.stack[this.ptr] = this.stack[this.ptr] || 0;
            this.stack[this.ptr]++;
            break;
          case '-':
            this.stack[this.ptr] = this.stack[this.ptr] || 0;
            this.stack[this.ptr]--;
            break;
          case '<':
            if (this.ptr === 0) {
              this.giveError('Index out of bounds error');
            }
            else {
              this.ptr--;
            }
            break;
          case '>':
            if (this.ptr === 29999) {
              this.giveError('Index out of bounds error');
            }
            else {
              this.ptr++;
            }
            break;
          case '[':
            break;
          case ']':
            break;
          case '.':
            var asciiChar = String.fromCharCode(this.stack[this.ptr]);
            output.value += asciiChar;
            break;
          case ',':
            break;
        }
      }
    },
    giveError: function(msg) {
      error.innerHTML = msg;
    }
  };
}
