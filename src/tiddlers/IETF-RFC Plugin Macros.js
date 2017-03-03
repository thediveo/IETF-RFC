/*\
created: 20170303175204001
title: IETF-RFC Plugin Macros
tags: $:/tags/Macro
modified: 20170303180648327
type: text/vnd.tiddlywiki
\*/
\define resultbox(markup)
<div class="example">
Markup:
<$codeblock code="""$markup$"""/>
Result:
<div class="example-result">$markup$</div>
</div>
\end