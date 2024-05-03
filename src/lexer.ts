import { type Token, TokenType } from "./types.d";
import { ErrorMessage } from "./utils";

/**
 *
 * Lexer class
 *
 * Lexes the input string and returns an array of tokens.
 */
export class Lexer extends ErrorMessage {
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
          this.position--; // thank goodness we remembered to move back again and not skip the next symbol
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
