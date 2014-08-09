Signage
=======

Signage broadcaster built on Node.js

### Signage files
Signage files can be held locally in /public/signage or on a remote site. The files should be HTML partial files, i.e. HTML without HEAD and BODY tags as their contents are pushed to clients and injected into the clients DOM.

### Scheduling
The schedule manifest is held in the schedule.json file.

### Monitor Page
System activity is displayed in real time on the /monitor.html page.

### Multi-channel Support
Channels are defined in the schedule.json file and are accessed via the signage.html page's querystring, e.g. /signage.html?channel=noticeboard will receive broadcasts to the noticeboard channel. 
