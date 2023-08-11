# vscode-keybindings

## Development

### Extract default keybindings

- Execute command `Preferences: Open Default Keyboard Shortcuts (JSON)` in VSCode
- Paste the result to `src/global.jsonc` in this repository
- Invoke workflow [convertGlobals](https://github.com/Jaid/vscode-keybindings-reimagined/actions/workflows/convertGlobals.yml)