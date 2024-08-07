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
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const router = (0, express_1.Router)();
const JWT_SECRET = "secret"; //  This is the secret that we will use to sign the JWT token
const prismaClient = new client_1.PrismaClient(); //  This is the Prisma client that we will use to interact with the database
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //  TODO: Implement signin logic
    const hardCodedWalletAddress = "BMSvxdxt1qvuFaPRChY3b5rovEPanJDXksozBhB3EtN2";
    const existingUser = yield prismaClient.user.findFirst({
        where: {
            address: hardCodedWalletAddress,
        },
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({ userId: existingUser === null || existingUser === void 0 ? void 0 : existingUser.id }, JWT_SECRET);
        res.json({ token });
    }
    else {
        const newUser = yield prismaClient.user.create({
            data: {
                address: hardCodedWalletAddress,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser === null || newUser === void 0 ? void 0 : newUser.id }, JWT_SECRET);
        res.json({ token });
    }
}));
exports.default = router;
