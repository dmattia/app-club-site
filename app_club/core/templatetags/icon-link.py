# A link with a icon on the left side, a title that links to somewhere,
# and a description.
"""
  _______
 |       |     TITLE WITH UNDERLINE
 |       |     description line 1
 |       |     description continued
  _______

"""
from django import template

register = template.Library()

@register.inclusion_tag('core/icon_link.html')
def icon_link(*args, **kwargs):
  """ Provides context as a python dictionary into the template
  """
  return kwargs
