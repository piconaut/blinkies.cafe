/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http"
import contentSecurityPolicy, { ContentSecurityPolicyOptions } from "./middlewares/content-security-policy"
import crossOriginEmbedderPolicy from "./middlewares/cross-origin-embedder-policy"
import crossOriginOpenerPolicy, { CrossOriginOpenerPolicyOptions } from "./middlewares/cross-origin-opener-policy"
import crossOriginResourcePolicy, { CrossOriginResourcePolicyOptions } from "./middlewares/cross-origin-resource-policy"
import expectCt, { ExpectCtOptions } from "./middlewares/expect-ct"
import originAgentCluster from "./middlewares/origin-agent-cluster"
import referrerPolicy, { ReferrerPolicyOptions } from "./middlewares/referrer-policy"
import strictTransportSecurity, { StrictTransportSecurityOptions } from "./middlewares/strict-transport-security"
import xContentTypeOptions from "./middlewares/x-content-type-options"
import xDnsPrefetchControl, { XDnsPrefetchControlOptions } from "./middlewares/x-dns-prefetch-control"
import xDownloadOptions from "./middlewares/x-download-options"
import xFrameOptions, { XFrameOptionsOptions } from "./middlewares/x-frame-options"
import xPermittedCrossDomainPolicies, { XPermittedCrossDomainPoliciesOptions } from "./middlewares/x-permitted-cross-domain-policies"
import xPoweredBy from "./middlewares/x-powered-by"
import xXssProtection from "./middlewares/x-xss-protection"
interface HelmetOptions {
	contentSecurityPolicy?: ContentSecurityPolicyOptions | boolean
	crossOriginEmbedderPolicy?: boolean
	crossOriginOpenerPolicy?: CrossOriginOpenerPolicyOptions | boolean
	crossOriginResourcePolicy?: CrossOriginResourcePolicyOptions | boolean
	dnsPrefetchControl?: XDnsPrefetchControlOptions | boolean
	expectCt?: ExpectCtOptions | boolean
	frameguard?: XFrameOptionsOptions | boolean
	hidePoweredBy?: boolean
	hsts?: StrictTransportSecurityOptions | boolean
	ieNoOpen?: boolean
	noSniff?: boolean
	originAgentCluster?: boolean
	permittedCrossDomainPolicies?: XPermittedCrossDomainPoliciesOptions | boolean
	referrerPolicy?: ReferrerPolicyOptions | boolean
	xssFilter?: boolean
}
interface Helmet {
	(options?: Readonly<HelmetOptions>): (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void
	contentSecurityPolicy: typeof contentSecurityPolicy
	crossOriginEmbedderPolicy: typeof crossOriginEmbedderPolicy
	crossOriginOpenerPolicy: typeof crossOriginOpenerPolicy
	crossOriginResourcePolicy: typeof crossOriginResourcePolicy
	dnsPrefetchControl: typeof xDnsPrefetchControl
	expectCt: typeof expectCt
	frameguard: typeof xFrameOptions
	hidePoweredBy: typeof xPoweredBy
	hsts: typeof strictTransportSecurity
	ieNoOpen: typeof xDownloadOptions
	noSniff: typeof xContentTypeOptions
	originAgentCluster: typeof originAgentCluster
	permittedCrossDomainPolicies: typeof xPermittedCrossDomainPolicies
	referrerPolicy: typeof referrerPolicy
	xssFilter: typeof xXssProtection
	featurePolicy: () => never
	hpkp: () => never
	noCache: () => never
}
declare const helmet: Helmet
export = helmet
