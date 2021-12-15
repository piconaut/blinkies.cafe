"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function originAgentCluster() {
	return function originAgentClusterMiddleware(_req, res, next) {
		res.setHeader("Origin-Agent-Cluster", "?1")
		next()
	}
}
module.exports = originAgentCluster
exports.default = originAgentCluster
