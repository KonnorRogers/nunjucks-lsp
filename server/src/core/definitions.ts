
/**
 * https://mozilla.github.io/nunjucks/templating.html#tags
 */
export const tags = {
  if: {
    syntax: "{% if $1 %}\n  $2\n{% endif %}",
    summary: "if tests a condition and lets you selectively display content. It behaves exactly as javascript's if behaves."
  },
  for: {
    syntax: "{% for $1 in $2 %}\n  $3\n{% endfor %}",
    summary: "for iterates over arrays and dictionaries."
  },
  asyncEach: {
    syntax: "{% asyncEach $1 in $2 %}\n  $3\n{% endeach %}",
    summary: "asyncEach is an asynchronous version of for. You only need this if you are using a custom template loader that is asynchronous; otherwise you will never need it"
  },
  asyncAll: {
    syntax: "{% asyncAll $1 in $2 %}\n  $3{% endall %}",
    summary: "asyncAll is similar to asyncEach, except it renders all the items in parallel, preserving the order of the items. This is only helpful if you are using asynchronous filters, extensions, or loaders. Otherwise you should never use this."
  },
  macro: {
    syntax: "{% macro $1 %}\n  $2\n{% endmacro %}",
    summary: "macro allows you to define reusable chunks of content. It is similar to a function in a programming language."
  },
  set: {
    syntax: "{% set $1 = $2 %}",
    summary: "set lets you create/modify a variable."
  },
  extends: {
    syntax: "{% extends $1 %}",
    summary: "extends is used to specify template inheritance. The specified template is used as a base template."
  },
  block: {
    syntax: "{% block $1 %}\n  $2\n{% endblock %}",
    summary: "block defines a section on the template and identifies it with a name. This is used by template inheritance. Base templates can specify blocks and child templates can override them with new content"
  },
  include: {
    syntax: "{% include $1 %}",
    summary: "include pulls in other templates in place. It's useful when you need to share smaller chunks across several templates that already inherit other templates."
  },
  import: {
    syntax: "import $1 as $2",
    summary: `import loads a different template and allows you to access its exported values. Macros and top-level assignments (done with set) are exported from templates, allowing you to access them in a different template.

Imported templates are processed without the current context by default, so they do not have access to any of the current template variables.`
  },
  raw: {
    syntax: "{% raw %}\n  $2\n{% endraw %}",
    summary: "If you want to output any of the special Nunjucks tags like {{, you can use a {{, you can use a {% raw %} block and anything inside of it will be output as plain text."
  },
  verbatim: {
    syntax: "{% verbatim %}\n  $1\n{% endverbatim %}",
    summary: "{% verbatim %} has identical behavior as {% raw %}. It is added for compatibility with the Twig verbatim tag."
  },
  filter: {
    syntax: "{% filter $1 %}\n  $2\n{% endfilter %}",
    summary: "A filter block allows you to call a filter with the contents of the block. Instead passing a value with the | syntax, the render contents from the block will be passed."
  },
  call: {
    syntax: "{% call $1 %}\n  $2\n{% endcall %}",
    summary: "A call block enables you to call a macro with all the text inside the tag. This is helpful if you want to pass a lot of content into a macro. The content is available inside the macro as caller()."
  }
}

export const globalFunctions = {
  range: {
    // syntax: "{% for i in range($1) -%}\n  $2\n{% endfor %}",
    summary: "If you need to iterate over a fixed set of numbers, range generates the set for you. The numbers begin at start (default 0) and increment by step (default 1) until it reaches stop, not including it."
  },
  cycler: {
    summary: "An easy way to rotate through several values is to use cycler, which takes any number of arguments and cycles through them."
  },
  joiner: {
    summary: `When combining multiple items, it's common to want to delimit them with something like a comma, but you don't want to output the separator for the first item. The joiner class will output separator (default ",") whenever it is called except for the first time.`
  }
}

export const filters = {
  abs: {
    summary: "Return the absolute value of the argument"
  },
  batch: {
    summary: "Return a list of lists with the given number of items"
  },
  capitalize: {
    summary: "Make the first letter uppercase, the rest lower case"
  },
  center: {
    summary: "Center the value in a field of a given width"
  },
  default: {
    summary: `If value is strictly undefined, return default, otherwise value. If boolean is true, any JavaScript falsy value will return default (false, "", etc)`
  },
  dictsort: {
    summary: "Sort a dict and yield (key, value) pairs"
  },
  dump: {
    summary: "Call JSON.stringify on an object and dump the result into the template. Useful for debugging: {{ items | dump }}"
  },
  escape: {
    summary: "Convert the characters &, <, >, ‘, and ” in strings to HTML-safe sequences. Use this if you need to display text that might contain such characters in HTML. Marks return value as markup string"
  },
  first: {
    summary: "Get the first item in an array or the first letter if it's a string"
  },
  float: {
    summary: "Convert a value into a floating point number. If the conversion fails 0.0 is returned. This default can be overridden by using the first parameter."
  },
  forceescape: {
    summary: "Enforce HTML escaping. This will probably double escape variables."
  },
  groupby: {
    summary: "Group a sequence of objects by a common attribute:"
  },
  int: {
    summary: "Convert the value into an integer. If the conversion fails 0 is returned."
  },
  join: {
    summary: "Return a string which is the concatenation of the strings in a sequence"
  },
  last: {
    summary: "Get the last item in an array or the last letter if it's a string"
  },
  length: {
    summary: "Return the length of an array or string, or the number of keys in an object"
  },
  list: {
    summary: "Convert the value into a list. If it was a string the returned list will be a list of characters"
  },
  lower: {
    summary: "Convert string to all lower case"
  },
  random: {
    summary: "Select a random value from an array. (This will change everytime the page is refreshed)."
  },
  reject: {
    summary: "Filters a sequence of objects by applying a test to each object, and rejecting the objects with the test succeeding."
  },
  rejectattr: {
    summary: "Filter a sequence of objects by applying a test to the specified attribute of each object, and rejecting the objects with the test succeeding."
  },
  replace: {
    summary: "Replace one item with another. The first item is the item to be replaced, the second item is the replaced value."
  },
  reverse: {
    summary: "Reverse a string or array"
  },
  round: {
    summary: "Round a number"
  },
  safe: {
    summary: "Mark the value as safe which means that in an environment with automatic escaping enabled this variable will not be escaped."
  },
  select: {
    summary: "Filters a sequence of objects by applying a test to each object, and only selecting the objects with the test succeeding."
  },
  selectattr: {
    summary: "Filter a sequence of objects by applying a test to the specified attribute of each object, and only selecting the objects with the test succeeding."
  },
  slice: {
    summary: "Slice an iterator and return a list of lists containing those items"
  },
  sort: {
    summary: "Sort arr with JavaScript's arr.sort function. If reverse is true, result will be reversed. Sort is case-insensitive by default, but setting caseSens to true makes it case-sensitive. If attr is passed, will compare attr from each item."
  },
  striptags: {
    summary: "Analog of jinja's striptags. If preserve_linebreaks is false (default), strips SGML/XML tags and replaces adjacent whitespace with one space. If preserve_linebreaks is true, normalizes whitespace, trying to preserve original linebreaks. Use second behavior if you want to pipe {{ text | striptags(true) | escape | nl2br }}. Use default one otherwise."
  },
  sum: {
    summary: "Output the sum of items in the array"
  },
  title: {
    summary: "Make the first letter of the string uppercase"
  },
  trim: {
    summary: "Strip leading and trailing whitespace"
  },
  truncate: {
    summary: `Return a truncated copy of the string. The length is specified with the first parameter which defaults to 255. If the second parameter is true the filter will cut the text at length. Otherwise it will discard the last word. If the text was in fact truncated it will append an ellipsis sign ("..."). A different ellipsis sign than "(...)" can be specified using the third parameter.`
  },
  upper: {
    summary: "Convert the string to upper case"
  },
  urlencode: {
    summary: "Escape strings for use in URLs, using UTF-8 encoding. Accepts both dictionaries and regular strings as well as pairwise iterables."
  },
  urlize: {
    summary: "Convert URLs in plain text into clickable links"
  },
  wordcount: {
    summary: "Count and output the number of words in a string"
  },
}
