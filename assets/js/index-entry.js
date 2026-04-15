import { isCalibratorComplete } from "./storage.js";

if (isCalibratorComplete()) {
    window.location.replace("homebase.html");
} else {
    import("./calibrator.js").then((m) => m.initCalibrator());
}
