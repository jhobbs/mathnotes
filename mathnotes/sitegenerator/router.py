"""Simple URL router for static site generation."""

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

    def add_route(self, pattern: str, handler: Callable, endpoint: str):
        """Add a route pattern with its handler.

        Args:
            pattern: URL pattern like '/page/<path:slug>' or '/item/<int:id>'
            handler: Function to handle this route
            endpoint: Optional name for this route (for url_for)
        """
        # Convert URL pattern to regex
        regex_pattern, converters = self._pattern_to_regex(pattern)
        compiled = re.compile(regex_pattern)

        self.routes.append((pattern, compiled, handler, converters))
        self.named_routes[endpoint] = pattern

        logger.debug(f"Added route: {pattern} -> {handler}")

    def _pattern_to_regex(self, pattern: str) -> Tuple[str, Dict[str, Callable]]:
        """Convert URL pattern to regex.

        Args:
            pattern: URL pattern like '/page/<path:slug>'

        Returns:
            Tuple of (regex_pattern, converters_dict)
        """
        converters = {}
        regex = pattern

        # Match <converter:name> or <name> patterns
        param_pattern = re.compile(r"<(?:([^:>]+):)?([^>]+)>")

        def replace_param(match):
            converter = match.group(1) or "string"
            name = match.group(2)

            converters[name] = str
            return f"(?P<{name}>.+)"  # Match everything including slashes

        regex = param_pattern.sub(replace_param, regex)
        # Anchor the pattern
        regex = f"^{regex}$"

        return regex, converters
