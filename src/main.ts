import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

// Example usage
const program = `
  $test_var = "Hello World!"
  PRINT $test_var

  ;;;
  $a = "This"; $b = "and \\"that\\""
  PRINT $a, $b
  PRINT "1+2=", 1 + 2;
  $c = 3
  $d = 4
  $e = $c + $d
  PRINT $c - 1
  PRINT $c - $d
  PRINT $c, $d, $e
  PRINT "Does this work?", "Yes!!!"
  PRINT 3 * 9
  PRINT 9 / 3
  PRINT 2 + 3 * 4 - 1
  PRINT 2 +3 *4 -1
  PRINT 2+3*4-1
  asf
  `;

const lexer = new Lexer(program);
const tokens = lexer.lex();

const parser = new Parser(tokens);
const statements = parser.parse();
console.dir(statements, { depth: 9 });

const interpreter = new Interpreter(statements);
interpreter.interpret();
