import {IInputs, IOutputs} from "./generated/ManifestTypes";
//import { TinyMCE } from "tinymce";

export class RichTextTinyMCE6 implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    // Reference to ComponentFramework Context object
	private _context: ComponentFramework.Context<IInputs>;

	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
	private _notifyOutputChanged: () => void;

	private _container : HTMLDivElement;
	//private _textEditor : HTMLTextAreaElement; //no longer used since DIV is used for INLINE mode (and also works with toolbar?)
	private _textEditor : HTMLDivElement;
	private _textValue : string;
	private _domId: string;
	private _tinymce: any;

    /**
     * Sets up all TinyMCE plugins, themes, icons, etc. and loads the TinyMCE library
     */
    constructor()
    {
        //Load TinyMCE library
        this._tinymce = require('tinymce/tinymce');
		require('tinymce/models/dom');
		//require('tinymce/skins/ui/oxide/skin.min.css');
		//require('tinymce/skins/ui/oxide/content.min.css');
		//require('tinymce/skins/content/default/content.css');

        //Load Themes and Icons
        //TODO: change to dynamically load themes, icons and plugins based on the input parameters (or just use the default ones)
        require('tinymce/themes/silver'); 
		require('tinymce/icons/default');

		// Any plugins you want to use have to be imported
		require('tinymce/plugins/link');
		require('tinymce/plugins/code');
		require('tinymce/plugins/quickbars');
		require('tinymce/plugins/lists');
		require('tinymce/plugins/codesample');
		require('tinymce/plugins/image');
    }

    /**
     * Generates a unique ID string.
     * @returns {string} A unique ID string.
     */
	private uniqueId() {
		// Math.random should be unique because of its seeding algorithm.
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return '_' + Math.random().toString(36).substr(2, 9);

		//todo: replace substr function with current / non-deprecated method
	}

    private loadTinyMCE() {		
		this._tinymce.init({
			selector: '#text_editor'+this._domId,
			width: 400, //default / initial width
			height: 240,  //default / initial height
			//skin: 'oxide-dark', //TODO: not working; figure it out
			//content_css: 'dark', //TODO: not working; figure it out
			//icons: 'oxide-dark', //TODO: not working; figure it out
			content_style: "body { font-size: 14px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }",
			//todo: change to full set of formats - font_formats: "Segoe='Segoe UI',sans-serif;Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n",
			//REFERENCE: AzureDevOps uses the folloing style in their rich text editor: "Segoe UI VSS (Regular)","Segoe UI","-apple-system",BlinkMacSystemFont,Roboto,"Helvetica Neue",Helvetica,Ubuntu,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"
			//font-size: 14px

			readonly: this._context.mode.isControlDisabled, //todo: make this a property

			//inline: true, //todo: if using inline need to figure out how to show scrollbar / fixed height/width
			
			mobile: {
				//toolbar: [ 'undo', 'bold', 'italic', 'styles' ],
				plugins: [ 'lists' ]
			},
			
			//toolbar_location: 'bottom',
			toolbar: 'formatting color alignment font | insert | options ', //todo: make this a property
			toolbar_groups: {
				formatting: {
					icon: 'bold',
					tooltip: 'Formatting',
					items: 'bold italic underline | superscript subscript | bullist numlist'
				},
				color: {
					icon: 'color-picker',
					tooltip: 'Color',
					items: 'backcolor forecolor'
				},
				alignment: {
					icon: 'align-left',
					tooltip: 'Alignment',
					items: 'alignleft aligncenter alignright alignjustify indent outdent'
				},
				font: {
					icon: 'format',
					tooltip: 'Font',
					items: 'styles fontfamily fontsize removeformat'
				},
				insert: {
					icon: 'plus',
					tooltip: 'Insert',
					items: 'link quickimage codesample' //todo: add table or other things
				},
				options: {
					icon: 'more-drawer',
					tooltip: 'Other Options',
					items : 'quicklink code' //REMOVED built-in MCE: fullscreen AND custom:  pcffullscreen'
				}
			},
			menubar: false, //todo: make this a property
			resize: false, //todo: make this a property
            //TODO: load plugins dynamically
			plugins: ['quickbars', 'link', 'code', 'lists', 'codesample', 'image'],
			quickbars_selection_toolbar: false, //todo: enable or allow config --> quickbars_selection_toolbar: 'bold italic underline bullist numlist backcolor forecolor styles indent outdent codesample | quicklink removeformat',
			quickbars_insert_toolbar: false, //todo: enable or allow config --> quickbars_insert_toolbar: 'quicklink quickimage',
			link_context_toolbar: true,
			list_indent_on_tab: true,
			statusbar: false,
			placeholder: "Enter text here...", //todo: add 'fieldName' here - eg Enter {Description} here...
			setup:(ed: any) => {
                //TODO: review if this needs to monitor for dirty event instead of change due to v6 modification https://www.tiny.cloud/docs/tinymce/6/migration-from-5x/#change-editor-event
				ed.on('change', (e: any) => {
						this._textValue = ed.getContent();
						this._notifyOutputChanged();
				});

				ed.on('focus', (e: any) => {
                    //On Focus Event (click in the text area) show the toolbar
					console.log('focus event triggered');

					var editorInstance = this._tinymce.get("text_editor"+this._domId);
					var activeContainer : HTMLElement = editorInstance.getContainer();
					var toolbarDiv : any = activeContainer.getElementsByClassName("tox-editor-header")[0];
					toolbarDiv.style.display = "block";
				});

				ed.on('blur', (e: any) => {
                    //On Blur Event (click outside the text area) hide the toolbar
					console.log('blur event triggered');
					var editorInstance = this._tinymce.get("text_editor"+this._domId);
					var activeContainer : HTMLElement = editorInstance.getContainer();
					var toolbarDiv : any = activeContainer.getElementsByClassName("tox-editor-header")[0];
					toolbarDiv.style.display = "none";
				});

				ed.on('PreInit', (e: any) => {
					//On Init Event (default) hide the toolbar
					console.log('init event triggered');
					var editorInstance = this._tinymce.get("text_editor"+this._domId);
					var activeContainer : HTMLElement = editorInstance.getContainer();
					var toolbarDiv : any = activeContainer.getElementsByClassName("tox-editor-header")[0];
					toolbarDiv.style.display = "none";
				});
            }
			
		});

		// https://stackoverflow.com/questions/21665974/tinymce-v3-or-v4-show-hide-toolbar-on-focus-blur
	}

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Control initialization code
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._textValue = this._context.parameters.Text.raw || "";
        this._container = container;
        this._domId = this.uniqueId();
        //this._textEditor = document.createElement("textarea");	// no longer used since DIV is used for INLINE mode (and also works with toolbar?)	
        this._textEditor = document.createElement("div");
        this._textEditor.setAttribute("id", "text_editor" + this._domId);		
        this._textEditor.innerHTML= this._textValue;
        this._container.appendChild(this._textEditor);
        container = this._container;

        //Track Property Changes (including size) for updating TinyMCE control
        this._context.mode.trackContainerResize(true);

        // Add control initialization code
        this.loadTinyMCE();
    }

    /**
     * Sets the text value of the text editor and reloads the TinyMCE editor with the next text.
     * @param text - The new text value to set.
     */
	private setText(text: string) {
		//only update the text if it has changed
		if (this._textValue !== text) {
			this._textValue = text;
			this._textEditor.innerHTML = text;

            //TODO: make sure this still works in v6: https://www.tiny.cloud/docs/tinymce/6/migration-from-5x/#setcontent-editor-event

			//get MCE Editor and set its content
			//TODO: confirm that this works with multiple editors on a page in PowerApps (or use ID())
			var editorInstance = this._tinymce.get("text_editor" + this._domId);

			//check existing cursor/caret location from selection
			var selection = editorInstance?.selection;

			editorInstance?.load();
		}
	}

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // store the latest context
		this._context = context;
		const text = this._context.parameters.Text.raw ?? "";

		const textValueChanged = this._context.updatedProperties.indexOf("Text") > -1;

		if (textValueChanged) {
			//Set text (if it has changed)
			this.setText(text);
		}
		
		var editorInstance = this._tinymce.get("text_editor" + this._domId);

		if(editorInstance){
			//Set the Height & Width based on the configured properties for
			editorInstance.editorContainer.style.height = this._context.mode.allocatedHeight + 'px';
			editorInstance.editorContainer.style.width = this._context.mode.allocatedWidth + 'px';
		}
		//todo: implement 'settings' property object and a method to check/update the settings if they've changed
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
			Text : this._textValue
		};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        //TODO: consider whether a destroy is needed for TinyMCE
		var editorInstance = this._tinymce.get("text_editor" + this._domId);
		editorInstance?.destroy();
    }
}
