import re
from typing import List, Union

# AST Node Definitions
class ASTNode: pass

class Var(ASTNode):
    def __init__(self, name: str):
        self.name = name
    def __repr__(self):
        return f"Var({self.name!r})"

class Not(ASTNode):
    def __init__(self, expr: ASTNode):
        self.expr = expr
    def __repr__(self):
        return f"Not({self.expr!r})"

class And(ASTNode):
    def __init__(self, left: ASTNode, right: ASTNode):
        self.left = left
        self.right = right
    def __repr__(self):
        return f"And({self.left!r}, {self.right!r})"

class Or(ASTNode):
    def __init__(self, left: ASTNode, right: ASTNode):
        self.left = left
        self.right = right
    def __repr__(self):
        return f"Or({self.left!r}, {self.right!r})"

class Implies(ASTNode):
    def __init__(self, left: ASTNode, right: ASTNode):
        self.left = left
        self.right = right
    def __repr__(self):
        return f"Implies({self.left!r}, {self.right!r})"

class Biconditional(ASTNode):
    def __init__(self, left: ASTNode, right: ASTNode):
        self.left = left
        self.right = right
    def __repr__(self):
        return f"Biconditional({self.left!r}, {self.right!r})"

# Tokenizer
TOKEN_SPEC = [
    ('SKIP',      r'[ \t]+'),
    ('IDENT',     r'[A-Za-z_][A-Za-z0-9_]*'),
    ('AND',       r'&&|and\b'),
    ('OR',        r'\|\||or\b'),
    ('NOT',       r'!|not\b'),
    ('IMPLIES',   r'->|implies\b'),
    ('BICOND',    r'<->|iff\b|equiv\b'),
    ('LPAREN',    r'\('),
    ('RPAREN',    r'\)'),
]

TOKEN_REGEX = '|'.join(f'(?P<{name}>{pattern})' for name, pattern in TOKEN_SPEC)
TOKEN_RE = re.compile(TOKEN_REGEX, re.IGNORECASE)

class Token:
    def __init__(self, type_: str, value: str):
        self.type = type_
        self.value = value
    def __repr__(self):
        return f"Token({self.type}, {self.value!r})"

def tokenize(text: str) -> List[Token]:
    tokens = []
    for mo in TOKEN_RE.finditer(text):
        kind = mo.lastgroup
        value = mo.group()
        if kind == 'SKIP':
            continue
        tokens.append(Token(kind, value))
    return tokens

# Recursive Descent Parser
class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def peek(self) -> Union[Token, None]:
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def eat(self, type_: str) -> Token:
        token = self.peek()
        if token and token.type == type_:
            self.pos += 1
            return token
        raise SyntaxError(f"Expected {type_}, got {token}")

    def parse(self) -> ASTNode:
        node = self.parse_biconditional()
        if self.peek() is not None:
            raise SyntaxError(f"Unexpected token: {self.peek()}")
        return node

    # Lowest precedence: biconditional
    def parse_biconditional(self):
        node = self.parse_implies()
        while self.peek() and self.peek().type == 'BICOND':
            self.eat('BICOND')
            right = self.parse_implies()
            node = Biconditional(node, right)
        return node

    # Next: implication
    def parse_implies(self):
        node = self.parse_or()
        while self.peek() and self.peek().type == 'IMPLIES':
            self.eat('IMPLIES')
            right = self.parse_or()
            node = Implies(node, right)
        return node

    # Next: OR
    def parse_or(self):
        node = self.parse_and()
        while self.peek() and self.peek().type == 'OR':
            self.eat('OR')
            right = self.parse_and()
            node = Or(node, right)
        return node

    # Next: AND
    def parse_and(self):
        node = self.parse_not()
        while self.peek() and self.peek().type == 'AND':
            self.eat('AND')
            right = self.parse_not()
            node = And(node, right)
        return node

    # Next: NOT
    def parse_not(self):
        if self.peek() and self.peek().type == 'NOT':
            self.eat('NOT')
            expr = self.parse_not()
            return Not(expr)
        else:
            return self.parse_atom()

    # Atoms: identifiers or parenthesis
    def parse_atom(self):
        token = self.peek()
        if token is None:
            raise SyntaxError("Unexpected end of input")
        if token.type == 'IDENT':
            self.eat('IDENT')
            return Var(token.value)
        elif token.type == 'LPAREN':
            self.eat('LPAREN')
            expr = self.parse_biconditional()
            self.eat('RPAREN')
            return expr
        else:
            raise SyntaxError(f"Unexpected token: {token}")

# Expression class for evaluation
class Expression:
    def __init__(self, op, *args):
        self.op = op
        self.args = args

    def vars(self):
        if self.op == 'var':
            return {self.args[0]}
        elif self.op in {'not', 'and', 'or', 'implies', 'bicond'}:
            vars_set = set()
            for arg in self.args:
                vars_set.update(arg.vars())
            return vars_set
        else:
            raise ValueError(f"Unknown op: {self.op}")

    def eval(self, values: dict):
        if self.op == 'var':
            return values[self.args[0]]
        elif self.op == 'not':
            return not self.args[0].eval(values)
        elif self.op == 'and':
            return self.args[0].eval(values) and self.args[1].eval(values)
        elif self.op == 'or':
            return self.args[0].eval(values) or self.args[1].eval(values)
        elif self.op == 'implies':
            return (not self.args[0].eval(values)) or self.args[1].eval(values)
        elif self.op == 'bicond':
            return self.args[0].eval(values) == self.args[1].eval(values)
        else:
            raise ValueError(f"Unknown op: {self.op}")

    def __repr__(self):
        if self.op == 'var':
            return f"Expr({self.args[0]})"
        return f"Expr({self.op}, {', '.join(map(repr, self.args))})"

def ast_to_expr(ast: ASTNode) -> Expression:
    if isinstance(ast, Var):
        return Expression('var', ast.name)
    elif isinstance(ast, Not):
        return Expression('not', ast_to_expr(ast.expr))
    elif isinstance(ast, And):
        return Expression('and', ast_to_expr(ast.left), ast_to_expr(ast.right))
    elif isinstance(ast, Or):
        return Expression('or', ast_to_expr(ast.left), ast_to_expr(ast.right))
    elif isinstance(ast, Implies):
        return Expression('implies', ast_to_expr(ast.left), ast_to_expr(ast.right))
    elif isinstance(ast, Biconditional):
        return Expression('bicond', ast_to_expr(ast.left), ast_to_expr(ast.right))
    else:
        raise TypeError(f"Unknown AST node: {ast}")

# Example usage:
if __name__ == "__main__":
    expr = "a && (b || !c) -> d <-> e"
    #expr = "a"
    tokens = tokenize(expr)
    parser = Parser(tokens)
    ast = parser.parse()
    print(ast)
    # Convert AST to Expression and evaluate
    expr_obj = ast_to_expr(ast)
    print(expr_obj)
    print(expr_obj.vars())
    # Example evaluation
    #values = {'a': True}
    values = {'a': True, 'b': False, 'c': True, 'd': True, 'e': False}
    print(expr_obj.eval(values))