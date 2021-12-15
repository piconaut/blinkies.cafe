"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const ALLOWED_POLICIES = new Set(["same-origin", "same-site", "cross-origin"])
function getHeaderValueFromOptions({ policy = "same-origin" }) {
	if (ALLOWED_POLICIES.has(policy)) {
		return policy
	} else {
		throw new Error(`Cross-Origin-Resource-Policy does not support the ${JSON.stringify(policy)} policy`)
	}
}
function crossOriginResourcePolicy(options = {}) {
	const headerValue = getHeaderValueFromOptions(options)
	return function crossOriginResourcePolicyMiddleware(_req, res, next) {
		res.setHeader("Cross-Origin-Resource-Policy", headerValue)
		next()
	}
}
module.exports = crossOriginResourcePolicy
exports.default = crossOriginResourcePolicy
