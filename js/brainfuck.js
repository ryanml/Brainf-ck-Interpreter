// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {

  // Constants
  const ALLOWED_CHARS = "+-<>[].,\n ";

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
    input: [],
    // Checks for illegal characters
    parse: function(code, input) {
      this.stack = [];
      this.ptr = 0;
      this.input = [...input];
      var tokens = [...code];
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
            this.interpret(tokens);
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
    interpret: function(tokens) {
      var loops = 0;
      for (var c = 0; c < tokens.length; c++) {
        switch(tokens[c]) {
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
            if (this.stack[this.ptr] === 0) {
              c++;
              while (tokens[c] !== ']' || loops > 0) {
                if (tokens[c] === '[') {
                  loops++;
                }
                else if (tokens[c] === ']') {
                  loops--;
                }
                c++;
              }
            }
            break;
          case ']':
            if (this.stack[this.ptr] !== 0) {
              c--;
              while (tokens[c] !== '[' || loops > 0) {
                if (tokens[c] === ']') {
                  loops++;
                }
                else if (tokens[c] === '[') {
                  loops--;
                }
                c--;
              }
              c--;
            }
            break;
          case '.':
            var asciiChar = String.fromCharCode(this.stack[this.ptr]);
            output.value += asciiChar;
            break;
          case ',':
            if (this.input.length > 0) {
              this.stack[this.ptr] = String(this.input.shift().charCodeAt(0));
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
