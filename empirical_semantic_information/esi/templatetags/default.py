# This file is part of empirical_semantic_information.
#
# empirical_semantic_information is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# empirical_semantic_information is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with empirical_semantic_information. If not, see <http://www.gnu.org/licenses/>.
"""Esi Django app default templatetags."""

import types

from collections.abc import Mapping
from copy import copy
from django.template import Library
from typing import Any

register = Library()


@register.filter
def add_class(field, css_class):
    """Add a css class template filter."""
    return append_attr(field, "class:" + css_class)


@register.filter
def append_attr(field, attr):
    """Append atrribute template filter."""

    def _process_field_attributes(field, attr, process):
        # split attribute name and value from 'attr:value' string
        params = attr.split(":", 1)
        attribute = params[0]
        value = params[1] if len(params) == 2 else ""

        field = copy(field)

        # decorate field.as_widget method with updated attributes
        old_as_widget = field.as_widget

        def as_widget(self, widget=None, attrs=None, only_initial=False):
            attrs = attrs or {}
            process(widget or self.field.widget, attrs, attribute, value)
            html = old_as_widget(widget, attrs, only_initial)
            self.as_widget = old_as_widget
            return html

        field.as_widget = types.MethodType(as_widget, field)
        return field

    def process(widget, attrs, attribute, value):
        if attrs.get(attribute):
            attrs[attribute] += " " + value
        elif widget.attrs.get(attribute):
            attrs[attribute] = widget.attrs[attribute] + " " + value
        else:
            attrs[attribute] = value

    return _process_field_attributes(field, attr, process)


@register.filter
def endswith(value: Any, end: str) -> bool:
    """Endswith template filter."""
    if isinstance(value, str):
        return value.endswith(end)
    else:
        return str(value).endswith(end)


@register.filter
def get(data: Mapping, key: Any) -> Any:
    """Get element."""
    return data[key]


@register.filter
def has_attr(obj: Any, key: Any) -> bool:
    """Check if obj has an attribute."""
    return hasattr(obj, key)


@register.filter
def multiply(a: int, b: int) -> int:
    """Multiply the two given values."""
    return a * b


@register.filter
def startswith(value: Any, start: str) -> bool:
    """Startswith template filter."""
    if isinstance(value, str):
        return value.startswith(start)
    else:
        return str(value).startswith(start)


@register.filter
def substring(value: Any, sub: str) -> bool:
    """Substring template filter."""
    if isinstance(value, str):
        return sub in value
    else:
        return sub in str(value)


@register.inclusion_tag("messages.html", takes_context=True)
def messages(context: dict) -> dict:
    """Add message template tag."""
    return {"messages": context["messages"] if "messages" in context else []}
