/*
 * Copyright 2019 Dick Avatar
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Change Log
 *
 * 1.0.0
 * - Initial release.
 */

const VERSION = '1.0.0-RC1'

const broadcaster = cb.room_slug

// Configuration options when the bot is started
cb.settings_choices = [
    {name:'message', type:'str', label:'Message to display while cam is hidden', defaultValue:'A private show is in progress. Please check back later.'},
    {name:'viewers', type:'str', required:false, label:'A list of users with access to your private shows. Separate each user name with a single space.'}
]

let viewers = []
let message = 'A private show is in progress. Please check back later.'
let help_text = 'No help available.'
let command = '/p'

let actions = {}
actions.start = function(user, args) {
    if (cb.limitCam_isRunning()) {
        notify(user, 'A private show has already been started.')
    }
    else {
        let current_viewers = viewers.slice(0)
        if (args.length > 0) {
            current_viewers = current_viewers.concat(args)
        }
        cb.limitCam_start(msg, current_viewers)
        current_viewers.forEach( viewer => notify(viewer, 'You are now in a private show with ' + broadcaster))
        let viewer_list = current_viewers.join(', ')
        notify(broadcaster, `You are now in a private show with ${viewer_list}`)
        notify(broadcaster, `Other members will see the message "${message}"`)
        this.start = Date.now()
    }
}

actions.stop = function(user, args) {
    if (!cb.limitCam_isRunning()) {
        notify(user, "A private show is not in progress!")
        return
    }
    cb.limitCam_stop()
    let duration = new Date(Date.now() - this.start)
    let h = duration.getUTCHours()
    let m = duration.getUTCMinutes()
    let s = duration.getUTCSeconds()
    if (h < 10) h = '0' + h
    if (m < 10) m = '0' + m
    if (s < 10) s = '0' + s
    let length = h + ":" + m + ":" + s
    notify(broadcaster, `The private show has ended. Duration ${length}`)
}

actions.help = function(user, args) {
    notify(user, help_text)
}

actions.list = function(user, args) {
    notify(user, `The following members can view your private shows: ${viewers.join(', ')}`)
}

actions.clear = function(user, args) {
    viewers.length = 0
    cb.limitCam_removeAllUsers()
    notify(user, 'Cleared the viewers list.  No one can view your private shows.')
}

actions.add = function(user, args) {
    if (args.length === 0) {
        notify(user, `No user names provided. Type "${command} help" for usage instructions `)
        return
    }
    let added = []
    while (args.length > 0) {
        let viewer = args.shift()
        if (viewers.includes(viewer)) {
            notify(user, `${viewer} already has access to your private shows.`)
        }
        else {
            viewers.push(viewer)
            added.push(viewer)
        }
    }
    if (added.length === 0) {
        notify(user, 'No new members added to the viewers list.')
    }
    else {
        cb.limitCam_addUsers(added)
        notify(user, `The following member can now view your private show: ${added.join(', ')}`)
    }
}

actions.remove = function(user, args) {
    if (args.length === 0) {
        notify(user, `No user names provided. Type "${command} help" for usage instructions `)
        return
    }
    let removed = []
    while (args.length > 0) {
        let viewer = args.shift()
        let index = viewers.indexOf(viewer)
        if (index === -1) {
            notify(user, `${viewer} does not have access to your private show.`)
        }
        else {
            removed.push(viewer)
            viewers.splice(index, 1)
        }
    }
    if (removed.length === 0) {
        notify(user, 'No users were removed from the viewers list.')
    }
    else {
        cb.limitCam_removeUsers(removed)
        notify(user, `The following members have been removed from the viewers list: ${removed.join(', ')}`)
    }
}

function init() {
	// Bot initialization here.
    // command = '/p' //cb.settings.command
    message = cb.settings.message
    viewers = cb.settings.viewers.split(',').map(s => s.trim())

    let table = [
        ['start', 'start a private show'],
        ['stop', 'stop a private show'],
        ['add', 'add members to the viewers list'],
        ['remove', 'remove members from the viewers list'],
        ['list', 'list all viewers'],
        ['clear', 'clears the viewers list'],
        ['help', 'display this help message']
    ]

    help_text = `Start or stop a private show.
${make_table(table, ': ')}          
${command} on
${command} on member1 member2 ... memberN
${command} off
      
Viewers can be added and removed during the show with the ${command} [add|remove] commands
${command} add member1 [member2 ... memberN]
${command} remove member2
  
When a private show ends the duration of the show will be displayed to the broadcaster only.`
}

const _onMessage = function(message) {
    // We are only intereested in messages from the broadcaster.
	let user = message['user']
	if (user !== broadcaster) {
	    return message
    }


    let msg = message['m']
	let args = msg.split(' ')
    let cmd = args.shift()
    if (cmd !== command) {
        return message
    }
	message['X-Spam'] = true
    if (args.length === 0) {
        notify(user, help_text)
        return message
    }
    let action = actions[cmd]
    if (action == null) {
        notify(user, `Invalid command: ${cmd}. Type "${command} help" for usage instructions.`)
    }
    else {
        action(user, args)
    }
	return message
}

cb.onMessage(_onMessage)

/*
 * Set a timer to perform 'action' in 'delay' milliseconds.
 */
function schedule(action, delay=200) {
    cb.setTimeout(action, delay)
}

// Pick a random integer between 0 and n-1
function random(n) {
    return Math.floor(Math.random() * n)
}

// Selects a random elemnt from an array.
function random_element(list) {
    let index = random(list.length)
    return list[index]
}

function transpose(ch) {
    let code = ch.codePointAt(0)
    const zero = 48 //'0'.charCodeAt(0)
    const nine = 57 //'9'.charCodeAt(0)
    const A = 65 //'A'.charCodeAt(0)
    const Z = 90 //'Z'.charCodeAt(0)
    const a = 97 //'a'.charCodeAt(0)
    const z = 122 //'z'.charCodeAt(0)

    const MONO_A = 120432;  // Start of uppercase A-Z
    const MONO_a = 120458;  // Start of lowercase a-z
    const MONO_0 = 120802;  // Start of digits 0-9

    const space = '\u{2007}' // 0x2007 is a non-breaking "figure" space (the width of digits 0..9)
    const tab = space.repeat(4)
    if (zero <= code && code <= nine) {
        return String.fromCodePoint(MONO_0 + code - zero)
    }
    if (A <= code && code <= Z) {
        return String.fromCodePoint(MONO_A + code - A)
    }
    if (a <= code && code <= z) {
        return String.fromCodePoint(MONO_a + code - a)
    }
    // Return space characters with non-breaking spaces
    if (code === 32) return space
    // Return anything else we don't recognize as I can not find
    // monospace punctuation
    return ch //String.fromCodePoint(code)
}

// Converts the input string to monospaced characters.
function monospace(s) {
    let result = ''
    for (let i = 0; i < s.length; ++i) {
        result += transpose(s.charAt(i))
    }
    return result
}

function pad_row(row, lengths, sep) {
    let n = lengths[0] - row[0].length
    let pad = ' '.repeat(n)
    let string = row[0] + pad

    for (let i = 1; i < row.length; ++i) {
        let n = lengths[i] - row[i].length
        let pad = ' '.repeat(n)
        string += sep + row[i] + pad
    }
    return string
}

function max(list) {
    let largest = -Infinity
    for (let i = 0; i < list.length; ++i) {
        let n = list[i]
        if (n > largest) largest = n
    }
    return largest
}

function make_table(table, sep=' | ') {
    let cols = table[0].length
    cb.log(`There are ${cols} columns`)
    let pads = []
    for (let i = 0; i < cols; ++i) {
        let w = max(table.map(row => row[i].length))
        cb.log(`col ${i} width: ${w}`)
        pads.push(w)
    }
    let string = pad_row(table[0], pads, sep)
    for (let i = 1; i < table.length; ++i) {
        string += '\n'
        string += pad_row(table[i], pads, sep)
    }
    return monospace(string)
}

cb.setTimeout(init, 200)

