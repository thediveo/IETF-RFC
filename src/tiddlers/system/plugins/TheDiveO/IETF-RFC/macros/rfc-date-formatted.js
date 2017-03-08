/*\
created: 20170308102333010
type: application/javascript
title: $:/plugins/TheDiveO/IETF-RFC/macros/rfc-date-formatted
tags:
modified: 20170308104803935
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "rfc-date-formatted";

// Declare the macro parameters
exports.params = [
  { name: "date" },
  { name: "longformat", default: "DDth MMM YYYY" },
  { name: "shortformat", default: "MMM YYYY" }
];

// The body of the macro itself
exports.run = function(dmy, longformat, shortformat) {
  if (dmy.substr(-2) === "00") {
    return $tw.utils.formatDateString(
      new Date(
        parseInt(dmy.substr(0, 4)),
        parseInt(dmy.substr(4, 2)) - 1,
        1),
      shortformat);
  } else {
    return $tw.utils.formatDateString(
      new Date(
        parseInt(dmy.substr(0, 4)),
        parseInt(dmy.substr(4, 2)) - 1,
        parseInt(dmy.substr(6, 2))),
      longformat);
  }
};

})();
