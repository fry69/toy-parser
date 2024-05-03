import { describe, expect, it, jest } from "bun:test";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

describe("Interpreter", () => {
  it("should correctly evaluate a simple assignment statement", () => {
    const input = '$test_var = "Hello World!"';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    interpreter.interpret();

    expect(interpreter.getVariable('test_var')).toBe('Hello World!');
  });

  it("should correctly evaluate a print statement with multiple expressions", () => {
    const input = `
      $a = "Hello"
      $b = "World"
      PRINT $a, $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    console.log = jest.fn();
    interpreter.interpret();
    expect(console.log).toHaveBeenCalledWith("Hello World");
  });

  it("should correctly evaluate a complex expression with various operators", () => {
    const input = `
      $a = 2
      $b = 3
      $c = $a + $b * 4 - 1
      PRINT $c
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    console.log = jest.fn();
    interpreter.interpret();
    expect(console.log).toHaveBeenCalledWith("13");
  });

  it("should handle undefined variables and throw an error", () => {
    const input = `
      PRINT $a
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    expect(() => interpreter.interpret()).toThrowError(
      "Interpreter: variable 'a' is not defined"
    );
  });

  it("should correctly handle a sequence of statements", () => {
    const input = `
      $a = 1
      $b = 2
      PRINT $a, $b
      $c = $a + $b
      PRINT $c
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    console.log = jest.fn();
    interpreter.interpret();
    expect(console.log).toHaveBeenCalledWith("1 2");
    expect(console.log).toHaveBeenCalledWith("3");
  });

  it("should correctly handle arithmetic operations", () => {
    const input = `
      $a = 5
      $b = 3
      PRINT $a + $b
      PRINT $a - $b
      PRINT $a * $b
      PRINT $a / $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    console.log = jest.fn();
    interpreter.interpret();
    expect(console.log).toHaveBeenCalledWith("8");
    expect(console.log).toHaveBeenCalledWith("2");
    expect(console.log).toHaveBeenCalledWith("15");
    expect(console.log).toHaveBeenCalledWith("1.6666666666666667");
  });

  it("should correctly handle string and integer literals", () => {
    const input = `
      PRINT "Hello", 123
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    console.log = jest.fn();
    interpreter.interpret();
    expect(console.log).toHaveBeenCalledWith("Hello 123");
  });

  it("should correctly handle variable reassignment", () => {
    const input = `
      $a = 1
      $a = 2
      PRINT $a
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    console.log = jest.fn();
    interpreter.interpret();
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("should correctly handle division by zero", () => {
    const input = `
      $a = 10
      $b = 0
      PRINT $a / $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    expect(() => interpreter.interpret()).toThrowError(
      "Interpreter: error evaluating expression"
    );
  });

  it("should correctly handle non-numeric operands", () => {
    const input = `
      $a = "hello"
      $b = "world"
      PRINT $a + $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    // console.log = jest.fn();
    // interpreter.interpret();
    expect(() => interpreter.interpret()).toThrowError(
      "Interpreter: operands must be numbers"
    );
    // expect(console.log).toHaveBeenCalledWith('helloworld');
  });

  it("should correctly handle unsupported statements", () => {
    const input = `
      @directive
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();
    const interpreter = new Interpreter(statements);

    expect(() => interpreter.interpret()).toThrowError(
      "Interpreter: unsupported statement: @directive"
    );
  });
});
