/*\
created: 20170225164337992
type: application/javascript
title: $:/plugins/TheDiveO/IETF-RFC/tiddlerdeserializer/rfcxml.js
tags:
modifier: TheDiveO
modified: 20170308095854263
creator: TheDiveO
module-type: tiddlerdeserializer
\*/
//
// This is an import module ("tiddler deserializer") for importing the IETF's
// RFC index, to be found at:
//   https://www.rfc-editor.org/rfc-index.xml
// Before you can import the RFC index into a TiddlyWiki using this import module,
// you need to rename the downloaded file to have the extension of ".rfcindex".
//
// The schema of the IETF RFC index can be found here:
//   https://www.rfc-editor.org/rfc-index.xsd
//
// Some notes on the RFC index schema:
// - document *identifiers* take on the following forms:
//   * RFC#### -- but will probably soon overflow to 5 digits, RFC####(#)
//   * STD####
//   * BCP####

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// When running in a browser, get the browser's DOM parser. Otherwise, such as when
// running on Node.js, use the xmldom DOM parser that is provided by the standard
// TiddlyWiki 5 plugin "xmldom".
var DOMParser = $tw.browser ? window.DOMParser : require("$:/plugins/tiddlywiki/xmldom/dom-parser").DOMParser;

// Use HTML ndash entity whenever we encounter a pseudo ASCII ndash in
// RFC data fields.
var ndash = "&#8211;";

// The (core) path where to put all the RFC index data tiddlers. Do not add a
// trailing slash "/" to this location (title).
var RFCIndexDataLocation = "$:/rfcindex";

// Tag used to identify RFC data tiddlers
var RFCDataTag = "[[RFC Data]]";

// Do not change these locations.
var RFCDataLocation = RFCIndexDataLocation + "/rfc/"

$tw.utils.registerFileType("application/x-rfc-index","utf8",".rfcindex");

// Given a document ID (in parameter docid) of an RFC, return the RFC number.
// In case the docid does not references an RFC, then the (invalid) RFC
// number 0000 is returned instead.
function parseRfcNum(docid) {
  if (docid.substring(0, 3) == "RFC") {
    return docid.substring(3);
  } else
    return "0000";
};

// Retrieve the value of a child element. If the element does not exist,
// then the default value (defValue) is returned. If the element exists
// multiple times, then only the value of its first occurence is returned.
function getElementValue(entry, elementName, defValue) {
  var el = entry.getElementsByTagName(elementName);
  if (el.length > 0) {
    // always return content of first element
    return el[0].childNodes[0].nodeValue;
  } else {
    return defValue;
  }
}

// Convenience function which tries to retrieve the value of the specified
// element, and if it succeeds, then sets a tiddler field to this element
// value.
function txfElement(entry, elementName, tid, fieldName) {
  var val = getElementValue(entry, elementName, undefined);
  if (val !== undefined) {
    tid[fieldName] = val;
  }
}

// Retrieve the abstract for an RFC document, and convert it into TW5 markup.
// The abstract consists of a sequence of paragraph (<p>) elements, but isn't(!)
// HTML markup in any way.
function getAbstract(entry) {
  var ab = entry.getElementsByTagName("abstract");
  var twmarkup = "";
  if (ab.length > 0) {
    $tw.utils.each(entry.getElementsByTagName("p"), function(p) {
      var s = p.childNodes[0].nodeValue;
      // replace pseudo ASCII en-dashes with proper TW5 wiki markup
      s = s.replace(/ - /gi, " " + ndash + " ");
      // add this paragraph using proper TW5 markup; that's
      // two line ends.
      twmarkup = twmarkup + s + "\n\n";
    });
  }
  return twmarkup;
}

// Get a list of RFC document numbers. This list will always be just the
// numbers, without any RFC token.
function getRfcList(entry, elementName) {
  var el = entry.getElementsByTagName(elementName);
  if (el.length > 0) {
    // Process the sequence of doc-id child elements; we only
    // use the first parent element and ignore any (invalid)
    // additional parent.
    var refs = el[0].getElementsByTagName("doc-id");
    var r = [];
    $tw.utils.each(refs, function(docid) {
      r.push(parseRfcNum(docid.childNodes[0].nodeValue));
    });
    return r.join(" ");
  }
  return undefined;
}

// Convenience function that retrieves an RFC document number list, and
// if this list is not empty, then creates a tiddler field with this list
// as the field value.
function txfRfcList(entry, elementName, tid, fieldName) {
  var rfclist = getRfcList(entry, elementName);
  if (rfclist !== undefined) {
    tid[fieldName] = rfclist;
  }
}

//
var monthsIndex = {
  'January':   '01',
  'February':  '02',
  'March' :    '03',
  'April':     '04',
  'May':       '05',
  'June':      '06',
  'July':      '07',
  'August':    '08',
  'September': '09',
  'October':   '10',
  'November':  '11',
  'December':  '12'
}

// Retrieve the publication date of an RFC document, and return it in
// TW5-conformant form. This convenience function properly handles the case
// where a document doesn't have a publication day, but only month and year.
// This is because not all IETF RFC documents have a known day of
// publication (especially the earlier ones).
function getRfcDate(entry) {
  var ymd = entry.getElementsByTagName("date");
  if (ymd.length > 0) {
  	var dd = getElementValue(ymd[0], "day", "00");
    var mm = getElementValue(ymd[0], "month", "00");
    if (mm !== "00") {
      mm = monthsIndex[mm];
    }
    var yyyy = getElementValue(ymd[0], "year", "1970");
    return yyyy + mm + dd;
  } else {
    return "19700101000000";
  }
}

// The RFC Index importer itself, which is a TW5 tiddler deserializer that works
// on an XML RFC index file.
exports["application/x-rfc-index"] = function(text, fields) {
  var rfcidx = new DOMParser().parseFromString(text, "text/xml");
  var results = [];
  var index = {};

  function obsoleteRFCs(list) {
    $tw.utils.each(list.split(" "), function(rfc) {
      tid = index[rfc];
      if (tid !== undefined) {
        //
      }
    });
  }

  // Iterate over all RFC entry elements in the RFC index.
  $tw.utils.each(rfcidx.getElementsByTagName("rfc-entry"), function(rfcentry) {
    // Get the RFC document ID, and extract the RFC number from it. This makes
    // some TW5 macro and filter operations easier lateron.
    var docid = getElementValue(rfcentry, "doc-id", "");
    var rfcnum = parseRfcNum(docid);

    // Get the (potentially lengthy) RFC title. Clean up some ASCII glitches
    // by guessing the intended TW5 markup.
    var rfctitle = getElementValue(rfcentry, "title", "");
    // Replace ASCII pseudo en-dashes with proper TW5 wiki markup
    rfctitle = rfctitle.replace(/ - /gi, " " + ndash + " ");

    // Get and process the abstract into TW5 markup.
    var abstract = getAbstract(rfcentry);

    // Start building the RFC data tiddler; we will lateron gradually add more
    // RFC document information before pushing the tiddler onto the import list.
    var tid = {
      "title": RFCDataLocation + rfcnum,
      "text": abstract,
      "tags": RFCDataTag,
      "rfc-title": rfctitle,
      "rfc-num": rfcnum,
      "rfc-date": getRfcDate(rfcentry)
    };
    index[rfcnum] = tid;

    txfRfcList(rfcentry, "updates", tid, "rfc-updates");
    txfRfcList(rfcentry, "updated-by", tid, "rfc-updated-by");
    txfRfcList(rfcentry, "obsoletes", tid, "rfc-obsoletes");
    txfRfcList(rfcentry, "obsoleted-by", tid, "rfc-obsoleted-by");

    txfElement(rfcentry, "current-status", tid, "rfc-current-status");
    txfElement(rfcentry, "publication-status", tid, "rfc-publication-status");
    txfElement(rfcentry, "errata-url", tid, "rfc-errata-url");

    // Finally push this RFC data tiddler into the import list.
    results.push(tid);
  });

  return results;
};

})();
