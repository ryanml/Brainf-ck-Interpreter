// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {

  // Constants
  const ALLOWED_CHARS = "+-<>[].,\n ";
  const ASCII_MAX = 255;

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
        // Set stack location to zero if it is uninitialized, else 0
        this.stack[this.ptr] = this.stack[this.ptr] || 0;
        var val = this.stack[this.ptr];
        switch(tokens[c]) {
          case '+':
            // Set value to 0 if we are at the max ascii value, else, add 1
            this.stack[this.ptr] = val === ASCII_MAX ? 0 : val + 1;
            break;
          case '-':
            // Set value to the max ascii value if we are at 0, else, subtract 1
            this.stack[this.ptr] = val === 0 ? ASCII_MAX : val - 1;
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
            if (val === 0) {
              // If the current val is at 0, move over one
              c++;
              // While we have not reached the next closing brack and var loops > 0
              while (tokens[c] !== ']' || loops > 0) {
                // Increment or decrement loop count if we reach an opening or closing bracket
                if (tokens[c] === '[') {
                  loops++;
                }
                else if (tokens[c] === ']') {
                  loops--;
                }
                // Move over one token
                c++;
              }
            }
            break;
          case ']':
            // If current val is 0, move back one
            if (val !== 0) {
              c--;
              // if we are not at a closing bracket and loops is greater than 0
              while (tokens[c] !== '[' || loops > 0) {
                // Increment or decrement loop count if we reach a closing or opening bracket
                if (tokens[c] === ']') {
                  loops++;
                }
                else if (tokens[c] === '[') {
                  loops--;
                }
                // Move back one token
                c--;
              }
              // Move back one token
              c--;
            }
            break;
          case '.':
            var asciiChar = String.fromCharCode(val);
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
