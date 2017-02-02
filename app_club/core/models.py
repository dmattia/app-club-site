from __future__ import unicode_literals

from django.db import models
from django.contrib import admin

class TimeStampedModel(models.Model):
  """ Abstract base class that provides
      `created` and `modified` time fields.
  """
  created = models.DateTimeField(auto_now_add=True)
  modified = models.DateTimeField(auto_now=True)

  @property
  def has_been_modified(self):
    return self.modified != self.created

  class Meta:
    abstract = True

class TimeStampedAdmin(admin.ModelAdmin):
  readonly_fields = ('created', 'modified')

class IconLink():
  """ A Link with an icon and description
  """
  def __init__(self, icon, ref, title, description):
    self.icon = icon
    self.link = Link(title, ref)
    self.description = description

  @property
  def ref(self):
    return self.link.ref

  @property
  def title(self):
    return self.link.text

class Link():
  """ A link with a text label
  """
  def __init__(self, text, ref):
    self.text = text
    self.ref = ref
