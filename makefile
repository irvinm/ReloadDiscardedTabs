xpi: 
	rm -f ./*.xpi
	zip -r -9 ReloadDiscardedTabs.xpi background-rdt.js manifest.json reload.png -x '*/.*' >/dev/null 2>/dev/null
