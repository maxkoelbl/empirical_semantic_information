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
"""Django tasks app models module."""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class CompletionTask(models.Model):
    """Completion task model."""

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated at"))

    language = models.CharField(
        max_length=10,
        choices=settings.LANGUAGES,
        default=settings.LANGUAGE_CODE,
        verbose_name=_("Language"),
    )

    question = models.CharField(
        max_length=1024,
        verbose_name=_("Question"),
        help_text=_("Use {} to indicate the gap."),
    )

    class Meta:
        """Meta."""

        verbose_name = _("Completion task")
        verbose_name_plural = _("Completion tasks")
