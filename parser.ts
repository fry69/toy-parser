// Lexer
enum TokenType {
    VARIABLE,
    EQUAL,
    STRING,
    PRINT,
    EOL,
  }
  
  interface Token {
    type: TokenType;
    value: string;
  }
  
  function lex(input: string): Token[] {
    const tokens: Token[] = [];
    let position = 0;
  
    while (position < input.length) {
      const char = input[position];
  
      if (char === '$') {
        position++;
        if (position >= input.length || !input[position].match(/[a-zA-Z_]/)) {
          throw new Error(`Expected variable name after '$' at index ${position}`);
        }
        let variableName = input[position];
        while (position + 1 < input.length && input[position + 1].match(/[a-zA-Z_]/)) {
          variableName += input[++position];
        }
        tokens.push({ type: TokenType.VARIABLE, value: variableName });
      } else if (char === '=') {
        tokens.push({ type: TokenType.EQUAL, value: '=' });
      } else if (char === '"') {
        let value = '';
        position++;
        while (position < input.length && input[position] !== '"') {
          value += input[position++];
        }
        tokens.push({ type: TokenType.STRING, value });
      } else if (char === 'P') {
        if (input.slice(position, position + 5) === 'PRINT') {
          tokens.push({ type: TokenType.PRINT, value: 'PRINT' });
          position += 4;
        } else {
          throw new Error(`Unexpected token at index ${position}`);
        }
      } else if (char === ';' || char === '\n') {
        tokens.push({ type: TokenType.EOL, value: char });
      } else if (char === ' ' || char === '\t') {
        // Ignore whitespace
      } else if (char.match(/[a-zA-Z_]/)) {
        throw new Error(`Unexpected token '${char}' at index ${position}, variable names must start with '$'`);
      } else {
        throw new Error(`Unexpected token at index ${position}`);
      }
  
      position++;
    }
  
    return tokens;
  }
  
  // Parser
  interface VariableDefinition {
    name: string;
    value: string;
  }
  
  interface PrintStatement {
    variable: string;
  }
  
  type Statement = VariableDefinition | PrintStatement;
  
  function parse(tokens: Token[]): Statement[] {
    const statements: Statement[] = [];
    let position = 0;
  
    while (position < tokens.length) {
      const token = tokens[position];
  
      if (token.type === TokenType.VARIABLE) {
        const variableName = token.value;
        position++;
        if (tokens[position].type !== TokenType.EQUAL) {
          throw new Error(`Expected '=' after variable name '${variableName}'`);
        }
        position++;
        if (tokens[position].type !== TokenType.STRING) {
          throw new Error(`Expected string value after '=' for variable '${variableName}'`);
        }
        const variableValue = tokens[position].value;
        statements.push({ name: variableName, value: variableValue });
        position++;
      } else if (token.type === TokenType.PRINT) {
        position++;
        if (tokens[position].type !== TokenType.VARIABLE) {
          throw new Error(`Expected '$' before variable name after 'PRINT'`);
        }
        const variableName = tokens[position].value;
        statements.push({ variable: variableName });
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
  function interpret(statements: Statement[]): void {
    const variables: { [key: string]: string } = {};
  
    for (const statement of statements) {
      if ('name' in statement) {
        variables[statement.name] = statement.value;
      } else {
        const value = variables[statement.variable];
        if (value === undefined) {
          throw new Error(`Variable '${statement.variable}' is not defined`);
        }
        console.log(value);
      }
    }
  }
  
  // Example usage
  const program = `
  $test_var = "Hello World!"
  PRINT $test_var

  ;;;
  $a = "This"; $b = "and that";
  PRINT $a; PRINT $b;
  `;
  
  const tokens = lex(program);
  const statements = parse(tokens);
  interpret(statements);