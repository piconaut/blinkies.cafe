"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const ALLOWED_POLICIES = new Set(["same-origin", "same-origin-allow-popups", "unsafe-none"])
function getHeaderValueFromOptions({ policy = "same-origin" }) {
	if (ALLOWED_POLICIES.has(policy)) {
		return policy
	} else {
		throw new Error(`Cross-Origin-Opener-Policy does not support the ${JSON.stringify(policy)} policy`)
	}
}
function crossOriginOpenerPolicy(options = {}) {
	const headerValue = getHeaderValueFromOptions(options)
	return function crossOriginOpenerPolicyMiddleware(_req, res, next) {
		res.setHeader("Cross-Origin-Opener-Policy", headerValue)
		next()
	}
}
module.exports = crossOriginOpenerPolicy
exports.default = crossOriginOpenerPolicy
