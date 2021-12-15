"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
const content_security_policy_1 = __importDefault(require("./middlewares/content-security-policy"))
const cross_origin_embedder_policy_1 = __importDefault(require("./middlewares/cross-origin-embedder-policy"))
const cross_origin_opener_policy_1 = __importDefault(require("./middlewares/cross-origin-opener-policy"))
const cross_origin_resource_policy_1 = __importDefault(require("./middlewares/cross-origin-resource-policy"))
const expect_ct_1 = __importDefault(require("./middlewares/expect-ct"))
const origin_agent_cluster_1 = __importDefault(require("./middlewares/origin-agent-cluster"))
const referrer_policy_1 = __importDefault(require("./middlewares/referrer-policy"))
const strict_transport_security_1 = __importDefault(require("./middlewares/strict-transport-security"))
const x_content_type_options_1 = __importDefault(require("./middlewares/x-content-type-options"))
const x_dns_prefetch_control_1 = __importDefault(require("./middlewares/x-dns-prefetch-control"))
const x_download_options_1 = __importDefault(require("./middlewares/x-download-options"))
const x_frame_options_1 = __importDefault(require("./middlewares/x-frame-options"))
const x_permitted_cross_domain_policies_1 = __importDefault(require("./middlewares/x-permitted-cross-domain-policies"))
const x_powered_by_1 = __importDefault(require("./middlewares/x-powered-by"))
const x_xss_protection_1 = __importDefault(require("./middlewares/x-xss-protection"))
function getArgs(option, middlewareConfig = {}) {
	const { enabledByDefault = true } = middlewareConfig
	switch (option) {
		case undefined:
			return enabledByDefault ? [] : null
		case false:
			return null
		case true:
			return []
		default:
			if (middlewareConfig.takesOptions === false) {
				console.warn(`${middlewareConfig.name} does not take options. ${enabledByDefault ? "Remove the property" : "Set the property to `true`"} to silence this warning.`)
				return []
			} else {
				return [option]
			}
	}
}
function getMiddlewareFunctionsFromOptions(options) {
	const result = []
	const contentSecurityPolicyArgs = getArgs(options.contentSecurityPolicy)
	if (contentSecurityPolicyArgs) {
		result.push(content_security_policy_1.default(...contentSecurityPolicyArgs))
	}
	const crossOriginEmbedderPolicyArgs = getArgs(options.crossOriginEmbedderPolicy, {
		name: "crossOriginEmbedderPolicy",
		takesOptions: false,
		enabledByDefault: false
	})
	if (crossOriginEmbedderPolicyArgs) {
		result.push(cross_origin_embedder_policy_1.default())
	}
	const crossOriginOpenerPolicyArgs = getArgs(options.crossOriginOpenerPolicy, {
		enabledByDefault: false
	})
	if (crossOriginOpenerPolicyArgs) {
		result.push(cross_origin_opener_policy_1.default(...crossOriginOpenerPolicyArgs))
	}
	const crossOriginResourcePolicyArgs = getArgs(options.crossOriginResourcePolicy, { enabledByDefault: false })
	if (crossOriginResourcePolicyArgs) {
		result.push(cross_origin_resource_policy_1.default(...crossOriginResourcePolicyArgs))
	}
	const xDnsPrefetchControlArgs = getArgs(options.dnsPrefetchControl)
	if (xDnsPrefetchControlArgs) {
		result.push(x_dns_prefetch_control_1.default(...xDnsPrefetchControlArgs))
	}
	const expectCtArgs = getArgs(options.expectCt)
	if (expectCtArgs) {
		result.push(expect_ct_1.default(...expectCtArgs))
	}
	const xFrameOptionsArgs = getArgs(options.frameguard)
	if (xFrameOptionsArgs) {
		result.push(x_frame_options_1.default(...xFrameOptionsArgs))
	}
	const xPoweredByArgs = getArgs(options.hidePoweredBy, {
		name: "hidePoweredBy",
		takesOptions: false
	})
	if (xPoweredByArgs) {
		result.push(x_powered_by_1.default())
	}
	const strictTransportSecurityArgs = getArgs(options.hsts)
	if (strictTransportSecurityArgs) {
		result.push(strict_transport_security_1.default(...strictTransportSecurityArgs))
	}
	const xDownloadOptionsArgs = getArgs(options.ieNoOpen, {
		name: "ieNoOpen",
		takesOptions: false
	})
	if (xDownloadOptionsArgs) {
		result.push(x_download_options_1.default())
	}
	const xContentTypeOptionsArgs = getArgs(options.noSniff, {
		name: "noSniff",
		takesOptions: false
	})
	if (xContentTypeOptionsArgs) {
		result.push(x_content_type_options_1.default())
	}
	const originAgentClusterArgs = getArgs(options.originAgentCluster, {
		name: "originAgentCluster",
		takesOptions: false,
		enabledByDefault: false
	})
	if (originAgentClusterArgs) {
		result.push(origin_agent_cluster_1.default())
	}
	const xPermittedCrossDomainPoliciesArgs = getArgs(options.permittedCrossDomainPolicies)
	if (xPermittedCrossDomainPoliciesArgs) {
		result.push(x_permitted_cross_domain_policies_1.default(...xPermittedCrossDomainPoliciesArgs))
	}
	const referrerPolicyArgs = getArgs(options.referrerPolicy)
	if (referrerPolicyArgs) {
		result.push(referrer_policy_1.default(...referrerPolicyArgs))
	}
	const xXssProtectionArgs = getArgs(options.xssFilter, {
		name: "xssFilter",
		takesOptions: false
	})
	if (xXssProtectionArgs) {
		result.push(x_xss_protection_1.default())
	}
	return result
}
const helmet = Object.assign(
	function helmet(options = {}) {
		var _a
		if (((_a = options.constructor) === null || _a === void 0 ? void 0 : _a.name) === "IncomingMessage") {
			throw new Error("It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.")
		}
		const middlewareFunctions = getMiddlewareFunctionsFromOptions(options)
		return function helmetMiddleware(req, res, next) {
			const iterator = middlewareFunctions[Symbol.iterator]()
			;(function internalNext(err) {
				if (err) {
					next(err)
					return
				}
				const iteration = iterator.next()
				if (iteration.done) {
					next()
				} else {
					const middlewareFunction = iteration.value
					middlewareFunction(req, res, internalNext)
				}
			})()
		}
	},
	{
		contentSecurityPolicy: content_security_policy_1.default,
		crossOriginEmbedderPolicy: cross_origin_embedder_policy_1.default,
		crossOriginOpenerPolicy: cross_origin_opener_policy_1.default,
		crossOriginResourcePolicy: cross_origin_resource_policy_1.default,
		dnsPrefetchControl: x_dns_prefetch_control_1.default,
		expectCt: expect_ct_1.default,
		frameguard: x_frame_options_1.default,
		hidePoweredBy: x_powered_by_1.default,
		hsts: strict_transport_security_1.default,
		ieNoOpen: x_download_options_1.default,
		noSniff: x_content_type_options_1.default,
		originAgentCluster: origin_agent_cluster_1.default,
		permittedCrossDomainPolicies: x_permitted_cross_domain_policies_1.default,
		referrerPolicy: referrer_policy_1.default,
		xssFilter: x_xss_protection_1.default,
		featurePolicy() {
			throw new Error("helmet.featurePolicy was removed because the Feature-Policy header is deprecated. If you still need this header, you can use the `feature-policy` module.")
		},
		hpkp() {
			throw new Error("helmet.hpkp was removed because the header has been deprecated. If you still need this header, you can use the `hpkp` module. For more, see <https://github.com/helmetjs/helmet/issues/180>.")
		},
		noCache() {
			throw new Error("helmet.noCache was removed. You can use the `nocache` module instead. For more, see <https://github.com/helmetjs/helmet/issues/215>.")
		}
	}
)
module.exports = helmet
