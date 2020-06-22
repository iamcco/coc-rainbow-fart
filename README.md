<h1 align="center">
  <br>
  🌈 RAINBOW FART
  <br>
  <br>
</h1>

## Installation

> fork from [vscode-rainbow-fart](https://github.com/SaekiRaku/vscode-rainbow-fart)

``` vim
:CocInstall coc-rainbow-fart
```

## Usage

**Config**:

- `rainbow-fart.enabled`: Enable extension, default: `true`
- `rainbow-fart.trace.server`: Trace level of log, default: `off`
- `rainbow-fart.locale`: Enable locale of voice package, default: `["zh"]`
- `rainbow-fart.ffplay`: ffplay Command, default: `''`
  > will download ffplay from https://ffbinaries.com/downloads if empty.
- `rainbow-fart.voice-packages`: Add your own voice packages, default: `[]`
- `rainbow-fart.disable-voice-packages`: Disable voice package, default: `[]`

**Commands**:

- `rainbow-fart.enable` Enable extension

**Sources**:

- `CocList VoicePackages`: voice packages
  > - `Enable` enable voice package
  > - `Disable` disable voice package

## License

Open source based on **MIT**, including all design resources and audio resources.

In addition, since most of the audio resources are recorded by real people, and under the obligations of the MIT licensee. Here it is clarify: Especially for multimedia resources in the repo, you have the obligation to (separately) indicate the original author, link, and permission of the resource.
