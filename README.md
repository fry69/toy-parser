# Toy Parser

"My first recursive descent parser"

This lexer/parser/interpreter implements a dead simple toy language, which consists only of two different statements:

1. Variable defintion

```
$var_name = "String"
$other_var = 1234
```

2. Print statement

```
PRINT $var_name, $other_var, "String with \"escaped\" text", 23 - 5
```

Statements get separated either with a newline (`\n`) or a semicolon (`;`). Rudimentary arithmetic operations are implemented for test purposes (e.g. operator precedence).

## Formal defintion

EBNF-like description of the toy language:

```ebnf
program = { statement };

statement = assignment_statement | print_statement | comment;

assignment_statement = variable "=" expression SEPARATOR;

print_statement = "PRINT" expression_list SEPARATOR;

comment = "%" { character } EOL;

expression_list = expression { "," expression };

expression = binary_expression | atom;

binary_expression = atom { ("+" | "-" | "*" | "/") expression };

atom = variable | literal;

variable = "$" (ALPHA | "_") { ALPHA | "_" };

literal = STRING | INTEGER;

STRING = '"' { character } '"';
character = ALPHA | DIGIT | " " | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "(" | ")" | "-" | "_" | "=" | "+" | "[" | "]" | "{" | "}" | ";" | ":" | "'" | "<" | ">" | "," | "." | "?" | "/" | "|" | "\\" | '\"';

INTEGER = DIGIT { DIGIT };

ALPHA = "a" | "b" | ... | "z" | "A" | "B" | ... | "Z";
DIGIT = "0" | "1" | ... | "9";

EOL = "\n";

SEPARATOR = ";" | EOL;
```
## Usage

```bash
bun run src/main.ts
```

This will output the parsed abstract syntax tree of the included example program, followed by the result of the evaluated `PRINT` statements.

## Testing

Test cases for the lexer, parser and interpreter modules can be run with:

```bash
bun test
```

## Disclaimer

I have not read the [Dragon Book](https://suif.stanford.edu/dragonbook/), I barely know what I am doing.