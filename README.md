#Signage

##Signage broadcaster built on Node.js

Emits signage to one or many clients over one or many channels based on a timed schedule.

### Signage files
Signage files are held in the /public/signage directory. Signage should be in .png format.

### Channels
Signage is broadcast on channels and referenced via a query string on a client request url, for example a call to: */signage.html?channel=noticeboard* will receive broadcasts from the noticeboard channel. Channels allows us to target the signage appropriately.

### Scheduling
The schedule manifest is held in the schedule.json file. Each entry in the schedule holds:
* a path to the signage file
* a broadcast schedule
* a broadcast channel

For example:
```
[
    {"path":"/public/signage/item_1.png", "schedule":"0,30 * * * * *", "channel":"noticeboard"},
    {"path":"/public/signage/item_2.png", "schedule":"15,45 * * * * *", "channel":"noticeboard"},
    {"path":"/public/signage/item_3.png", "schedule":"15,45 * * * * *", "channel":"reception"},
    {"path":"/public/signage/item_4.png", "schedule":"0,30 * * * * *", "channel":"reception"}
]
```

### New Client Synchronization
The last push to any channel is recorded and is immediately pushed to a new client on joining the channel.

### Schedule format
The schedule uses an extended cron format provided by [node-cron](https://github.com/ncb000gt/node-cron). For example:
```
[
    {"path":"/public/signage/item_1.png", "schedule":"0,30 * * * * *", "channel":"noticeboard"},
]
```

Here the item_1.png file will be emitted twice every minute on the minute and the 30th second.

### Monitor Page
System activity is displayed in real time on the /monitor.html page.
