# PCF-TinyMCE6
This is a PowerApps Component Framework (PCF) control that leverages the [TinyMCE Rich Text Control](https://www.tiny.cloud/tinymce/) as an alternative to the [built-in Rich Text control](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/controls/control-richtexteditor) in Canvas apps.

Note this implements [TinyMCE version 6](https://www.tiny.cloud/docs/tinymce/6/). (This is an updated version of an earlier PCF control I built to use [TinyMCE version 5](https://github.com/rsocko/PCF-TinyMCE5) and required several updates & refactors to account for upgrading from v5 >> v6.)

Currently the settings & configuration of the TinyMCE editor PCF control includes the following features: 
- Toolbar is automatically hidden until the user activates / clicks in the field (this saves space in the UX as the toolbar doesn't take up space until the user is editing the text).
- Allows the user to set a height & width in PowerApps designer
- Resizes based on any change to the height/width properties (eg if a formula changes the dimensions), it will redraw the TinyMCE editor.
- Includes a fixed/preset toolbar with a full complement of options
- Mobile toolbar with a more limited/focused set of options
- Designed to allow for more than one instance of the TinyMCE control on a page/screen - each editor is independent of the other

Future updates are intended to add:
- Configuration of the toolbar by the developer such as: which buttons to show, whether to show or hide the toolbar
- Read-only and Disabled mode for the control
- Styles / CSS enablement to allow customization of theme and look & feel

