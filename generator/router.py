"""Simple URL router without Flask."""

import re
from typing import Dict, Tuple, Optional, Callable, Any
import logging

logger = logging.getLogger(__name__)


class Router:
    """Simple router for mapping URL patterns to handlers."""
    
    def __init__(self):
        """Initialize empty router."""
        self.routes = []  # List of (pattern, regex, handler, converters)
        self.named_routes = {}  # Map of endpoint names to patterns
    
    def add_route(self, pattern: str, handler: Callable, endpoint: str = None):
        """Add a route pattern with its handler.
        
        Args:
            pattern: URL pattern like '/page/<path:slug>' or '/item/<int:id>'
            handler: Function to handle this route
            endpoint: Optional name for this route (for url_for)
        """
        # Convert Flask-style pattern to regex
        regex_pattern, converters = self._pattern_to_regex(pattern)
        compiled = re.compile(regex_pattern)
        
        self.routes.append((pattern, compiled, handler, converters))
        
        if endpoint:
            self.named_routes[endpoint] = pattern
        elif hasattr(handler, '__name__'):
            self.named_routes[handler.__name__] = pattern
        
        logger.debug(f"Added route: {pattern} -> {handler}")
    
    def _pattern_to_regex(self, pattern: str) -> Tuple[str, Dict[str, Callable]]:
        """Convert Flask-style URL pattern to regex.
        
        Args:
            pattern: URL pattern like '/page/<path:slug>'
            
        Returns:
            Tuple of (regex_pattern, converters_dict)
        """
        converters = {}
        regex = pattern
        
        # Match <converter:name> or <name> patterns
        param_pattern = re.compile(r'<(?:([^:>]+):)?([^>]+)>')
        
        def replace_param(match):
            converter = match.group(1) or 'string'
            name = match.group(2)
            
            # Define converter patterns and functions
            if converter == 'path':
                converters[name] = str
                return f'(?P<{name}>.+)'  # Match everything including slashes
            elif converter == 'int':
                converters[name] = int
                return f'(?P<{name}>\\d+)'
            else:  # string or default
                converters[name] = str
                return f'(?P<{name}>[^/]+)'  # Match everything except slashes
        
        regex = param_pattern.sub(replace_param, regex)
        # Anchor the pattern
        regex = f'^{regex}$'
        
        return regex, converters
    
    def match(self, path: str) -> Tuple[Optional[Callable], Optional[Dict[str, Any]]]:
        """Match a URL path to its handler and extract parameters.
        
        Args:
            path: URL path to match
            
        Returns:
            Tuple of (handler, params_dict) or (None, None) if no match
        """
        for pattern, regex, handler, converters in self.routes:
            match = regex.match(path)
            if match:
                # Convert parameters using converters
                params = {}
                for name, value in match.groupdict().items():
                    if name in converters:
                        try:
                            params[name] = converters[name](value)
                        except ValueError:
                            continue  # Skip this route if conversion fails
                    else:
                        params[name] = value
                
                logger.debug(f"Matched {path} to {pattern} with params {params}")
                return handler, params
        
        logger.debug(f"No match found for {path}")
        return None, None
    
    def url_for(self, endpoint: str, **kwargs) -> str:
        """Generate URL for an endpoint.
        
        Args:
            endpoint: Name of the endpoint
            **kwargs: Parameters to fill in the URL pattern
            
        Returns:
            Generated URL string
        """
        if endpoint not in self.named_routes:
            # Try common patterns
            if endpoint == 'static':
                filename = kwargs.get('filename', '')
                return f"/static/{filename}"
            logger.warning(f"Unknown endpoint: {endpoint}")
            return '/'
        
        pattern = self.named_routes[endpoint]
        url = pattern
        
        # Replace parameters in pattern
        param_pattern = re.compile(r'<(?:[^:>]+:)?([^>]+)>')
        
        def replace_param(match):
            name = match.group(1)
            if name in kwargs:
                return str(kwargs[name])
            logger.warning(f"Missing parameter {name} for endpoint {endpoint}")
            return match.group(0)
        
        url = param_pattern.sub(replace_param, url)
        return url
    
    def get_all_routes(self) -> list:
        """Get all registered routes.
        
        Returns:
            List of (pattern, handler) tuples
        """
        return [(pattern, handler) for pattern, _, handler, _ in self.routes]