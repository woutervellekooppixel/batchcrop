const uxp = require("uxp");
const { entrypoints: entrypoints } = require("uxp");
const types = uxp.storage.types;
const executeAsModal = require("photoshop").core.executeAsModal;
const fs = uxp.storage.localFileSystem;
const { app: app, action: psAction } = require("photoshop");

var conFig = {
  inputToken: "",
  ratio: [['1:1', false], ['9:16', false], ['4:5', false]],
  outputType: "",
  outputFolders: "",
  saveToken: "",
  userWait: false,
  inputType: "folder",
  closeDoc: false,
cropMode: 'auto',  
};

save = async function () {
  localStorage.setItem("WouterPhotoBatchCropConfig", JSON.stringify(conFig));
};

load = async function () {
  var oldConf = JSON.parse(localStorage.getItem("WouterPhotoBatchCropConfig"));
    if (oldConf) {
        conFig = { ...conFig, ...oldConf };
    }
};

load();

const inputOptions = document.getElementById("inputOptions");
const inputBtn = document.getElementById("inputBtn");

const userWait = document.getElementById("userWait");

const outputType = document.getElementById("outputType");

const outputFolders = document.getElementById("outputFolders");

const saveBtn = document.getElementById("saveBtn");
const runBtn = document.getElementById("runBtn");
const progress = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const ratios = document.getElementById("ratios");
const closeDoc = document.getElementById("closeDoc");
const crWidth = document.getElementById("crWidth");
const crHeight = document.getElementById("crHeight");
const crAdd = document.getElementById("crAdd");

// Modal logic
const modal = document.getElementById("myModal");
const gotItBtn = document.getElementById("gotItBtn");
const neverShowCheckbox = document.getElementById("neverShow");

// Modal logic
const welcomeModal = document.getElementById("welcomeModal");
const closeModalBtn = document.getElementById("closeModalBtn");

// Done modal
const doneModal = document.getElementById("doneModal");
const doneText = document.getElementById("doneText");
const doneBtn = document.getElementById("doneBtn");

if (doneBtn) {
  doneBtn.addEventListener("click", function () {
    doneModal.style.display = "none";
  });
}

function updateProgressUI(completed, total) {
  if (progress) {
    progress.style.display = "block";
    progress.style.opacity = 1;
    progress.max = total;
    progress.value = completed;
  }
  if (progressText) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressText.style.display = "block";
    progressText.style.opacity = 1;
    progressText.textContent = `Processing ${completed}/${total} (${percent}%)`;
  }
}

function hideProgressUI() {
  if (progress) {
    progress.style.opacity = 0;
    progress.style.display = "none";
    progress.value = 0;
  }
  if (progressText) {
    progressText.style.opacity = 0;
    progressText.style.display = "none";
    progressText.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", function() {
    const autoMode = document.getElementById("autoMode");
    const manualMode = document.getElementById("manualMode");

    // Set the radio button based on the saved configuration
    if (conFig.cropMode === 'manual') {
        if (manualMode) manualMode.checked = true;
    } else {
        autoMode.checked = true;  // Default to 'auto'
    }

    // Handle the change event for the auto mode radio button
    autoMode.addEventListener("change", function() {
        if (this.checked) {
            conFig.cropMode = 'auto';
            save();  // Save the new state
        }
    });

    // Handle the change event for the manual mode radio button
    if (manualMode) manualMode.addEventListener("change", function() {
        if (this.checked) {
            conFig.cropMode = 'manual';
            save();  // Save the new state
        }
    });
});

// Function to show the welcome modal
function showWelcomeModal() {
    if (!localStorage.getItem("hasSeenWelcomeModal")) {
        welcomeModal.style.display = "block";
    }
}

// Close modal on button click and remember the choice
closeModalBtn.addEventListener("click", function () {
    welcomeModal.style.display = "none";
    localStorage.setItem("hasSeenWelcomeModal", "true");
});

// Show the modal when the plugin starts
document.addEventListener("DOMContentLoaded", showWelcomeModal);

// Check if the modal should be shown
function showModal() {
    if (!localStorage.getItem("neverShowModal")) {
        modal.style.display = "block";
    }
}


gotItBtn.addEventListener("click", function () {
    if (neverShowCheckbox.checked) {
        localStorage.setItem("neverShowModal", "true");
    }
    modal.style.display = "none";
});

// Call this function where you want to show the modal
function triggerManualCropModal() {
    showModal();
}

// Example usage: show modal when manual crop is selected
document.getElementById("userWait").addEventListener("change", function () {
    if (this.checked) {
        triggerManualCropModal();
    }
});

if (conFig.inputToken != "") inputBtn.setAttribute("token", conFig.inputToken);

userWait.checked = conFig.userWait;
if (conFig.outputType != "") outputType.selected = conFig.outputType;
if (conFig.outputFolders != "") outputFolders.selected = conFig.outputFolders;

if (conFig.saveToken != "") saveBtn.setAttribute("token", conFig.saveToken);
runBtn.disabled = !enableRunBtn();
saveBtn.disabled = outputFolders.value == "same";

if (conFig.inputType) {
  inputOptions.selected = conFig.inputType;
  inputBtn.disabled = inputOptions.value == 'openDoc';
  closeDoc.disabled = inputOptions.value == 'folder';
}
if (conFig.closeDoc) {
  closeDoc.checked = true;
}
if (conFig.ratio.length > 0) {
  conFig.ratio.forEach(addNewRatio);
}

closeDoc.addEventListener("change", function () {
  conFig.closeDoc = closeDoc.checked;
  save();
});

// Function to calculate the greatest common divisor (GCD)
function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

// Function to simplify the ratio
function simplifyRatio(width, height) {
  const divisor = gcd(width, height);
  return {
    width: width / divisor,
    height: height / divisor
  };
}

function addNewRatio(ratio) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="100%" height="100%"><g fill="white" transform="scale(2,2)"><path d="M49,1c-1.66,0 -3,1.34 -3,3c0,1.66 1.34,3 3,3h30c1.66,0 3,-1.34 3,-3c0,-1.66 -1.34,-3 -3,-3zM24,15c-7.17,0 -13,5.83 -13,13c0,7.17 5.83,13 13,13h77v63c0,9.37 -7.63,17 -17,17h-40c-9.37,0 -17,-7.63 -17,-17v-52c0,-1.66 -1.34,-3 -3,-3c-1.66,0 -3,1.34 -3,3v52c0,12.68 10.32,23 23,23h40c12.68,0 23,-10.32 23,-23v-63.35937c5.72,-1.36 10,-6.50062 10,-12.64062c0,-7.17 -5.83,-13 -13,-13zM24,21h80c3.86,0 7,3.14 7,7c0,3.86 -3.14,7 -7,7h-80c-3.86,0 -7,-3.14 -7,-7c0,-3.86 3.14,-7 7,-7zM50,55c-1.66,0 -3,1.34 -3,3v46c0,1.66 1.34,3 3,3c1.66,0 3,-1.34 3,-3v-46c0,-1.66 -1.34,-3 -3,-3zM78,55c-1.66,0 -3,1.34 -3,3v46c0,1.66 1.34,3 3,3c1.66,0 3,-1.34 3,-3v-46c0,-1.66 -1.34,-3 -3,-3z" /></g></svg>';
  var sub = document.createElement("sub");
  sub.classList.add("ratio");
  var checkbox = document.createElement("sp-checkbox");
  checkbox.id = '_' + ratio[0];
  checkbox.textContent = ratio[0];
  sub.appendChild(checkbox);
  checkbox.checked = ratio[1];
  checkbox.addEventListener("change", function () {
    conFig.ratio = conFig.ratio.filter(function (item) {
      if (item[0] == ratio[0]) {
        item[1] = checkbox.checked;
      }
      return item;
    });
    save();
    runBtn.disabled = !enableRunBtn();
  });
  var img = document.createElement("span");
  img.classList.add("remove");
  img.innerHTML = svg;
  img.addEventListener("click", function () {
    conFig.ratio = conFig.ratio.filter(function (item) {
      return item[0] != ratio[0];
    });
    sub.remove();
    save();
  });
  sub.appendChild(img);
  ratios.appendChild(sub);
}

crAdd.addEventListener("click", function () {
  // Get the width and height values entered by the user
  var width = parseInt(crWidth.value);
  var height = parseInt(crHeight.value);

  // Simplify the ratio using the simplifyRatio function
  var simplified = simplifyRatio(width, height);

  // Construct the new ratio string
  var newRatio = simplified.width + ":" + simplified.height;
  crWidth.value = "";
  crHeight.value = "";

  // Check if the ratio already exists in the configuration
  if (newRatio && newRatio != '') {
    var isAlreadyThere = conFig.ratio.filter(function (item) {
      return item[0] == newRatio;
    });
    if (isAlreadyThere.length == 0) {
      // Add the new simplified ratio to the configuration
      conFig.ratio.push([newRatio, false]);
      save();
      addNewRatio([newRatio, false]);
    } else {
      // If the ratio already exists, focus on the existing one
      document.getElementById('_' + isAlreadyThere[0][0]).focus();
    }
  }
});

crWidth.addEventListener("change", function () {
  crAdd.disabled = crWidth.value == '' || crHeight.value == '';
});

crHeight.addEventListener("change", function () {
  crAdd.disabled = crWidth.value == '' || crHeight.value == '';
});

userWait.addEventListener("change", function () {
  conFig.userWait = userWait.checked;
  save();
  runBtn.disabled = !enableRunBtn();
});

inputOptions.addEventListener("change", function () {
  inputBtn.disabled = inputOptions.value == 'openDoc';
  conFig.inputType = inputOptions.value;
  closeDoc.disabled = inputOptions.value == 'folder';
  save();
  runBtn.disabled = !enableRunBtn();
});

inputBtn.addEventListener("click", async function () {
  var fol = await fs.getFolder();
  var allf = await fol.getEntries();
  allf = allf.filter(
    (entry) =>
      entry.name.replace(/^.*\./, "").toLowerCase() === "png" ||
      entry.name.replace(/^.*\./, "").toLowerCase() === "jpg" ||
      entry.name.replace(/^.*\./, "").toLowerCase() === "jpeg" ||
      entry.name.replace(/^.*\./, "").toLowerCase() === "psd" ||
      entry.name.replace(/^.*\./, "").toLowerCase() === "ai" ||
      entry.name.replace(/^.*\./, "").toLowerCase() === "svg"
  );
  if (allf.length > 0) {
    inputBtn.variant = "cta";
    var tok = await fs.createPersistentToken(fol);
    conFig.inputToken = tok;
    inputBtn.setAttribute("token", tok);
    save();
    runBtn.disabled = !enableRunBtn();
  } else {
    inputBtn.variant = "warning";
  }
});

saveBtn.addEventListener("click", async function () {
  var fol = await fs.getFolder();
  var tok = await fs.createPersistentToken(fol);
  saveBtn.setAttribute("token", tok);
  conFig.saveToken = tok;
  save();
  runBtn.disabled = !enableRunBtn();
});

outputType.addEventListener("change", function () {
  conFig.outputType = outputType.value;
  save();
  runBtn.disabled = !enableRunBtn();
});

outputFolders.addEventListener("change", function (e) {
  if (e.target.value == "same") {
    saveBtn.disabled = true;
  } else {
    saveBtn.disabled = false;
  }
  runBtn.disabled = !enableRunBtn();
  conFig.outputFolders = e.target.value;
  save();
});

function enableRunBtn() {
  var inputToken = inputBtn.getAttribute("token");
  if (conFig.inputType == "openDoc" && app.documents.length == 0) return false;
  if (conFig.inputType == "folder" && !inputToken) return false;
  if (!isAnyRatio()) return false;
  if (outputFolders.value == "custom") {
    var saveToken = saveBtn.getAttribute("token");
    if (!saveToken) return false;
  }
  return true;
}

function isAnyRatio() {
  return conFig.ratio.some(function (item) {
    return item[1];
  });
}

async function getSizes(rw, rh, userWait) {
  var RatioW = Number(rw);
  var RatioH = Number(rh);
  var doc = app.activeDocument;
  if (doc.width / doc.height > RatioW / RatioH) {
    var top = 0;
    var left = (doc.width - doc.height * (RatioW / RatioH)) / 2;
    var bottom = doc.height;
    var right = (doc.width + doc.height * (RatioW / RatioH)) / 2;
  } else {
    var top = (doc.height - doc.width * (RatioH / RatioW)) / 2;
    var left = 0;
    var bottom = (doc.height + doc.width * (RatioH / RatioW)) / 2;
    var right = doc.width;
  }
  await executeAsModal(async () => {
    await crop(bottom, left, right, top, userWait);
  }, { commandName: "Cropping", interactive: userWait });
}

function reloadPlugin() {
  window.location.reload();
}

function resetPlugin() {
  conFig = {
    inputToken: "",
    ratio: [['1:1', false], ['9:16', false], ['4:5', false]],
    outputType: "",
    outputFolders: "",
    saveToken: "",
    userWait: false,
    inputType: "folder",
    closeDoc: false,
  };
  save();
  reloadPlugin();
}

entrypoints.setup({
  commands: {
    reloadPlugin: () => reloadPlugin(),
    resetPlugin: () => resetPlugin(),
  },
  panels: {
    WouterPhotoBatchCrop: {
      show() {},
      menuItems: [],
    },
  },
});

async function crop(bottom, left, right, top, wait) {
  let command = [
    {
      descriptor: {
        AutoFillMethod: 1,
        _obj: "crop",
        angle: { _unit: "angleUnit", _value: 0.0 },
        constrainProportions: true,
        cropAspectRatioModeKey: {
          _enum: "cropAspectRatioModeClass",
          _value: "pureAspectRatio",
        },
        cropFillMode: { _enum: "cropFillMode", _value: "defaultFill" },
        delete: true,
        to: {
          _obj: "rectangle",
          bottom: { _unit: "pixelsUnit", _value: bottom },
          left: { _unit: "pixelsUnit", _value: left },
          right: { _unit: "pixelsUnit", _value: right },
          top: { _unit: "pixelsUnit", _value: top },
        },
      },
    },
  ];
  if (wait) {
    command[0].options = { dialogOptions: "display" };
  }
  result = await psAction.batchPlay(command, {});
}

runBtn.addEventListener("click", async function () {
  let completedCrops = 0;
  var img = [];
  if (conFig.inputType == "openDoc") {
    if (app.documents.length == 0) return;
    img = app.documents.filter((d) => d.path != "");
  } else {
    var inputFolder = await fs.getEntryForPersistentToken(conFig.inputToken);

    var imgs = await inputFolder.getEntries();
    img = imgs.filter(
      (entry) =>
        entry.name.replace(/^.*\./, "").toLowerCase() === "png" ||
        entry.name.replace(/^.*\./, "").toLowerCase() === "jpg" ||
        entry.name.replace(/^.*\./, "").toLowerCase() === "jpeg" ||
        entry.name.replace(/^.*\./, "").toLowerCase() === "psd" ||
        entry.name.replace(/^.*\./, "").toLowerCase() === "ai" ||
        entry.name.replace(/^.*\./, "").toLowerCase() === "svg"
    );
  }
  if (img.length > 0) {
    var sizes = conFig.ratio
      .filter((item) => item[1])
      .map((item) => {
        var [rw, rh] = item[0].split(":");
        return { rw: Number(rw), rh: Number(rh) };
      });

    const totalCrops = img.length * sizes.length;
    updateProgressUI(0, totalCrops);

    // Give UXP/Spectrum a chance to paint the progress UI before heavy modal work.
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      for (var i = 0; i < img.length; i++) {
        var doc;
        await executeAsModal(async () => {
          if (conFig.inputType == "openDoc") {
            app.activeDocument = img[i];
            doc = app.activeDocument;
            if (doc.path == "" && outputFolders.value == "same") return;
          } else {
            doc = await app.open(img[i]);
          }
          var docPath = doc.path;
          var docFoder = docPath.slice(
            0,
            docPath.lastIndexOf(docPath.indexOf("\\") > 0 ? "\\" : "/")
          );
          var outputFolder =
            outputFolders.value == "custom"
              ? await fs.getEntryForPersistentToken(conFig.saveToken)
              : await fs.getEntryWithUrl(docFoder);
          var docName = doc.name.split(".").slice(0, -1).join(".");
          var actH = doc.activeHistoryState;
          for (var s = 0; s < sizes.length; s++) {
            doc.activeHistoryState = actH;
            var size = sizes[s];
            var sizeFolder;
            await outputFolder
              .getEntry(size.rw + "-" + size.rh)
              .then((s) => {
                sizeFolder = s;
              })
              .catch(async (err) => {
                sizeFolder = await outputFolder.createEntry(
                  size.rw + "-" + size.rh,
                  { type: types.folder, overwrite: "true" }
                );
              });
            await getSizes(size.rw, size.rh, conFig.userWait);
            var newFile =
              outputType.value === "jpg"
                ? await sizeFolder.createFile(docName + ".jpg", {
                    overwrite: "true",
                  })
                : await sizeFolder.createFile(docName + ".png", {
                    overwrite: "true",
                  });
            if (outputType.value === "jpg") {
              await doc.saveAs.jpg(
                newFile,
                { quality: 12, embedColorProfile: true },
                true
              );
            } else {
              await doc.saveAs.png(newFile, true);
            }

            completedCrops++;
          }
          doc.activeHistoryState = actH;
          if (
            (conFig.inputType == "openDoc" && conFig.closeDoc) ||
            conFig.inputType == "folder"
          )
            doc.closeWithoutSaving();
        }, { commandName: "Exporting", interactive: conFig.userWait });

        // Update UI outside executeAsModal so it can repaint.
        updateProgressUI(completedCrops, totalCrops);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } catch (err) {
      console.log(err);
    }
    hideProgressUI();

    if (doneModal && doneText) {
      const cropWord = completedCrops === 1 ? "crop" : "crops";
      doneText.textContent = `Finished! Created ${completedCrops} ${cropWord}. Yay!`;
      doneModal.style.display = "block";
    }
  } else {
    alert("No images found in input folder");
  }
});

psAction.addNotificationListener(["close", "open"], function () {
  runBtn.disabled = !enableRunBtn();
});

// New Crop Overlay Radio Button Functionality

const overlayRadios = document.querySelectorAll('input[name="overlay"]');

overlayRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      applyCropOverlay(this.value);
    }
  });
});

function applyCropOverlay(overlay) {
  switch (overlay) {
    case "diagonal":
      applyDiagonalOverlay();
      break;
    case "grid":
      applyGridOverlay();
      break;
    case "goldenRatio":
      applyGoldenRatioOverlay();
		        break;
    case "goldenRatio":
      applyGoldenRatioOverlay();
      break;
    case "goldenSpiral":
      applyGoldenSpiralOverlay();
      break;
    case "ruleOfThirds":
      applyRuleOfThirdsOverlay();
      break;
    case "triangle":
      applyTriangleOverlay();
      break;
    default:
      console.log("No valid overlay selected");
  }
}

// Define your overlay functions here
function applyDiagonalOverlay() {
  console.log("Applying Diagonal Overlay");
  // Add the code to apply the Diagonal Overlay in Photoshop
}

function applyGridOverlay() {
  console.log("Applying Grid Overlay");
  // Add the code to apply the Grid Overlay in Photoshop
}

function applyGoldenRatioOverlay() {
  console.log("Applying Golden Ratio Overlay");
  // Add the code to apply the Golden Ratio Overlay in Photoshop
}

function applyGoldenSpiralOverlay() {
  console.log("Applying Golden Spiral Overlay");
  // Add the code to apply the Golden Spiral Overlay in Photoshop
}

function applyRuleOfThirdsOverlay() {
  console.log("Applying Rule of Thirds Overlay");
  // Add the code to apply the Rule of Thirds Overlay in Photoshop
}

function applyTriangleOverlay() {
  console.log("Applying Triangle Overlay");
  // Add the code to apply the Triangle Overlay in Photoshop
}