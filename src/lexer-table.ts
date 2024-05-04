import { type Token, TokenType } from "./types.d";
import { ErrorMessage } from "./utils";

/**
 * Represents a lexer rule, which defines how to match and process a token.
 */
interface LexerRule {
  /**
   * The regular expression pattern to match the token.
   */
  pattern: RegExp;
  /**
   * The type of the token.
   */
  tokenType: TokenType;
  /**
   * Indicates whether the token should be skipped and not added to the token list.
   */
  skipToken?: boolean;
  /**
   * Indicates whether the next symbol should be skipped after the token is matched.
   */
  skipNextSymbol?: boolean;
  /**
   * Indicates whether the token value should be extracted from a specific capture group within the pattern.
   */
  innerMatch?: boolean;
  /**
   * An optional action to perform on the matched token value.
   * @param match - The matched token value.
   * @returns The processed token value.
   */
  action?: (match: string) => string | number;
}

/**
 * Represents the lexer table, which is a collection of lexer rules.
 */
export type LexerTable = LexerRule[];

/**
 * Represents a lexer, which is responsible for tokenizing an input string.
 */
export class Lexer extends ErrorMessage {
  private input: string;
  private position: number;
  private tokens: Token[];
  private rules: LexerTable;

  /**
   * Constructs a new instance of the Lexer class.
   * @param input - The input string to be tokenized.
   * @param rules - The lexer rules to be used for tokenization.
   */
  constructor(input: string, rules: LexerTable) {
    super();
    this.input = input;
    this.position = 0;
    this.tokens = [];
    this.rules = rules;
  }

  /**
   * Performs the lexical analysis on the input string and returns the list of tokens.
   * @returns The list of tokens.
   */
  lex(): Token[] {
    while (this.position < this.input.length) {
      let matched = false;
      for (const rule of this.rules) {
        const match = this.input.slice(this.position).match(rule.pattern);
        if (match) {
          let tokenValue: string | number = rule.innerMatch
            ? match[1]
            : match[0];
          if (rule.action) {
            tokenValue = rule.action(tokenValue);
          }
          if (!rule.skipToken) {
            this.tokens.push({
              type: rule.tokenType,
              value: tokenValue,
            });
          }
          this.position += match[0].length;
          if (rule.skipNextSymbol) {
            this.position++;
          }
          matched = true;
          break;
        }
      }
      if (!matched) {
        this.error(
          `unexpected symbol '${this.input[this.position]}' at index ${
            this.position
          }`
        );
      }
    }
    return this.tokens;
  }
}
