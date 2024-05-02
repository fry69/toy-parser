enum TokenType {
  VARIABLE,
  EQUAL,
  STRING,
  INTEGER,
  PRINT,
  PLUS,
  MINUS,
  EOL,
}

interface Token {
  type: TokenType;
  value: string | number;
}

interface AssignmentStatement {
  type: "AssignmentStatement";
  name: string;
  value: Expression;
}

interface BinaryExpression {
  type: "BinaryExpression";
  left: Expression;
  operator: "+" | "-";
  right: Expression;
}

interface PrintStatement {
  type: "PrintStatement";
  expressions: Expression[];
}

type Expression = VariableReference | Literal | BinaryExpression;
type VariableReference = {
  type: "VariableReference";
  name: string;
};
type Literal = {
  type: "Literal";
  value: string | number;
};

type Statement = AssignmentStatement | PrintStatement;

class Parser {
  private tokens: Token[];
  private currentIndex: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentIndex = 0;
  }

  private consume(): Token {
    return this.tokens[this.currentIndex++];
  }

  private peek(): Token {
    return this.tokens[this.currentIndex];
  }

  private peekNext(): Token {
    if (this.currentIndex + 1 < tokens.length) {
        return this.tokens[this.currentIndex + 1];
    } else {
        return { type: TokenType.EOL, value: "EOF" };
    }
  }

  private parseExpression(): Expression {
    if (this.peekNext().type !== TokenType.EOL) {
     return this.parseBinaryExpression();
    } 
    return this.parseAtom();
  }

  private parseBinaryExpression(precedence: number = 0): Expression {
    let left = this.parseAtom();

    while (this.currentIndex < this.tokens.length) {
      const token = this.peek();
      const operatorPrecedence = this.getOperatorPrecedence(token.type);

      if (operatorPrecedence <= precedence) {
        break;
      }

      const operator = this.consume().value as "+" | "-";

      const right = this.parseBinaryExpression(operatorPrecedence);

      left = {
        type: "BinaryExpression",
        left,
        operator,
        right,
      };
    }

    return left;
  }

  private parseAtom(): Expression {
    const token = this.consume();

    if (token.type === TokenType.VARIABLE) {
      return {
        type: "VariableReference",
        name: token.value as string,
      };
    } else if (
      token.type === TokenType.STRING ||
      token.type === TokenType.INTEGER
    ) {
      return {
        type: "Literal",
        value: token.value,
      };
    } else {
      throw new Error(`Unexpected token: ${token.value}`);
    }
  }

  private getOperatorPrecedence(tokenType: TokenType): number {
    switch (tokenType) {
      case TokenType.PLUS:
      case TokenType.MINUS:
        return 1;
      default:
        return 0;
    }
  }

  parse(): Statement[] {
    const statements: Statement[] = [];

    while (this.currentIndex < this.tokens.length) {
      const token = this.peek();

      if (token.type === TokenType.VARIABLE) {
        const varname = token.value;
        this.consume();

        if (this.peek().type === TokenType.EQUAL) {
          this.consume(); // Consume the '='
          const right = this.parseExpression();
          statements.push({
            type: "AssignmentStatement",
            name: varname as string,
            value: right,
          });
        } else {
          throw new Error("Expected assignment statement");
        }
      } else if (token.type === TokenType.PRINT) {
        this.consume(); // Consume the 'PRINT' token
        const expressions = this.parseExpressionList();
        statements.push({
          type: "PrintStatement",
          expressions,
        });
      } else if (token.type === TokenType.EOL) {
        this.consume();
      } else {
        console.dir(statements);
        throw new Error(`Unexpected token: ${token}`);
      }
    }

    return statements;
  }

  private parseExpressionList(): Expression[] {
    const expressions: Expression[] = [];

    while (
      this.currentIndex < this.tokens.length &&
      this.peek().type !== TokenType.EOL
    ) {
      expressions.push(this.parseExpression());

      if (
        this.currentIndex < this.tokens.length &&
        this.peek().type !== TokenType.EOL
      ) {
        this.consume(); // Consume the separator (e.g., comma)
      }
    }

    return expressions;
  }
}

// Example usage
const tokens: Token[] = [
  { type: TokenType.VARIABLE, value: "a" },
  { type: TokenType.EQUAL, value: "=" },
  { type: TokenType.INTEGER, value: 10 },
  { type: TokenType.EOL, value: ";" },
  { type: TokenType.VARIABLE, value: "b" },
  { type: TokenType.EQUAL, value: "=" },
  { type: TokenType.VARIABLE, value: "a" },
  { type: TokenType.PLUS, value: "+" },
  { type: TokenType.INTEGER, value: 5 },
  { type: TokenType.EOL, value: ";" },
  { type: TokenType.PRINT, value: "PRINT" },
  { type: TokenType.VARIABLE, value: "a" },
  { type: TokenType.VARIABLE, value: "b" },
  { type: TokenType.EOL, value: ";" },
];

const parser = new Parser(tokens);
const statements = parser.parse();
console.dir(statements, {depth: 9});
