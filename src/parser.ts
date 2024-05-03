import type { Token, Statement, Expression, Atom, Operation } from "./types.d";
import { TokenType, NodeType } from "./types.d";
import { ErrorMessage } from "./utils";

/**
 *
 * Parser class
 *
 * Parses the input tokens and constructs an abstract syntax tree (AST).
 */
export class Parser extends ErrorMessage {
  private tokens: Token[];
  private currentIndex: number;

  /**
   * Constructs a new Parser instance with the given tokens.
   * @param tokens - The tokens to be parsed.
   */
  constructor(tokens: Token[]) {
    super();
    this.tokens = tokens;
    this.currentIndex = 0;
  }

  /**
   * Consumes the next token from the input.
   * @returns The consumed token.
   */
  private consume(): Token {
    return this.tokens[this.currentIndex++];
  }

  /**
   * Peeks at the current token in the input.
   * @returns The current token.
   */
  private peek(): Token {
    return this.tokens[this.currentIndex];
  }

  /**
   * Peeks at the next token in the input.
   * @returns The next token.
   */
  private peekNext(): Token {
    if (this.currentIndex + 1 < this.tokens.length) {
      return this.tokens[this.currentIndex + 1];
    } else {
      return { type: TokenType.EOL, value: "EOF" };
    }
  }

  /**
   * Parses an expression with the given precedence.
   * @param precedence - The precedence of the expression.
   * @returns The parsed expression.
   */
  private parseExpression(precedence: number = 0): Expression | undefined {
    if (this.peekNext().type !== TokenType.EOL) {
      return this.parseBinaryExpression(precedence);
    }
    return this.parseAtom();
  }

  /**
   * Parses a binary expression with the given precedence.
   * @param precedence - The precedence of the binary expression.
   * @returns The parsed binary expression.
   */
  private parseBinaryExpression(
    precedence: number = 0
  ): Expression | undefined {
    let left: Expression | undefined = this.parseAtom();

    while (left && this.currentIndex < this.tokens.length) {
      const token = this.peek();
      const operatorPrecedence = this.getOperatorPrecedence(token.type);

      if (operatorPrecedence <= precedence) {
        break;
      }

      const operator = this.consume().value as Operation;

      const right = this.parseExpression(operatorPrecedence);

      if (operator && right) {
        left = {
          type: NodeType.BinaryExpression,
          left,
          operator,
          right,
        };
      }
    }

    return left;
  }

  /**
   * Parses an atomic expression.
   * @returns The parsed atomic expression.
   */
  private parseAtom(): Atom | undefined {
    const token = this.consume();

    if (token.type === TokenType.VARIABLE) {
      return {
        type: NodeType.VariableReference,
        varname: token.value as string,
      };
    } else if (
      token.type === TokenType.STRING ||
      token.type === TokenType.INTEGER
    ) {
      return {
        type: NodeType.Literal,
        value: token.value,
      };
    } else {
      this.error(`unexpected token ${token.value}`);
      return undefined;
    }
  }

  /**
   * Gets the precedence of the given operator.
   * @param tokenType - The token type representing the operator.
   * @returns The precedence of the operator.
   */
  private getOperatorPrecedence(tokenType: TokenType): number {
    switch (tokenType) {
      case TokenType.PLUS:
      case TokenType.MINUS:
        return 1;
      case TokenType.MULTIPLY:
      case TokenType.DIVISION:
        return 2;
      default:
        return 0;
    }
  }

  /**
   * Parses a list of expressions.
   * @returns An array of parsed expressions.
   */
  private parseExpressionList(): Expression[] {
    const expressions: Expression[] = [];

    while (
      this.currentIndex < this.tokens.length &&
      this.peek().type !== TokenType.EOL
    ) {
      const expression = this.parseExpression();
      if (expression) {
        expressions.push(expression);
      }

      if (
        this.currentIndex < this.tokens.length &&
        this.peek().type === TokenType.COMMA
      ) {
        this.consume(); // Consume the separator (e.g., comma)
      } else {
        break; // Exit the loop if no more expressions
      }
    }

    return expressions;
  }

  /**
   * Parses the input tokens and returns an array of statements.
   * @returns An array of parsed statements.
   */
  parse(): Statement[] {
    const statements: Statement[] = [];

    while (this.currentIndex < this.tokens.length) {
      const token = this.peek();

      if (token.type === TokenType.VARIABLE) {
        const varname = this.consume().value as string;
        this.consume(); // Consume the '='
        const expression = this.parseExpression();
        if (expression) {
          statements.push({
            type: NodeType.AssignmentStatement,
            varname,
            value: expression,
          });
        }
      } else if (token.type === TokenType.PRINT) {
        this.consume(); // Consume the 'PRINT' token
        const expressions = this.parseExpressionList();
        statements.push({
          type: NodeType.PrintStatement,
          expressions,
        });
      } else if (token.type === TokenType.UNSUPPORTED) {
        statements.push({
          type: NodeType.Unsupported,
          value: token.value,
        });
        this.consume(); // Consume the unsupported token
      } else if (token.type === TokenType.EOL) {
        this.consume(); // Consume well-placed end of line / statement separator tokens
      } else {
        this.error(`unexpected token ${token.value}`);
      }
    }

    return statements;
  }
}
