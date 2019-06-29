<?php
    $str = "@#@sfsa";
    $r = preg_match("/^[\w]+$/", $str);

echo $r; // 1 = true   0 = false no match

/*
Simple regex

Regex quick reference
[abc]     A single character: a, b or c
[^abc]     Any single character but a, b, or c
[a-z]     Any single character in the range a-z
[a-zA-Z]     Any single character in the range a-z or A-Z
^     Start of line
$     End of line
\A     Start of string
\z     End of string
.     Any single character
\s     Any whitespace character
\S     Any non-whitespace character
\d     Any digit
\D     Any non-digit
\w     Any word character (letter, number, underscore)
\W     Any non-word character (negation of \w)
\b     Any word boundary character (ex: '\ba' --> any word that starts with 'a', 'a\b' --> any word that ends with 'a',
                                        '\bali\b' --> exact word "ali" is found)
\B     negation of \b (ex: '\Ba' --> any word that doesn't start with 'a', 'a\B' --> any word that doesn't end with 'a')
(...)     Capture everything enclosed
(a|b)     a or b
a?     Zero or one of a
a*     Zero or more of a
a+     One or more of a
a{3}     Exactly 3 of a
a{3,}     3 or more of a
a{3,6}     Between 3 and 6 of a  (3 or 4 or 5)

options: 
i - case insensitive 
m - make dot match newlines 
x - ignore whitespace in regex 
o - perform #{...}
substitutions only once
*/
?>