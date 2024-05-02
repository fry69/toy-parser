// Lexer
enum TokenType {
  VARIABLE,
  EQUAL,
  STRING,
  PRINT,
  INTEGER,
  PLUS,
  MINUS,
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

function parse(tokens: Token[]): Statement[] {
  const statements: Statement[] = [];
  let position = 0;

  while (position < tokens.length) {
    const token = tokens[position];

    if (token.type === TokenType.VARIABLE) {
      let variableName = "";
      if (typeof token.value === "string") {
        variableName = token.value;
      } else {
        throw new Error(`Invalid variable name '${token.value}'`);
      }
      position++;
      if (tokens[position].type !== TokenType.EQUAL) {
        throw new Error(`Expected '=' after variable name '${variableName}'`);
      }
      position++;
      if (tokens[position].type !== TokenType.STRING) {
        throw new Error(
          `Expected string value after '=' for variable '${variableName}'`
        );
      }
      const variableValue = tokens[position].value;
      statements.push({
        type: "AssignmentStatement",
        varname: variableName,
        value: { type: "Literal", value: variableValue },
      });
      position++;
    } else if (token.type === TokenType.PRINT) {
      position++;
      if (tokens[position].type !== TokenType.VARIABLE) {
        throw new Error(`Expected '$' before variable name after 'PRINT'`);
      }
      const variableName = tokens[position].value as string;
      statements.push({
        type: "PrintStatement",
        expressions: [{ type: "VariableReference", varname: variableName }],
      });
      position++;
    } else if (token.type === TokenType.EOL) {
      position++;
    } else {
      throw new Error(`Unexpected token '${token.value}' at index ${position}`);
    }
  }

  return statements;
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
        const values = statement.expressions.map((expr) =>
          evaluateExpression(expr, variables)
        );
        console.log(values.join(", "));
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
  $a = "This"; $b = "and \\"that\\"";
  PRINT $a; PRINT $b;

  ;;;
  PRINT 1 + 2
  `;

const tokens = lex(program);
const statements = parse(tokens);
interpret(statements);
