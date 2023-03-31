const obsidian = require('obsidian');

const FOLDERS = 3;
const DEFAULT_SETTINGS = {
	folders: ['', '', '']
}

const MAIN_COMMAND_NAME = 'Open random';

class RandomInFolderPlugin extends obsidian.Plugin {

	async onload() {

		await this.loadSettings();

		for (let i = 0; i < FOLDERS; i++) {
			if (this.settings.folders[i]) {
				this.addRibbonIcon(`dice-${i+3}`, MAIN_COMMAND_NAME + ` in ${this.settings.folders[i]}`, (evt) => {
					this.configuredFolderAction(this.settings.folders[i]);
				});
			}
		}

		this.addSettingTab(new RandomInFolderSettingsTab(this.app, this));

		for (let i = 0; i < FOLDERS; i++) {
			if (this.settings.folders[i]) {
				this.addCommand({
					id: `random-note-in-configured-folder-${i+1}`,
					name: MAIN_COMMAND_NAME + ` in ${this.settings.folders[i]}`,
					callback: () => this.configuredFolderAction(this.settings.folders[i]),
				});
			}
		}
	}

	configuredFolderAction(folderName) {
		const folder = this.app.vault.getAbstractFileByPath(folderName || '/');
		this.navigateToRandomNoteInFolder(folder);
	}

	navigateToRandomNoteInFolder(folder) {
		if (!folder || !folder.children) {
			new Notice('Invalid folder.');
			return;
		}
		const randomChild = this.randomFileInFolder(folder);
		if (!randomChild) {
			new Notice('No files in that folder.');
			return;
		}
		this.app.workspace.activeLeaf.openFile(randomChild);
	}

	randomFileInFolder(folder) {
		const fileChildren = this.descendantFilesInFolder(folder);
		if (fileChildren.length == 0) {
			return null;
		}
		return fileChildren[Math.floor(Math.random()*fileChildren.length)]
	}

	descendantFilesInFolder(folder) {
		const files = [];
		for (const item of folder.children) {
			if (item.children) {
				//Recurse into the sub-directory
				files.push(...this.descendantFilesInFolder(item));
			} else {
				files.push(item);
			}
		}
		return files;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RandomInFolderSettingsTab extends obsidian.PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		let {containerEl} = this;

		containerEl.empty();

		for (let i = 0; i < FOLDERS; i++) {
			new obsidian.Setting(containerEl)
				.setName(`Configured folder ${i + 1}`)
				.setDesc(`The folder to use for random note command ${i + 1}`)
				.addText(text => text
					.setValue(this.plugin.settings.folders[i])
					.setPlaceholder('Example: foldername')
					.onChange(async (value) => {
						this.plugin.settings.folders[i] = value;
						await this.plugin.saveSettings();
					}));
		}

	}
}

module.exports = RandomInFolderPlugin;