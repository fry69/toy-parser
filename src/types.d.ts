/**
 * Represents the different types of tokens that can be recognized by the lexer.
 */
export enum TokenType {
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
  export interface Token {
    type: TokenType;
    value: string | number;
  }
  
  /**
   * Represents the different types of parser nodes.
   */
  export enum NodeType {
    AssignmentStatement = "Assignemnt",
    PrintStatement = "Print",
    BinaryExpression = "Operation",
    VariableReference = "Variable",
    Literal = "Literal",
  }
  
  /**
   * Represents a binary operation.
   */
  export type Operation = "+" | "-" | "*" | "/";
  
  /**
   * Represents a statement in the language.
   */
  export type Statement = AssignmentStatement | PrintStatement;
  
  /**
   * Represents an expression in the language.
   */
  export type Expression = VariableReference | BinaryExpression | Literal;
  
  /**
   * Represents an atomic expression in the language.
   */
  export type Atom = VariableReference | Literal;
  
  /**
   * Represents an assignment statement.
   */
  export interface AssignmentStatement {
    type: NodeType.AssignmentStatement;
    varname: string;
    value: Expression;
  }
  
  /**
   * Represents a print statement.
   */
  export interface PrintStatement {
    type: NodeType.PrintStatement;
    expressions: Expression[];
  }
  
  /**
   * Represents a binary expression.
   */
  export interface BinaryExpression {
    type: NodeType.BinaryExpression;
    left: Expression;
    operator: Operation;
    right: Expression;
  }
  
  /**
   * Represents a variable reference.
   */
  export interface VariableReference {
    type: NodeType.VariableReference;
    varname: string;
  }
  
  /**
   * Represents a literal value.
   */
  export interface Literal {
    type: NodeType.Literal;
    value: string | number;
  }
  
  /**
   * Represents a store for variables.
   */
  export type VariableStore = Map<string, string | number>;
  