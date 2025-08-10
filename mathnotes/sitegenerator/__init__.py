"""Static site generator."""

from .core import StaticSiteGenerator
from .router import Router
from .context import build_global_context
from .builder import SiteBuilder
from .pages import PageRegistry, Page, PageSpec

__all__ = [
    "StaticSiteGenerator",
    "Router",
    "build_global_context",
    "SiteBuilder",
    "PageRegistry",
    "Page",
    "PageSpec",
]
