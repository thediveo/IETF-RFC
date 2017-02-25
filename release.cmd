@echo off
rem release.cmd
rem
rem generates release files:
rem   editions\release\output\ietf-rfc.html -- the plugin demo wiki
rem   editions\release\output\ietf-rfc.tid -- the plugin tiddler
rem
tiddlywiki ^
	editions\release ^
	--verbose ^
	--build release
rem	|| exit 1
