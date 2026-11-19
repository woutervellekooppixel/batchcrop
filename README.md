# BatchCrop

A free Photoshop plugin that batch crops a whole photo set with consistent results. Set your crop once, run the batch, and skip clicking through files one by one.

Built for event photographers, product sets, headshots and anything else where manually cropping hundreds of images is not a real option.

BatchCrop used to be a paid plugin. It is now free and open source under the MIT license. In Photoshop it shows up as **Wouter.Photo Batch Crop**.

## Features

- **Set once, apply everywhere.** Choose your crop once. BatchCrop applies it consistently across the entire set: no per-file adjustments, no drift.
- **Works on large sets.** Built for hundreds of files. Event coverage, product catalogs, headshot sessions: anything where manual cropping is too slow.
- **Consistent output.** Every image in the set gets the same crop. No tiny differences between frames, no manual checks after the fact.
- **Ready-made and custom ratios.** 1:1, 9:16 and 4:5 are set up for you. Add any other ratio yourself, and crop to several ratios in one run.
- **Auto or manual crop mode.** Auto takes the largest centered crop. Manual lets you adjust every crop before it is saved.
- **JPG or PNG, saved where you want.** Save next to the originals or in a folder of your choice.
- **Simpler than Actions.** Photoshop Actions can work, but they're brittle when inputs vary. BatchCrop focuses specifically on repeatable cropping with a straightforward workflow.

## Requirements

- Adobe Photoshop, desktop version, on macOS or Windows. Tested with the desktop version on macOS and Windows; other versions may work, but that is not guaranteed.
- Not available for Photoshop on iPad.

## Install

### Option 1: install the package (recommended)

1. Download [`dist/batchcrop-1.0.2.ccx`](dist/batchcrop-1.0.2.ccx).
2. Double-click the `.ccx` file. The Creative Cloud desktop app opens and asks to install the plugin locally. Confirm.
3. Restart Photoshop.
4. Open the panel from the **Plugins** menu: **Plugins › Wouter.Photo Batch Crop**. If it is not there, check that the Creative Cloud desktop app shows the plugin as installed.

### Option 2: load the source with UXP Developer Tool

For developers who want to run or change the code.

1. Install **UXP Developer Tool** from the Creative Cloud desktop app.
2. In Photoshop, enable Developer Mode in the Plugins preferences, so the **Plugins › Development** menu becomes available.
3. In UXP Developer Tool, click **Add Plugin…** and select `plugin/manifest.json` from this repository (or from the unzipped `dist/batchcrop-1.0.2.zip`).
4. Click **Load**, then open **Plugins › Wouter.Photo Batch Crop** in Photoshop.

## How to use

1. **Source:** choose **Open documents** to crop the documents that are open in Photoshop, or choose the folder option and click **BROWSE** to pick a folder. From a folder, BatchCrop uses the JPG, JPEG, PNG, PSD, AI and SVG files at the top level of that folder. With open documents, tick **Close After Crop** to close each document when it is done.
2. **Ratios:** tick one or more ratios. To add your own, enter a width and height under **Add Ratio** and click **Add**. The ratio is simplified for you, so 1080 : 1350 becomes 4:5. Click the trash icon next to a ratio to remove it.
3. **Crop Mode:** **Auto** crops the largest centered area with the chosen ratio. **Manual** shows each crop in Photoshop so you can adjust it; when you're happy with the crop, press Enter to continue to the next photo.
4. **File Type:** JPG (maximum quality, with the color profile embedded) or PNG.
5. **Destination:** **Same folder** saves the crops next to the source files. Or choose the other option and click **BROWSE** to pick a folder.
6. Click **BATCH CROP**. A progress bar shows how far along the batch is, and a message tells you how many crops were created when it is done.

For every ratio, BatchCrop makes a subfolder in the destination named after the ratio, such as `4-5` or `9-16`, and saves each crop there under the original file name.

Good to know:

- Your original files are not changed: every crop is saved as a new file. Open documents are put back in their previous state after cropping.
- Files with the same name in a ratio folder are overwritten.
- With **Open documents**, new documents that have never been saved are skipped.
- Your ratios and settings are remembered. The plugin's **Reset Plugin** command in the **Plugins** menu restores the defaults; **Reload Plugin** reloads the panel.

## FAQ

**Can I crop multiple images at once in Photoshop?**
Yes. BatchCrop is built for bulk cropping: you set your crop once and apply it across a set, so you don't have to repeat the same steps per file.

**Is this useful for a whole folder of photos?**
That's the core use case. Pick your input set, configure the crop once, run the batch. It is designed for large sets where manual cropping would take too long.

**Is this a good workflow for headshots, products, or event photos?**
Yes: anywhere you need a consistent crop across a set. Headshots, product catalog images, event galleries, real estate photography. Same crop, every file.

**Is this the same as Photoshop Actions?**
Actions can work, but they often take more setup and can be brittle when your inputs vary. BatchCrop focuses specifically on repeatable cropping for large sets with a simple workflow.

## Privacy

BatchCrop runs locally inside Photoshop. The code makes no network requests and collects no analytics. It only reads the images you give it and writes the crops to the destination you choose.

## Reporting a bug

Open an issue in this repository and include your Photoshop version, your OS (macOS or Windows), the source you used (open documents or a folder), the ratios and crop mode, and what you expected and what happened.

## Development

BatchCrop is a UXP panel plugin (manifest version 5) for Photoshop:

- `plugin/manifest.json`: plugin ID, version, host and permissions. Besides file system access, it also asks for network access to `*.adobe.com`, permission to open web links and code generation from strings; the current code uses none of those.
- `plugin/index.html` and `plugin/style.css`: the panel UI, built with Spectrum web components.
- `plugin/main.js`: the batch logic, using the `photoshop` and `uxp` modules. Settings are kept in `localStorage`. The crop overlay functions at the end of the file are unfinished placeholders without UI.

To make a new package, load the plugin in UXP Developer Tool and choose **Package** from the plugin's actions menu (`•••`). This creates a `.ccx` file. Bump `version` in `manifest.json` for every release.

The files in `dist/` were made from the `plugin/` folder:

```sh
# .ccx: the plugin files at the root of a zip archive
cd plugin && zip -X -D -r ../dist/batchcrop-1.0.2.ccx manifest.json index.html main.js style.css icons && cd ..

# .zip: the plugin folder itself, for UXP Developer Tool
ditto -c -k --keepParent --norsrc --noextattr --noqtn --noacl plugin dist/batchcrop-1.0.2.zip
```

The `id` in `manifest.json` is the plugin ID that Adobe assigned to BatchCrop. If you publish your own fork, request your own plugin ID from Adobe and replace it.

## License

MIT. See [LICENSE](LICENSE).

Made by Wouter Vellekoop.
