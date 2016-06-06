// Title: brainfuck.js
// Author: Ryan Lanese

window.onload = function() {

  // Constants
  const BF_TOKENS = "+-<>[].,";
  const ASCII_MAX = 255;

  // Dom elements
  var codeArea = document.getElementById('code');
  var inputArea = document.getElementById('code-input');
  var outputArea = document.getElementById('code-output');
  var scriptArea = document.getElementById('script-output');
  var exSelect = document.getElementById('example-code');
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
    interpreter.parse(codeArea.value, inputArea.value);
  });
  clearCode.addEventListener('click', () => {
    codeArea.value = '';
    error.innerHTML = '';
  });
  clearInput.addEventListener('click', () => {
    inputArea.value = '';
  });
  clearOutput.addEventListener('click', () => {
    outputArea.value = '';
    error.innerHTML = '';
  });
  clearScript.addEventListener('click', () => {
    scriptArea.value = '';
  });
  exSelect.addEventListener('change', function() {
    if (this.value === 'df') {
      codeArea.value = '';
    }
    else {
      codeArea.value = code[this.value];
      outputArea.value = '';
      scriptArea.value = '';
    }
  });

  // Interpreter object
  var interpreter = {
    // Starts with a stack and a pointer to the first index
    stack: [],
    ptr: 0,
    input: [],
    script: '',
    // Gets valid BF characters
    parse: function(code, input) {
      this.stack = [];
      this.ptr = 0;
      this.input = [...input];
      this.script = 'var mem = [];\nvar ptr = 0;\nvar am = 255;\n';
      var tokens = [...code];
      if (tokens.length === 0) {
        this.giveError('You must input some code');
      }
      else {
        tokens = tokens.filter((token) =>
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
      this.genScript(tokens);
    },
    genScript: function(tokens) {
      var ic = 0;
      this.script += 'mem[ptr] = mem[ptr] || 0;\n';
      for (var s = 0; s < tokens.length; s++) {
        var ind = this.getIndent(ic);
        switch (tokens[s]) {
          case '+':
            this.script += ind + 'mem[ptr] = mem[ptr] === am ? 0 : mem[ptr] + 1;\n';
            break;
          case '-':
            this.script += ind + 'mem[ptr] = mem[ptr] === 0 ? am : mem[ptr] - 1;\n';
            break;
          case '<':
            this.script += ind + 'ptr--;\n' + ind + 'mem[ptr] = mem[ptr] || 0;\n';
            break;
          case '>':
            this.script += ind + 'ptr++;\n' + ind + 'mem[ptr] = mem[ptr] || 0;\n';
            break;
          case '[':
            this.script += ind + 'while (mem[ptr] !== 0) {\n';
            ic++;
            break;
          case ']':
            ind = this.getIndent(--ic);
            this.script += ind + '}\n';
            break;
          case '.':
            this.script += ind + 'console.log(String.fromCharCode(mem[ptr]));\n';
            break;
          case ',':
            this.script += ind + 'mem[ptr] = prompt("Enter value").charCodeAt(0);\n';
            break;
        }
      }
      scriptArea.value = this.script;
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
