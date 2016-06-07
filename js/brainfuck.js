// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {
  // Strict mode
  'use strict';

  // Constants
  const BF_TOKENS = "+-<>[].,";
  const ASCII_MAX = 255;

  // Dom elements
  var codeArea = document.getElementById('code');
  var exSelect = document.getElementById('example-code');
  var langSelect = document.getElementById('lang-select');
  var inputArea = document.getElementById('code-input');
  var outputArea = document.getElementById('code-output');
  var tArea = document.getElementById('t-output');
  var error = document.getElementById('error');
  var run = document.getElementById('run');
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
      if (code.length === 0) {
        this.giveError('You must input some code');
      }
      else {
        var tokens = [...code].filter((token) =>
          BF_TOKENS.indexOf(token) > -1
        );
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
        switch (tokens[c]) {
          case '+':
            // Set value to 0 if we are at the max ascii value, else, add 1
            if (val === ASCII_MAX) {
              this.stack[this.ptr] = 0;
            }
            else {
              this.stack[this.ptr]++;
            }
            break;
          case '-':
            // Set value to the max ascii value if we are at 0, else, subtract 1
            if (val === 0) {
              this.stack[this.ptr] = ASCII_MAX;
            }
            else {
              this.stack[this.ptr]--;
            }
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
            outputArea.value += asciiChar;
            break;
          case ',':
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
          case '+':
            this.c += cind + '++*ptr;\n';
            this.js += jind + 'mem[ptr] = mem[ptr] === am ? 0 : mem[ptr] + 1;\n';
            break;
          case '-':
            this.c += cind + '--*ptr;\n';
            this.js += jind + 'mem[ptr] = mem[ptr] === 0 ? am : mem[ptr] - 1;\n';
            break;
          case '<':
            this.c += cind + '--ptr;\n';
            this.js += jind + 'ptr--;\n' + jind + 'mem[ptr] = mem[ptr] || 0;\n';
            break;
          case '>':
            this.c += cind + '++ptr;\n';
            this.js += jind + 'ptr++;\n' + jind + 'mem[ptr] = mem[ptr] || 0;\n';
            break;
          case '[':
            this.c += cind + 'while (*ptr) {\n';
            this.js += jind + 'while (mem[ptr] !== 0) {\n';
            ci++;
            ji++;
            break;
          case ']':
            cind = this.getIndent(--ci);
            jind = this.getIndent(--ji);
            this.c += cind + '}\n';
            this.js += jind + '}\n';
            break;
          case '.':
            this.c += cind + 'putchar(*ptr);\n';
            this.js += jind + 'console.log(String.fromCharCode(mem[ptr]));\n';
            break;
          case ',':
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
