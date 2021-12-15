"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function crossOriginEmbedderPolicy() {
	return function crossOriginEmbedderPolicyMiddleware(_req, res, next) {
		res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
		next()
	}
}
module.exports = crossOriginEmbedderPolicy
exports.default = crossOriginEmbedderPolicy
