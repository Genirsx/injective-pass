"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
let CryptoService = class CryptoService {
    constructor(configService) {
        this.configService = configService;
        this.encryptionKey = this.configService.get('AES_ENCRYPTION_KEY');
        if (!this.encryptionKey || this.encryptionKey.length !== 64) {
            throw new Error('AES_ENCRYPTION_KEY 必须是64位十六进制字符串 (32字节)');
        }
    }
    encrypt(privateKey) {
        try {
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
            let encrypted = cipher.update(privateKey, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();
            return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
        }
        catch (error) {
            throw new Error(`私钥加密失败: ${error.message}`);
        }
    }
    decrypt(encryptedData) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                throw new Error('加密数据格式无效');
            }
            const [ivHex, tagHex, encryptedHex] = parts;
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error(`私钥解密失败: ${error.message}`);
        }
    }
    hashApiKey(apiKey) {
        return CryptoJS.SHA256(apiKey).toString(CryptoJS.enc.Hex);
    }
    generateApiKey(prefix = 'nfc_') {
        const randomBytes = crypto.randomBytes(32);
        return `${prefix}${randomBytes.toString('hex')}`;
    }
    validatePrivateKey(privateKey) {
        const cleanKey = privateKey.replace(/^0x/, '');
        return /^[a-fA-F0-9]{64}$/.test(cleanKey);
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CryptoService);
//# sourceMappingURL=crypto.service.js.map