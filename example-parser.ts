// Define the grammar for a simple arithmetic expression
interface Expression {
  type: "number" | "binary-op";
  value?: number;
  operator?: string;
  left?: Expression;
  right?: Expression;
}

// Define the parser
class Parser {
  private tokens: string[];
  private currentIndex: number;

  constructor(input: string) {
    this.tokens = input.split(/\s+/);
    this.currentIndex = 0;
  }

  private consume(): string {
    return this.tokens[this.currentIndex++];
  }

  private peek(): string {
    return this.tokens[this.currentIndex];
  }

  private parseExpression(): Expression {
    return this.parseBinaryExpression();
  }

  private parseBinaryExpression(precedence: number = 0): Expression {
    let left = this.parseAtom();

    while (this.currentIndex < this.tokens.length) {
      const token = this.peek();
      const operatorPrecedence = this.getOperatorPrecedence(token);

      if (operatorPrecedence <= precedence) {
        break;
      }

      this.consume();

      const right = this.parseBinaryExpression(operatorPrecedence);

      left = {
        type: "binary-op",
        operator: token,
        left,
        right,
      };
    }

    return left;
  }

  private parseAtom(): Expression {
    const token = this.consume();

    if (!isNaN(parseFloat(token))) {
      return { type: "number", value: parseFloat(token) };
    } else {
      throw new Error(`Unexpected token: ${token}`);
    }
  }

  private getOperatorPrecedence(operator: string): number {
    switch (operator) {
      case "+":
      case "-":
        return 1;
      case "*":
      case "/":
        return 2;
      default:
        return 0;
    }
  }

  parse(): Expression {
    return this.parseExpression();
  }
}

// Example usage
const input = "2 + 3 * 4 - 1";
const parser = new Parser(input);
const result = parser.parse();
console.log(`Input: ${input}`);
console.log("Parsed tree:");
console.dir(result, { depth: 9 });

/**
 * output:
{
  type: "binary-op",
  operator: "-",
  left: {
    type: "binary-op",
    operator: "+",
    left: {
      type: "number",
      value: 2,
    },
    right: {
      type: "binary-op",
      operator: "*",
      left: {
        type: "number",
        value: 3,
      },
      right: {
        type: "number",
        value: 4,
      },
    },
  },
  right: {
    type: "number",
    value: 1,
  },
}
 */
