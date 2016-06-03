// Title: interpreter.js
// Author: Ryan Lanese
// Contains a stripped version of the interpreter, modified to log output to console

var interpreter = {
  // Starts with a stack and a pointer to the first index
  stack: [],
  output: '',
  ptr: 0,
  input: [],
  BF_TOKENS: "+-<>[].,",
  ASCII_MAX: 255,
  // Gets valid BF characters
  parse: function(testNo, code, input) {
    console.log('TEST NO:' + testNo);
    this.output = '';
    this.stack = [];
    this.ptr = 0;
    this.input = [...input];
    var tokens = [...code];
    tokens = tokens.filter((token) =>
      this.BF_TOKENS.indexOf(token) > -1
    );
    var validSyntax = this.checkSyntax(tokens);
    if (validSyntax) {
      this.interpret(tokens);
    }
    else {
      console.log('Syntax error');
    }
  },
  // Checks for syntax errors (Misplaced brackets)
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
    return pStack.length === 0 ? true : false;
  },
  interpret: function(tokens) {
    var loops = 0;
    for (var c = 0; c < tokens.length; c++) {
      // Set stack location to zero if it is uninitialized, else 0
      this.stack[this.ptr] = this.stack[this.ptr] || 0;
      var val = this.stack[this.ptr];
      switch (tokens[c]) {
        case '+':
          // Set value to 0 if we are at the max ascii value, else, add 1
          if (val === this.ASCII_MAX) {
            this.stack[this.ptr] = 0;
          }
          else {
            this.stack[this.ptr]++;
          }
          break;
        case '-':
          // Set value to the max ascii value if we are at 0, else, subtract 1
          if (val === 0) {
            this.stack[this.ptr] = this.ASCII_MAX;
          }
          else {
            this.stack[this.ptr]--;
          }
          break;
        case '<':
          if (this.ptr === 0) {
            console.log('Index out of bounds error\n');
          }
          else {
            this.ptr--;
          }
          break;
        case '>':
          if (this.ptr === 29999) {
            console.log('Index out of bounds error\n');
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
          this.output += asciiChar;
          break;
        case ',':
          if (this.input.length > 0) {
            this.stack[this.ptr] = String(this.input.shift().charCodeAt(0));
          }
          break;
      }
      if (c === tokens.length - 1 && this.output.length > 0) {
        console.log(this.output);
      }
    }
  },
};
