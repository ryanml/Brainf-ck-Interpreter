// Title: tests.js
// Author: Ryan Lanese
// Tests the interpreter with various inputs

// Expected output: ASCII value of two
interpreter.parse(1, '++.', '');

// Expected output: ASCII value of two
interpreter.parse(2, '+++-.', '');

// Expected output: Index out of bounds error
interpreter.parse(3, '<', '');

// Expected output: Syntax error
interpreter.parse(4, '[', '');

// Expected output: Syntax error
interpreter.parse(5, '][', '');

// Expected output: Syntax error
interpreter.parse(6, '[[[]]', '');

// Expected output: Index out of bounds error
interpreter.parse(7, '>>><<<<', '');

// Expected output: ASCII value of 255 (ÿ)
interpreter.parse(8, '-.', '');

// Expected output: print "Hello, world!"
interpreter.parse(9, '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.', '');

// Expected output: print "This is brainfuck"
interpreter.parse(10, '-[--->+<]>-.[---->+++++<]>-.+.++++++++++.+[---->+<]>+++.-[--->++<]>-.++++++++++.+[---->+<]>+++.[->+++<]>++.[--->+<]>----.+++[->+++<]>++.++++++++.+++++.--------.-[--->+<]>--.+[->+++<]>+.++++++++.', '');

// Expected output: This program will add two single digits inputs. This will output 7
interpreter.parse(11, ',>,[<+>-]<------------------------------------------------.', '43');

// Expected output: All square numbers up to 10000 (Credit to: http://www.hevanet.com/cristofd/brainfuck/squares.b)
interpreter.parse(12, '++++[>+++++<-]>[<+++++>-]+<+[>[>+>+<<-]++>>[<<+>>-]>>>[-]++>[-]+>>>+[[-]++++++>>>]<<<[[<++++++++<++>>-]+<.<[>----<-]<]<<[>>>>>[>>>[-]+++++++++<[>-<-]+++++++++>[-[<->-]+[<<<]]<[>+<-]>]<<-]<<-]', '');

// Expected output: Fibonacci series up to 100
interpreter.parse(13, '+++++++++++>+>>>>++++++++++++++++++++++++++++++++++++++++++++>++++++++++++++++++++++++++++++++<<<<<<[>[>>>>>>+>+<<<<<<<-]>>>>>>>[<<<<<<<+>>>>>>>-]<[>++++++++++[-<-[>>+>+<<<-]>>>[<<<+>>>-]+<[>[-]<[-]]>[<<[>>>+<<<-]>>[-]]<<]>>>[>>+>+<<<-]>>>[<<<+>>>-]+<[>[-]<[-]]>[<<+>>[-]]<<<<<<<]>>>>>[++++++++++++++++++++++++++++++++++++++++++++++++.[-]]++++++++++<[->-<]>++++++++++++++++++++++++++++++++++++++++++++++++.[-]<<<<<<<<<<<<[>>>+>+<<<<-]>>>>[<<<<+>>>>-]<-[>>.>.<<<[-]]<<[>>+>+<<<-]>>>[<<<+>>>-]<<[<+>-]>[<+>-]<<<-]', '');
