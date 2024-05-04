import { TokenType } from "./types.d";
import { type LexerTable } from "./lexer-table";

export const lexerRules: LexerTable = [
  { pattern: /^[\n;]/, tokenType: TokenType.EOL },
  { pattern: /^\s+/, tokenType: TokenType.WHITESPACE, skipToken: true },
  {
    pattern: /^%.*/,
    tokenType: TokenType.COMMENT,
    skipToken: true,
    // move past EOL, otherwise superfluous EOL token gets added
    skipNextSymbol: true,
  },
  { pattern: /^@\w+/, tokenType: TokenType.UNSUPPORTED },
  { pattern: /^=/, tokenType: TokenType.EQUAL },
  { pattern: /^,/, tokenType: TokenType.COMMA },
  { pattern: /^\+/, tokenType: TokenType.PLUS },
  { pattern: /^-/, tokenType: TokenType.MINUS },
  { pattern: /^\*/, tokenType: TokenType.MULTIPLY },
  { pattern: /^\//, tokenType: TokenType.DIVISION },
  { pattern: /^\$(\w+)/, tokenType: TokenType.VARIABLE, innerMatch: true },
  /// simple string matching pattern, does not allow for escaping with backslashes
  // { pattern: /^"([^"]*)"/, tokenType: TokenType.STRING, inner: true },
  {
    // allow backslashes in string to escape the next symbol
    pattern: /^"((?:[^"\\]|\\.)*)"/,
    tokenType: TokenType.STRING,
    innerMatch: true,
    // remove superfluous leftover backslashes from the string, e.g. \"that\" => "that"
    action: (string) => string.replace(/\\(["\\])/g, "$1"),
  },
  {
    pattern: /^\d+/,
    tokenType: TokenType.INTEGER,
    action: (string) => parseInt(string),
  },
  { pattern: /^PRINT/, tokenType: TokenType.PRINT },
];
