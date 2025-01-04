# Success case
return {
    'error': False,
    'success': True,
    'output': 'Hello World'
}

# Error case
return {
    'error': True,
    'success': False, 
    'output': 'SyntaxError: invalid syntax'
}

# Incorrect output case
return {
    'error': False,
    'success': False,
    'output': 'Incorrect result' 
}