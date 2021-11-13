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
exports.isEmpty = exports.cleanPool = exports.cleanTmp = exports.makeZip = exports.filterPool = exports.web = exports.pool = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const archiver_1 = __importDefault(require("archiver"));
exports.pool = `${path_1.default.resolve(__dirname, '..')}/pool`;
exports.web = `${path_1.default.resolve(__dirname, '..')}/src/web`;
const tmp = `${path_1.default.resolve(__dirname, '..')}/tmp`;
const filterPool = (filter) => {
    let files = [];
    if ((0, exports.isEmpty)(filter)) {
        files = (0, fs_1.readdirSync)(exports.pool);
    }
    else {
        (0, fs_1.readdirSync)(exports.pool).forEach(file => {
            if (file.match(filter)) {
                files.push(file);
            }
        });
    }
    return files;
};
exports.filterPool = filterPool;
const makeZip = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const zipDir = (0, fs_1.mkdirSync)(`${tmp}/${(0, uuid_1.v4)().split('-')[0]}`, { recursive: true });
    files.forEach(file => {
        (0, fs_1.copyFileSync)(`${exports.pool}/${file}`, `${zipDir}/${file}`);
    });
    const zipFile = (0, fs_1.createWriteStream)(`${zipDir}.zip`);
    const zipArchive = (0, archiver_1.default)('zip');
    zipArchive.pipe(zipFile);
    zipArchive.directory(zipDir, false);
    yield zipArchive.finalize();
    yield new Promise(ctx => zipFile.on('finish', ctx));
    return zipFile.path.toString();
});
exports.makeZip = makeZip;
const cleanTmp = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    (0, fs_1.rmSync)(pattern);
    (0, fs_1.rmSync)(pattern.split('.')[0], { recursive: true });
});
exports.cleanTmp = cleanTmp;
const cleanPool = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const files = [];
    (0, fs_1.readdirSync)(exports.pool).forEach(file => {
        if ((0, exports.isEmpty)(filter)) {
            (0, fs_1.rmSync)(`${exports.pool}/${file}`);
            files.push(file);
        }
        else if (file.match(filter)) {
            (0, fs_1.rmSync)(`${exports.pool}/${file}`);
            files.push(file);
        }
    });
    return files;
});
exports.cleanPool = cleanPool;
const isEmpty = (value) => {
    if (typeof (value) === 'string') {
        return (!value || value.length === 0);
    }
    else if (Array.isArray(value)) {
        return (value.length === 0 ? true : false);
    }
    else {
        return false;
    }
};
exports.isEmpty = isEmpty;
//# sourceMappingURL=library.js.map