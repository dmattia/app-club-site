# A navbar with an optional focused element. Uses materializecss.
# All links are also used as mobile links with a slideout menu.
"""
Desktop:
________________________________________________________
|                                                       |
|                      Bidbyte          Link1  Link 2   |
|                                                       |
________________________________________________________

Mobile:
________________________________________________________
| ____                                                  |
| ____                 Bidbyte                          |
| ____                                                  |
________________________________________________________

"""
from django import template
from core.models import Link

register = template.Library()

@register.inclusion_tag('core/navbar.html', takes_context=True)
def navbar(context, *args, **kwargs):
  """ Provides context as a python dictionary into the template.
      Kwargs Options:
        @param focus: the li element to focus on
        @param title: The main text to be used as a logo
        @param title_ref: The url to go to after clicking on the title
        @param links: A python list of `Link` elements
        @param fixed: True if the navbar should be fixed to the top of the screen. Default: False
        @param color: The background color. Default: "green lighten-1"
  """
  kwargs.setdefault("focus", "")
  kwargs.setdefault("title", "Bidbyte")
  kwargs.setdefault("title_ref", "/")
  kwargs.setdefault("fixed", False)
  kwargs.setdefault("color", "green lighten-1")
  kwargs.setdefault("links", [])

  return {
    "logged_in": context['request'].user.is_active,
    "title": kwargs["title"],
    "title_ref": kwargs["title_ref"],
    "focus": kwargs["focus"],
    "links": kwargs["links"],
    "fixed": kwargs["fixed"],
    "color": kwargs["color"],
  }
