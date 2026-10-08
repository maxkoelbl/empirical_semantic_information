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
"""Esi Django app fontawesome templatetags."""

from django.template import Library
from django.utils.html import mark_safe

register = Library()


@register.simple_tag
def fa(icon_name: str, tag: str = "span", icon_type: str = "solid") -> str:
    """Add a Font-Awesome icon.

    Args:
     * icon_name: The icon name.
     * tag: The tag to use, defaults to `span`.
     * icon_type: The icon type, defaults to `solid`.
    """
    assert icon_type in ["solid", "regular", "light", "brands"]
    assert tag in ["span", "i"]
    if icon_name.startswith("fa-"):
        icon_name = icon_name[3:]
    return mark_safe(f'<{tag} class="fa-{icon_type} fa-{icon_name}"></{tag}>')
