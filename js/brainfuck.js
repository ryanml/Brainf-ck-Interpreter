// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {
  // Strict mode
  'use strict';

  // Initial tokens and max ascii value for this environment
  const ASCII_MAX = 255;
  var BF_TOKENS = "+-<>[].,";
  var INC_PTR = '>';
  var DEC_PTR = '<';
  var INC_AT_PTR = '+';
  var DEC_AT_PTR = '-';
  var START_LOOP = '[';
  var END_LOOP = ']';
  var OUTPUT = '.';
  var INPUT = ',';

  // Dom elements
  var codeArea = document.getElementById('code');
  var exSelect = document.getElementById('example-code');
  var langSelect = document.getElementById('lang-select');
  var inputArea = document.getElementById('code-input');
  var outputArea = document.getElementById('code-output');
  var tArea = document.getElementById('t-output');
  var error = document.getElementById('error');
  var run = document.getElementById('run');
  var updateCmnd = document.getElementById('update-cmnd');
  var tokenTexts = document.getElementsByClassName('cust-text');
  var clearCode = document.getElementById('clear-code');
  var clearInput = document.getElementById('clear-input');
  var clearOutput = document.getElementById('clear-output');
  var clearScript = document.getElementById('clear-script');

  // Brainfuck code examples
  var code = {
    ad: ',>,[<+>-]<------------------------------------------------.',
    hw: '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.',
    gs: '++++[>+++++<-]>[<+++++>-]+<+[>[>+>+<<-]++>>[<<+>>-]>>>[-]++>[-]+>>>+[[-]++++++>>>]<<<[[<++++++++<++>>-]+<.<[>----<-]<]<<[>>>>>[>>>[-]+++++++++<[>-<-]+++++++++>[-[<->-]+[<<<]]<[>+<-]>]<<-]<<-]',
    fb: '+++++++++++>+>>>>++++++++++++++++++++++++++++++++++++++++++++>++++++++++++++++++++++++++++++++<<<<<<[>[>>>>>>+>+<<<<<<<-]>>>>>>>[<<<<<<<+>>>>>>>-]<[>++++++++++[-<-[>>+>+<<<-]>>>[<<<+>>>-]+<[>[-]<[-]]>[<<[>>>+<<<-]>>[-]]<<]>>>[>>+>+<<<-]>>>[<<<+>>>-]+<[>[-]<[-]]>[<<+>>[-]]<<<<<<<]>>>>>[++++++++++++++++++++++++++++++++++++++++++++++++.[-]]++++++++++<[->-<]>++++++++++++++++++++++++++++++++++++++++++++++++.[-]<<<<<<<<<<<<[>>>+>+<<<<-]>>>>[<<<<+>>>>-]<-[>>.>.<<<[-]]<<[>>+>+<<<-]>>>[<<<+>>>-]<<[<+>-]>[<+>-]<<<-]'
  };

  // Generate tokens from customization input
  const generateTokens = (tokenArray) => {
    INC_PTR = document.getElementById('inc-ptr').value;
    DEC_PTR = document.getElementById('dec-ptr').value;
    INC_AT_PTR = document.getElementById('inc-a-ptr').value;
    DEC_AT_PTR = document.getElementById('dec-a-ptr').value;
    START_LOOP = document.getElementById('start-loop').value;
    END_LOOP = document.getElementById('end-loop').value;
    OUTPUT = document.getElementById('output').value;
    INPUT = document.getElementById('input').value;
    // Update BF_TOKENS
    BF_TOKENS = tokenArray.join('');
  };

  // Check customized tokens
  const checkTokens = () => {
    var tokens = [];
    var noError = true;
    for (var t = 0; t < tokenTexts.length; t++) {
      // We don't want blanks or spaces
      if (tokenTexts[t].value.length == 0 || tokenTexts[t].value == ' ') {
        error.innerHTML = "Tokens cannot contain a space or blank"
        noError = false;
        break;
      }
      // Non-unique tokens are also not allowed
      if (tokens.indexOf(tokenTexts[t].value) < 0) {
        tokens.push(tokenTexts[t].value);
      }
      else {
        error.innerHTML = "Tokens must be unqiue";
        noError = false;
        break;
      }
    }
    if (noError) {
      generateTokens(tokens);
    }
  };

  // Events
  run.addEventListener('click', () => {
    outputArea.value = error.innerHTML = tArea.value = '';
    interpreter.parse(codeArea.value, inputArea.value);
  });
  clearCode.addEventListener('click', () => {
    codeArea.value = error.innerHTML = '';
  });
  clearInput.addEventListener('click', () => {
    inputArea.value = '';
  });
  clearOutput.addEventListener('click', () => {
    outputArea.value = error.innerHTML = '';
  });
  clearScript.addEventListener('click', () => {
    tArea.value = '';
  });
  exSelect.addEventListener('change', function() {
    if (this.value === 'df') {
      codeArea.value = '';
    }
    else {
      codeArea.value = code[this.value];
      outputArea.value = tArea.value = '';
    }
  });
  langSelect.addEventListener('change', function() {
    tArea.value = this.value === 'js' ? interpreter.js : interpreter.c;
  });
  updateCmnd.addEventListener('click', () => {
    codeArea.value = inputArea.value = outputArea.value = tArea.value = '';
    exSelect.value = 'df';
    checkTokens();
  });

  // Interpreter object
  var interpreter = {
    // Starts with a stack and a pointer to the first index
    stack: [],
    ptr: 0,
    input: [],
    c: '',
    js: '',
    // Gets valid BF characters, resets attributes
    parse: function(code, input) {
      this.stack = [];
      this.ptr = 0;
      this.input = [...input];
      this.c = '#include <stdio.h>\n#include <stdlib.h>\n\nunsigned char *ptr;\nunsigned char mem[30000];\n\nint main(int argc, char **argv) {\n  ptr = mem;\n';
      this.js = 'var mem = [];\nvar ptr = 0;\nvar am = 255;\nmem[ptr] = mem[ptr] || 0;\n';
      var tokens = [...code];
      if (code.length === 0) {
        this.giveError('You must input some code');
      }
      else {
        // Check for invalid tokens
        var invalidTokens = tokens.filter((token) =>
          BF_TOKENS.indexOf(token) < 0
        );
        if (invalidTokens.length > 0) {
          this.giveError('Invalid tokens');
          return false;
        }
        var validSyntax = this.checkSyntax(tokens);
        if (validSyntax) {
          this.interpret(tokens);
        }
        else {
          this.giveError('Syntax error');
        }
      }
    },
    // Checks for syntax errors (Misplaced brackets)
    checkSyntax: function(tokens) {
      var pStack = [];
      for (var c = 0; c < tokens.length; c++) {
        if (tokens[c] === START_LOOP) {
          pStack.push(tokens[c]);
        }
        else if (tokens[c] === END_LOOP) {
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
        switch (tokens[c]) {
          case INC_AT_PTR:
            // Set value to 0 if we are at the max ascii value, else, add 1
            if (val === ASCII_MAX) {
              this.stack[this.ptr] = 0;
            }
            else {
              this.stack[this.ptr]++;
            }
            break;
          case DEC_AT_PTR:
            // Set value to the max ascii value if we are at 0, else, subtract 1
            if (val === 0) {
              this.stack[this.ptr] = ASCII_MAX;
            }
            else {
              this.stack[this.ptr]--;
            }
            break;
          case DEC_PTR:
            if (this.ptr === 0) {
              this.giveError('Index out of bounds error');
            }
            else {
              this.ptr--;
            }
            break;
          case INC_PTR:
            if (this.ptr === 29999) {
              this.giveError('Index out of bounds error');
            }
            else {
              this.ptr++;
            }
            break;
          case START_LOOP:
            if (val === 0) {
              // If the current val is at 0, move over one
              c++;
              // While we have not reached the next closing brack and var loops > 0
              while (tokens[c] !== END_LOOP || loops > 0) {
                // Increment or decrement loop count if we reach an opening or closing bracket
                if (tokens[c] === START_LOOP) {
                  loops++;
                }
                else if (tokens[c] === END_LOOP) {
                  loops--;
                }
                // Move over one token
                c++;
              }
            }
            break;
          case END_LOOP:
            // If current val is 0, move back one
            if (val !== 0) {
              c--;
              // if we are not at a closing bracket and loops is greater than 0
              while (tokens[c] !== START_LOOP || loops > 0) {
                // Increment or decrement loop count if we reach a closing or opening bracket
                if (tokens[c] === END_LOOP) {
                  loops++;
                }
                else if (tokens[c] === START_LOOP) {
                  loops--;
                }
                // Move back one token
                c--;
              }
              // Move back one token
              c--;
            }
            break;
          case OUTPUT:
            var asciiChar = String.fromCharCode(val);
            outputArea.value += asciiChar;
            break;
          case INPUT:
            if (this.input.length > 0) {
              this.stack[this.ptr] = String(this.input.shift().charCodeAt(0));
            }
            break;
        }
      }
      this.transpile(tokens);
    },
    transpile: function(tokens) {
      var ci = 1;
      var ji = 0;
      for (var s = 0; s < tokens.length; s++) {
        var cind = this.getIndent(ci);
        var jind = this.getIndent(ji);
        switch (tokens[s]) {
          case INC_AT_PTR:
            this.c += cind + '++*ptr;\n';
            this.js += jind + 'mem[ptr] = mem[ptr] === am ? 0 : mem[ptr] + 1;\n';
            break;
          case DEC_AT_PTR:
            this.c += cind + '--*ptr;\n';
            this.js += jind + 'mem[ptr] = mem[ptr] === 0 ? am : mem[ptr] - 1;\n';
            break;
          case DEC_PTR:
            this.c += cind + '--ptr;\n';
            this.js += jind + 'ptr--;\n' + jind + 'mem[ptr] = mem[ptr] || 0;\n';
            break;
          case INC_PTR:
            this.c += cind + '++ptr;\n';
            this.js += jind + 'ptr++;\n' + jind + 'mem[ptr] = mem[ptr] || 0;\n';
            break;
          case START_LOOP:
            this.c += cind + 'while (*ptr) {\n';
            this.js += jind + 'while (mem[ptr] !== 0) {\n';
            ci++;
            ji++;
            break;
          case END_LOOP:
            cind = this.getIndent(--ci);
            jind = this.getIndent(--ji);
            this.c += cind + '}\n';
            this.js += jind + '}\n';
            break;
          case OUTPUT:
            this.c += cind + 'putchar(*ptr);\n';
            this.js += jind + 'console.log(String.fromCharCode(mem[ptr]));\n';
            break;
          case INPUT:
            this.c += cind + '*ptr = getchar();\n';
            this.js += jind + 'mem[ptr] = prompt("Enter value").charCodeAt(0);\n';
            break;
        }
      }
      this.c += '  return 0;\n}';
      tArea.value = langSelect.value === 'c' ? this.c : this.js;
    },
    getIndent: function(i) {
      var sp = '';
      for (var d = 0; d < i; d++) {
        sp += '  ';
      }
      return sp;
    },
    giveError: function(msg) {
      error.innerHTML = msg;
    }
  };
}
