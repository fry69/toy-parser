/***************************************************************************
 *
 * Utility section
 *
 ***************************************************************************/

/**
 *
 * ErrorMessage class
 *
 * Centralize error message generation and prepend their origin to the message
 */
class ErrorMessage {
  /**
   * Throws an error with the origin class name prepended
   * @param message {string} - Error message
   */
  protected error(message: string): void {
    const errorMessage = `${this.constructor.name}: ${message}`;
    console.error(errorMessage);
    // throw new Error(errorMessage);
  }
}

/***************************************************************************
 *
 * Lexer section
 *
 ***************************************************************************/

/**
 * Represents the different types of tokens that can be recognized by the lexer.
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

/**
 * Represents a single token, consisting of a type and a value.
 */
interface Token {
  type: TokenType;
  value: string | number;
}

/**
 *
 * Lexer class
 *
 * Lexes the input string and returns an array of tokens.
 */
class Lexer extends ErrorMessage {
  private input: string;
  private position: number;
  private tokens: Token[];

  /**
   * Constructs a new Lexer instance with the string as input
   * @param input - The input string to be lexed.
   */
  constructor(input: string) {
    super();
    this.input = input;
    this.position = 0;
    this.tokens = [];
  }

  /**
   * Lexes the input string and returns an array of tokens.
   * @returns An array of tokens.
   */
  lex(): Token[] {
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      switch (char) {
        case " ":
        case "\t":
          // Ignore whitespace
          break;
        case "=":
          this.tokens.push({ type: TokenType.EQUAL, value: char });
          break;
        case "+":
          this.tokens.push({ type: TokenType.PLUS, value: char });
          break;
        case "-":
          this.tokens.push({ type: TokenType.MINUS, value: char });
          break;
        case "*":
          this.tokens.push({ type: TokenType.MULTIPLY, value: char });
          break;
        case "/":
          this.tokens.push({ type: TokenType.DIVISION, value: char });
          break;
        case ",":
          this.tokens.push({ type: TokenType.COMMA, value: char });
          break;
        case ";":
        case "\n":
          this.tokens.push({ type: TokenType.EOL, value: char });
          break;
        case "P":
          // PRINT statement
          if (this.input.slice(this.position, this.position + 5) === "PRINT") {
            this.tokens.push({ type: TokenType.PRINT, value: "PRINT" });
            this.position += 4;
          } else {
            this.error(`unexpected symbol '${char}' at index ${this.position}`);
          }
          break;
        case "$":
          // Variable reference
          this.position++;
          if (
            this.position >= this.input.length ||
            !this.input[this.position].match(/[a-zA-Z_]/)
          ) {
            this.error(
              `expected variable name after '$' at index ${this.position}`
            );
          }
          let variableName = this.input[this.position];
          while (
            this.position + 1 < this.input.length &&
            this.input[this.position + 1].match(/[a-zA-Z_]/)
          ) {
            variableName += this.input[++this.position];
          }
          this.tokens.push({ type: TokenType.VARIABLE, value: variableName });
          break;
        case '"':
          // String
          let string = "";
          this.position++;
          while (
            this.position < this.input.length &&
            this.input[this.position] !== '"'
          ) {
            if (this.input[this.position] === "\\") {
              this.position++; // skip backslash and copy the next symbol verbatim
            }
            string += this.input[this.position++];
          }
          this.tokens.push({ type: TokenType.STRING, value: string });
          break;
        case char.match(/[0-9]/)?.input:
          // Integer digits
          let integerString = char;
          this.position++; // remember to move back again, as the position gets advanced at the end of the loop
          while (
            this.position < this.input.length &&
            this.input[this.position].match(/[0-9]/)
          ) {
            integerString += this.input[this.position++];
          }
          this.position--; // thank goodness we remembered to move back again and not consume the next character
          this.tokens.push({
            type: TokenType.INTEGER,
            value: parseInt(integerString, 10),
          });
          break;
        default:
          this.error(`unexpected symbol '${char}' at index ${this.position}`);
      }

      this.position++;
    }

    return this.tokens;
  }
}

/***************************************************************************
 *
 * Parser section
 *
 ***************************************************************************/

/**
 * Represents the different types of parser nodes.
 */
enum NodeType {
  AssignmentStatement = "Assignemnt",
  PrintStatement = "Print",
  BinaryExpression = "Operation",
  VariableReference = "Variable",
  Literal = "Literal",
}

/**
 * Represents a binary operation.
 */
type Operation = "+" | "-" | "*" | "/";

/**
 * Represents a statement in the language.
 */
type Statement = AssignmentStatement | PrintStatement;

/**
 * Represents an expression in the language.
 */
type Expression = VariableReference | BinaryExpression | Literal;

/**
 * Represents an atomic expression in the language.
 */
type Atom = VariableReference | Literal;

/**
 * Represents an assignment statement.
 */
interface AssignmentStatement {
  type: NodeType.AssignmentStatement;
  varname: string;
  value: Expression;
}

/**
 * Represents a print statement.
 */
interface PrintStatement {
  type: NodeType.PrintStatement;
  expressions: Expression[];
}

/**
 * Represents a binary expression.
 */
interface BinaryExpression {
  type: NodeType.BinaryExpression;
  left: Expression;
  operator: Operation;
  right: Expression;
}

/**
 * Represents a variable reference.
 */
interface VariableReference {
  type: NodeType.VariableReference;
  varname: string;
}

/**
 * Represents a literal value.
 */
interface Literal {
  type: NodeType.Literal;
  value: string | number;
}

/**
 *
 * Parser class
 *
 * Parses the input tokens and constructs an abstract syntax tree (AST).
 */
class Parser extends ErrorMessage {
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
    if (this.currentIndex + 1 < tokens.length) {
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
      } else if (token.type === TokenType.EOL) {
        this.consume(); // Consume well-placed end of line / statement separator tokens
      } else {
        this.error(`unexpected token ${token.value}`);
      }
    }

    return statements;
  }
}

/***************************************************************************
 *
 * Interpreter section
 *
 ***************************************************************************/

/**
 * Represents a store for variables.
 */
type VariableStore = Map<string, string | number>;

/**
 *
 * Parser class
 *
 * Interprets the given statement nodes and updates the variable store accordingly.
 */
class Interpreter extends ErrorMessage {
  private variables: VariableStore;
  private statements: Statement[] = [];

  constructor(statements: Statement[]) {
    super();
    this.variables = new Map();
    this.statements = statements;
  }

  /**
   * Evaluates the given expression using the provided variable store.
   * @param expr - The expression to be evaluated.
   * @param variables - The variable store to use during evaluation.
   * @returns The result of the expression evaluation.
   */
  evaluateExpression(expr: Expression): number | string | undefined {
    switch (expr.type) {
      case NodeType.VariableReference:
        if (!this.variables.has(expr.varname)) {
          this.error(`variable '${expr.varname}' is not defined`);
        }
        return this.variables.get(expr.varname);
      case NodeType.Literal:
        return expr.value;
      case NodeType.BinaryExpression:
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);
        if (typeof left !== "number" || typeof right !== "number") {
          this.error("operands must be numbers");
          break;
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

  /**
   * Interprets the given statement nodes and updates the variable store accordingly.
   * @param statements - The statement nodes to be interpreted.
   */
  interpret(): void {
    for (const statement of this.statements) {
      switch (statement.type) {
        case NodeType.AssignmentStatement:
          const result = this.evaluateExpression(statement.value);
          if (result) {
            this.variables.set(statement.varname, result);
          } else {
            this.error("error evaluating expression");
          }
          break;
        case NodeType.PrintStatement:
          const values = statement.expressions
            .map((expr) => this.evaluateExpression(expr))
            .filter((value) => value !== undefined);
          console.log(values.join(" "));
          break;
        default:
          this.error(`unsupported statement: ${(statement as any).type}`);
      }
    }
  }
}

/***************************************************************************
 *
 * Main section (entry point)
 *
 ***************************************************************************/

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
