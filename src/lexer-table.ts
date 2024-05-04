import { type Token, TokenType } from "./types.d";
import { ErrorMessage } from "./utils";

interface LexerRule {
  pattern: RegExp;
  tokenType: TokenType;
  skipToken?: boolean;
  skipNextSymbol?: boolean;
  innerMatch?: boolean;
  action?: (match: string) => string | number;
}

export type LexerTable = LexerRule[];

export class Lexer extends ErrorMessage {
  private input: string;
  private position: number;
  private tokens: Token[];
  private rules: LexerTable;

  constructor(input: string, rules: LexerTable) {
    super();
    this.input = input;
    this.position = 0;
    this.tokens = [];
    this.rules = rules;
  }

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
