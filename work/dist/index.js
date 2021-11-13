"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const morgan_1 = __importDefault(require("morgan"));
const library_1 = require("./library");
const app = (0, express_1.default)();
const port = 8080;
app.use((0, morgan_1.default)('short'));
app.use(express_1.default.static(library_1.web));
app.get('/api/list/:filter?', (req, res) => {
    const files = (0, library_1.filterPool)(req.params.filter);
    res.send(files);
});
app.get('/api/get/:filter?', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = (0, library_1.filterPool)(req.params.filter);
    if (files.length === 1) {
        res.sendFile(`${library_1.pool}/${files[0]}`);
    }
    else if (!(0, library_1.isEmpty)(files)) {
        const zipFile = yield (0, library_1.makeZip)(files);
        res.on('finish', () => (0, library_1.cleanTmp)(zipFile)).sendFile(zipFile);
    }
    else {
        res.send('no file found');
    }
}));
app.get('/api/rm/:filter?', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield (0, library_1.cleanPool)(req.params.filter);
    res.send(files);
}));
const upload = (0, multer_1.default)({ storage: multer_1.default.diskStorage({
        destination(req, file, callback) { callback(null, library_1.pool); },
        filename(req, file, callback) { callback(null, file.originalname); }
    }) }).array('files');
app.post('/api/push', upload, (req, res) => {
    res.redirect('/');
});
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server startet at http://0.0.0.0:${port}`);
});
//# sourceMappingURL=index.js.map