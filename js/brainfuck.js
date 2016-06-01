// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {

  // Constants
  const ALLOWED_CHARS = '+-<>[]., ';

  // Dom elements
  var codeArea = document.getElementById('code');
  var inputArea = document.getElementById('code-input');
  var output = document.getElementById('code-output');
  var error = document.getElementById('error');
  var run = document.getElementById('run');
  var clearInputs = document.getElementById('clear-input');
  var clearOutput = document.getElementById('clear-output');

  // Events
  run.addEventListener('click', start);
  clearInputs.addEventListener('click', clearFields);
  clearOutput.addEventListener('click', clearFields);

  // Start event
  function start() {
    interpreter.parse(codeArea.value, inputArea.value);
  }

  // Clears all fields
  function clearFields() {
    if (this.id === 'clear-input') {
      codeArea.value = '';
      inputArea.value = '';
    }
    else {
      output.value = '';
    }
    error.innerHTML = '';
  }

  // Interpreter object
  var interpreter = {
    // Starts with a stack and a pointer to the first index
    stack: [],
    ptr: 0,
    // Checks for illegal characters
    parse: function(code, input) {
      this.stack = [];
      this.ptr = 0;
      var tokens = [...code];
      var inputs = [...input];
      if (tokens.length === 0) {
        this.giveError('You must input some code');
      }
      else {
        var badChars = tokens.filter((token) =>
          ALLOWED_CHARS.indexOf(token) < 0
        );
        if (badChars.length > 0) {
          this.giveError('Illegal Character(s)');
        }
        else {
          var validSyntax = this.checkSyntax(tokens);
          if (validSyntax) {
            this.interpret(tokens, inputs);
          }
          else {
            this.giveError('Syntax error.');
          }
        }
      }
    },
    checkSyntax: function(tokens) {
      var pStack = [];
      for (c = 0; c < tokens.length; c++) {
        if (tokens[c] === '[') {
          pStack.push(tokens[c]);
        }
        else if (tokens[c] === ']') {
          if (pStack.length === 0) {
            return false;
          }
          else {
            pStack.pop();
          }
        }
      }
      return pStack.length === 0 ? true: false;
    },
    interpret: function(tokens, inputs) {
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
            if (inputs.length > 0) {
              this.stack[this.ptr] = String(inputs.shift().charCodeAt(0));
            }
            break;
        }
      }
    },
    giveError: function(msg) {
      error.innerHTML = msg;
    }
  };
}
