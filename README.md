v1.0.0

<h1>Private Shows</h1>

A very simple bot that allows broadcasters to enable/disable the "Hidden Cam" mode in their chat room. The members that are allowed to view the hidden cam can be specified on the setup page or at any time in chat via chat commands.

<h1>Setup</h1>

The following options can be set on the bot's Launch page.

&bullet; <b>message</b><br/>The message displayed to members that not allowed to view to show<br/>
&bullet; <b>viewers</b><br/>The default list of viewwers<br/>

The default list of viewers will be able to view all private shows unless they are removed with the <i>/p remove</i> command (see below).

<h1>Commands</h1>


<h2>/p start [member [member ...]]</h2>
Starts a private show with the default list of viewers. A list of member names can also be included and those members will be allowed to veiw the hidden cam as well. Viewers added with the <i>/p start</i> command will only be allowed to view this one private show and will be removed from the viewers list when the private show ends.

<h2>/p stop</h2>
Ends the current private show and makes your cam public again.  The length of the private show will be displayed to the broadcaster as a private notice.

<h2>/p add member [member ...]</h2>

Add one or more members to the viewers list.  Members can be added to the viewers list at any time and will be able to view your hidden cam until removed with <i>/p remove</i>.  If your cam is already hidden the members will be given immediate access.

<h2>/p remove member [member ...]</h2>

Remove one or more members from the viewer list.  Members can be removed from the viewers list at any time.  If your cam is hidden when a member is removed they will no longer be able to view your cam.

<h2>/p list</h2>

List all the members that can view your hidden cam.

<h2>/p clear</h2>

Removes all members from the viewer list and no one will be able to view your hidden cam.

<h2>/p help</h2>
Displays a brief help message. 