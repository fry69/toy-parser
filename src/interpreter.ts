import type { Statement, Expression, VariableStore } from './types';
import { NodeType } from "./types";
import { ErrorMessage } from './utils';

/**
 *
 * Interpreter class
 *
 * Interprets the given statement nodes and updates the variable store accordingly.
 */
export class Interpreter extends ErrorMessage {
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
