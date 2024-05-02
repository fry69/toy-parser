// Lexer
enum TokenType {
  VARIABLE,
  EQUAL,
  STRING,
  PRINT,
  INTEGER,
  PLUS,
  MINUS,
  COMMA,
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

    if (char === "$") {
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
    } else if (char === "=") {
      tokens.push({ type: TokenType.EQUAL, value: "=" });
    } else if (char === '"') {
      let value = "";
      position++;
      while (position < input.length && input[position] !== '"') {
        if (input[position] === "\\") {
          position++;
          value += input[position++];
        } else {
          value += input[position++];
        }
      }
      tokens.push({ type: TokenType.STRING, value });
    } else if (char.match(/[0-9]/)) {
      let value = char;
      position++;
      while (position < input.length && input[position].match(/[0-9]/)) {
        value += input[position++];
      }
      tokens.push({ type: TokenType.INTEGER, value: parseInt(value, 10) });
    } else if (char === "P") {
      if (input.slice(position, position + 5) === "PRINT") {
        tokens.push({ type: TokenType.PRINT, value: "PRINT" });
        position += 4;
      } else {
        throw new Error(`Unexpected token '${char}' at index ${position}`);
      }
    } else if (char === "+") {
      tokens.push({ type: TokenType.PLUS, value: "+" });
    } else if (char === "-") {
      tokens.push({ type: TokenType.MINUS, value: "-" });
    } else if (char === ",") {
      tokens.push({ type: TokenType.COMMA, value: "," });
    } else if (char === ";" || char === "\n") {
      tokens.push({ type: TokenType.EOL, value: char });
    } else if (char === " " || char === "\t") {
      // Ignore whitespace
    } else {
      throw new Error(`Unexpected token '${char}' at index ${position}`);
    }

    position++;
  }

  return tokens;
}

// Parser
interface AssignmentStatement {
  type: "AssignmentStatement";
  varname: string;
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

type Expression = VariableReference | BinaryExpression | Literal;

type VariableReference = {
  type: "VariableReference";
  varname: string;
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
        varname: token.value as string,
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
        const varname = this.consume().value as string;
        this.consume(); // Consume the '='
        const value = this.parseExpression();
        statements.push({
          type: "AssignmentStatement",
          varname,
          value,
        });
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
        throw new Error(`Unexpected token: ${token.value}`);
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
        this.peek().type === TokenType.COMMA
      ) {
        this.consume(); // Consume the separator (e.g., comma)
      } else {
        break; // Exit the loop if no more expressions
      }
    }

    return expressions;
  }
}

// Interpreter
interface VariableStore {
  [key: string]: number | string;
}

function evaluateExpression(
  expr: Expression,
  variables: VariableStore
): number | string | undefined {
  switch (expr.type) {
    case "VariableReference":
      if (!(expr.varname in variables)) {
        throw new Error(`Variable '${expr.varname}' is not defined`);
      }
      return variables[expr.varname];
    case "Literal":
      return expr.value;
    case "BinaryExpression":
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
        // Add support for other operators
      }
  }
}

function interpret(statements: Statement[]): void {
  const variables: VariableStore = {};

  for (const statement of statements) {
    switch (statement.type) {
      case "AssignmentStatement":
        const result = evaluateExpression(statement.value, variables);
        if (result) {
          variables[statement.varname] = result;
        } else {
          throw new Error("Error evalutating expression");
        }
        break;
      case "PrintStatement":
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
  `;

const program2 = `$a = "Hi"; PRINT $a;`;

const tokens = lex(program);
const parser = new Parser(tokens);
const statements = parser.parse();
console.dir(statements, { depth: 9 });
interpret(statements);
