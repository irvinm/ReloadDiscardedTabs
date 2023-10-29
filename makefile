xpi: 
	rm -f ./*.xpi
	zip -r -9 ReloadDiscardedTabs.xpi background-rdt.js manifest.json reload1.png reload2.png reload3.png reload4.png options.html options.js -x '*/.*' >/dev/null 2>/dev/null
