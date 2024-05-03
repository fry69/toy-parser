import { describe, expect, it } from "bun:test";
import { Parser } from "./parser";
import { Lexer } from "./lexer";
import { NodeType } from "./types.d";


describe("Parser", () => {
  it("should parse a simple assignment statement", () => {
    const input = '$test_var = "Hello World!"';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.AssignmentStatement,
        varname: "test_var",
        value: {
          type: NodeType.Literal,
          value: "Hello World!",
        },
      },
    ]);
  });

  it("should parse a print statement with multiple expressions", () => {
    const input = 'PRINT $a, $b, "Hello", 123';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.VariableReference,
            varname: "a",
          },
          {
            type: NodeType.VariableReference,
            varname: "b",
          },
          {
            type: NodeType.Literal,
            value: "Hello",
          },
          {
            type: NodeType.Literal,
            value: 123,
          },
        ],
      },
    ]);
  });

  it("should parse a complex expression with various operators", () => {
    const input = "PRINT 2 + 3 - 1";
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.BinaryExpression,
            left: {
              type: NodeType.BinaryExpression,
              left: {
                type: NodeType.Literal,
                value: 2,
              },
              operator: "+",
              right: {
                type: NodeType.Literal,
                value: 3,
              },
            },
            operator: "-",
            right: {
              type: NodeType.Literal,
              value: 1,
            },
          },
        ],
      },
    ]);
  });

  it("should handle invalid input and throw an error", () => {
    const input = 'PRINT $a, $b, "Hello", 123, asf';
    const lexer = new Lexer(input);
    expect(() => lexer.lex()).toThrowError(
      "Lexer: unexpected symbol 'a' at index 28"
    );
    // const tokens = lexer.lex();
    // const parser = new Parser(tokens);
  });

  it("should parse a sequence of statements", () => {
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

    expect(statements).toEqual([
      {
        type: NodeType.AssignmentStatement,
        varname: "a",
        value: {
          type: NodeType.Literal,
          value: 1,
        },
      },
      {
        type: NodeType.AssignmentStatement,
        varname: "b",
        value: {
          type: NodeType.Literal,
          value: 2,
        },
      },
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.VariableReference,
            varname: "a",
          },
          {
            type: NodeType.VariableReference,
            varname: "b",
          },
        ],
      },
      {
        type: NodeType.AssignmentStatement,
        varname: "c",
        value: {
          type: NodeType.BinaryExpression,
          left: {
            type: NodeType.VariableReference,
            varname: "a",
          },
          operator: "+",
          right: {
            type: NodeType.VariableReference,
            varname: "b",
          },
        },
      },
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.VariableReference,
            varname: "c",
          },
        ],
      },
    ]);
  });

  it("should handle operator precedence correctly", () => {
    const input = "PRINT 2 + 3 * 4 - 1";
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.BinaryExpression,
            left: {
              type: NodeType.BinaryExpression,
              left: {
                type: NodeType.Literal,
                value: 2,
              },
              operator: "+",
              right: {
                type: NodeType.BinaryExpression,
                left: {
                  type: NodeType.Literal,
                  value: 3,
                },
                operator: "*",
                right: {
                  type: NodeType.Literal,
                  value: 4,
                },
              },
            },
            operator: "-",
            right: {
              type: NodeType.Literal,
              value: 1,
            },
          },
        ],
      },
    ]);
  });

  it("should handle variable references correctly", () => {
    const input = `
      $a = 1
      $b = 2
      PRINT $a, $b, $a + $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.AssignmentStatement,
        varname: "a",
        value: {
          type: NodeType.Literal,
          value: 1,
        },
      },
      {
        type: NodeType.AssignmentStatement,
        varname: "b",
        value: {
          type: NodeType.Literal,
          value: 2,
        },
      },
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.VariableReference,
            varname: "a",
          },
          {
            type: NodeType.VariableReference,
            varname: "b",
          },
          {
            type: NodeType.BinaryExpression,
            left: {
              type: NodeType.VariableReference,
              varname: "a",
            },
            operator: "+",
            right: {
              type: NodeType.VariableReference,
              varname: "b",
            },
          },
        ],
      },
    ]);
  });

  it("should handle string and integer literals correctly", () => {
    const input = 'PRINT "Hello", 123';
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.Literal,
            value: "Hello",
          },
          {
            type: NodeType.Literal,
            value: 123,
          },
        ],
      },
    ]);
  });

  it("should handle empty statements correctly", () => {
    const input = `
      $a = 1
      ;
      $b = 2
      PRINT $a, $b
    `;
    const lexer = new Lexer(input);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    expect(statements).toEqual([
      {
        type: NodeType.AssignmentStatement,
        varname: "a",
        value: {
          type: NodeType.Literal,
          value: 1,
        },
      },
      {
        type: NodeType.AssignmentStatement,
        varname: "b",
        value: {
          type: NodeType.Literal,
          value: 2,
        },
      },
      {
        type: NodeType.PrintStatement,
        expressions: [
          {
            type: NodeType.VariableReference,
            varname: "a",
          },
          {
            type: NodeType.VariableReference,
            varname: "b",
          },
        ],
      },
    ]);
  });
});
