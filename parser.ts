/**
 *
 * Lexer
 *
 */

enum TokenType {
  VARIABLE,
  EQUAL,
  STRING,
  PRINT,
  INTEGER,
  PLUS,
  MINUS,
  COMMA,
  MULTIPLY,
  DIVISION,
  EOL,
}

interface Token {
  type: TokenType;
  value: string | number;
}

function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < input.length) {
    const char = input[position];

    switch (char) {
      case " ":
      case "\t":
        // Ignore whitespace
        break;
      case "=":
        tokens.push({ type: TokenType.EQUAL, value: char });
        break;
      case "+":
        tokens.push({ type: TokenType.PLUS, value: char });
        break;
      case "-":
        tokens.push({ type: TokenType.MINUS, value: char });
        break;
      case "*":
        tokens.push({ type: TokenType.MULTIPLY, value: char });
        break;
      case "/":
        tokens.push({ type: TokenType.DIVISION, value: char });
        break;
      case ",":
        tokens.push({ type: TokenType.COMMA, value: char });
        break;
      case ";":
      case "\n":
        tokens.push({ type: TokenType.EOL, value: char });
        break;
      case "P":
        if (input.slice(position, position + 5) === "PRINT") {
          tokens.push({ type: TokenType.PRINT, value: "PRINT" });
          position += 4;
        } else {
          throw new Error(`Unexpected token '${char}' at index ${position}`);
        }
        break;
      case "$":
        position++;
        if (position >= input.length || !input[position].match(/[a-zA-Z_]/)) {
          throw new Error(
            `Expected variable name after '$' at index ${position}`
          );
        }
        let variableName = input[position];
        while (
          position + 1 < input.length &&
          input[position + 1].match(/[a-zA-Z_]/)
        ) {
          variableName += input[++position];
        }
        tokens.push({ type: TokenType.VARIABLE, value: variableName });
        break;
      case '"':
        let string = "";
        position++;
        while (position < input.length && input[position] !== '"') {
          if (input[position] === "\\") {
            position++;
            string += input[position++];
          } else {
            string += input[position++];
          }
        }
        tokens.push({ type: TokenType.STRING, value: string });
        break;
      case char.match(/[0-9]/)?.input:
        let integerString = char;
        position++;
        while (position < input.length && input[position].match(/[0-9]/)) {
          integerString += input[position++];
        }
        position--;
        tokens.push({
          type: TokenType.INTEGER,
          value: parseInt(integerString, 10),
        });
        break;
      default:
        throw new Error(`Unexpected token '${char}' at index ${position}`);
    }

    position++;
  }

  return tokens;
}

/**
 *
 * Parser
 *
 */

enum ParserType {
  AssignmentStatement = "Assignemnt",
  PrintStatement = "Print" ,
  BinaryExpression = "Operation",
  VariableReference = "Variable",
  Literal = "Literal",
}

type Operation = "+" | "-" | "*" | "/";
type Statement = AssignmentStatement | PrintStatement;
type Expression = VariableReference | BinaryExpression | Literal;

interface AssignmentStatement {
  type: ParserType.AssignmentStatement;
  varname: string;
  value: Expression;
}

interface PrintStatement {
  type: ParserType.PrintStatement;
  expressions: Expression[];
}

interface BinaryExpression {
  type: ParserType.BinaryExpression;
  left: Expression;
  operator: Operation;
  right: Expression;
}

interface VariableReference {
  type: ParserType.VariableReference;
  varname: string;
};

interface Literal {
  type: ParserType.Literal;
  value: string | number;
};

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

  private parseExpression(precedence: number = 0): Expression {
    if (this.peekNext().type !== TokenType.EOL) {
      return this.parseBinaryExpression(precedence);
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

      const operator = this.consume().value as Operation;

      const right = this.parseExpression(operatorPrecedence);

      left = {
        type: ParserType.BinaryExpression,
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
        type: ParserType.VariableReference,
        varname: token.value as string,
      };
    } else if (
      token.type === TokenType.STRING ||
      token.type === TokenType.INTEGER
    ) {
      return {
        type: ParserType.Literal,
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
      case TokenType.MULTIPLY:
      case TokenType.DIVISION:
        return 2;
      default:
        return 0;
    }
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
        this.peek().type === TokenType.COMMA
      ) {
        this.consume(); // Consume the separator (e.g., comma)
      } else {
        break; // Exit the loop if no more expressions
      }
    }

    return expressions;
  }

  parse(): Statement[] {
    const statements: Statement[] = [];

    while (this.currentIndex < this.tokens.length) {
      const token = this.peek();

      if (token.type === TokenType.VARIABLE) {
        const varname = this.consume().value as string;
        this.consume(); // Consume the '='
        const value = this.parseExpression();
        statements.push({
          type: ParserType.AssignmentStatement,
          varname,
          value,
        });
      } else if (token.type === TokenType.PRINT) {
        this.consume(); // Consume the 'PRINT' token
        const expressions = this.parseExpressionList();
        statements.push({
          type: ParserType.PrintStatement,
          expressions,
        });
      } else if (token.type === TokenType.EOL) {
        this.consume();
      } else {
        throw new Error(`Unexpected token: ${token.value}`);
      }
    }

    return statements;
  }
}

/**
 *
 * Interpreter
 *
 */

type VariableStore = Map<string, string | number>;

function evaluateExpression(
  expr: Expression,
  variables: VariableStore
): number | string | undefined {
  switch (expr.type) {
    case ParserType.VariableReference:
      if (!(variables.has(expr.varname))) {
        throw new Error(`Variable '${expr.varname}' is not defined`);
      }
      return variables.get(expr.varname);
    case ParserType.Literal:
      return expr.value;
    case ParserType.BinaryExpression:
      const left = evaluateExpression(expr.left, variables);
      const right = evaluateExpression(expr.right, variables);
      if (typeof left !== "number" || typeof right !== "number") {
        throw new Error("Operands must be numbers");
      }
      switch (expr.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        // Add support for other operators
      }
  }
}

function interpret(statements: Statement[]): void {
  const variables: VariableStore = new Map();

  for (const statement of statements) {
    switch (statement.type) {
      case ParserType.AssignmentStatement:
        const result = evaluateExpression(statement.value, variables);
        if (result) {
          variables.set(statement.varname, result);
        } else {
          throw new Error("Error evalutating expression");
        }
        break;
      case ParserType.PrintStatement:
        const values = statement.expressions
          .map((expr) => evaluateExpression(expr, variables))
          .filter((value) => value !== undefined);
        console.log(values.join(" "));
        break;
      default:
        throw new Error(
          `Unsupported statement type: ${(statement as any).type}`
        );
    }
  }
}

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
  `;

const tokens = lex(program);
const parser = new Parser(tokens);
const statements = parser.parse();
console.dir(statements, { depth: 9 });
interpret(statements);
