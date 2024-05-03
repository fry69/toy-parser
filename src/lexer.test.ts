import { describe, expect, it } from "bun:test";
import { Lexer } from "./lexer";
import { TokenType } from "./types.d";

describe("Lexer", () => {
  it("should lex a simple assignment statement", () => {
    const input = '$test_var = "Hello World!"';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    expect(tokens).toEqual([
      { type: TokenType.VARIABLE, value: "test_var" },
      { type: TokenType.EQUAL, value: "=" },
      { type: TokenType.STRING, value: "Hello World!" },
    ]);
  });

  it("should lex a print statement with multiple expressions", () => {
    const input = 'PRINT $a, $b, "Hello", 123';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    expect(tokens).toEqual([
      { type: TokenType.PRINT, value: "PRINT" },
      { type: TokenType.VARIABLE, value: "a" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.VARIABLE, value: "b" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.STRING, value: "Hello" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.INTEGER, value: 123 },
    ]);
  });

  it("should lex a complex expression with various operators", () => {
    const input = "2 + 3 * 4 - 1";
    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    expect(tokens).toEqual([
      { type: TokenType.INTEGER, value: 2 },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.INTEGER, value: 3 },
      { type: TokenType.MULTIPLY, value: "*" },
      { type: TokenType.INTEGER, value: 4 },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.INTEGER, value: 1 },
    ]);
  });

  it("should handle invalid input and throw an error", () => {
    const input = 'PRINT $a, $b, "Hello", 123, asf';
    const lexer = new Lexer(input);

    expect(() => lexer.lex()).toThrowError(
      "Lexer: unexpected symbol 'a' at index 28"
    );
  });

  it("should handle string literals with escaped characters", () => {
    const input = 'PRINT "Hello\\"World\\""';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    expect(tokens).toEqual([
      { type: TokenType.PRINT, value: "PRINT" },
      { type: TokenType.STRING, value: 'Hello"World"' },
    ]);
  });

  it("should handle variable names with multiple characters", () => {
    const input = "$my_variable = 123";
    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    expect(tokens).toEqual([
      { type: TokenType.VARIABLE, value: "my_variable" },
      { type: TokenType.EQUAL, value: "=" },
      { type: TokenType.INTEGER, value: 123 },
    ]);
  });

  it.todo("should handle whitespace and comments", () => {
    const input = `
      $a = 1
      ; This is a comment
      $b = 2
      PRINT $a, $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();

    expect(tokens).toEqual([
      { type: TokenType.VARIABLE, value: "a" },
      { type: TokenType.EQUAL, value: "=" },
      { type: TokenType.INTEGER, value: 1 },
      { type: TokenType.VARIABLE, value: "b" },
      { type: TokenType.EQUAL, value: "=" },
      { type: TokenType.INTEGER, value: 2 },
      { type: TokenType.PRINT, value: "PRINT" },
      { type: TokenType.VARIABLE, value: "a" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.VARIABLE, value: "b" },
    ]);
  });
});
