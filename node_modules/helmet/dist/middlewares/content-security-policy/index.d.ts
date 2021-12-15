/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http"
interface ContentSecurityPolicyDirectiveValueFunction {
	(req: IncomingMessage, res: ServerResponse): string
}
declare type ContentSecurityPolicyDirectiveValue = string | ContentSecurityPolicyDirectiveValueFunction
export interface ContentSecurityPolicyOptions {
	useDefaults?: boolean
	directives?: Record<string, null | Iterable<ContentSecurityPolicyDirectiveValue> | typeof dangerouslyDisableDefaultSrc>
	reportOnly?: boolean
}
interface ContentSecurityPolicy {
	(options?: Readonly<ContentSecurityPolicyOptions>): (req: IncomingMessage, res: ServerResponse, next: (err?: Error) => void) => void
	getDefaultDirectives: typeof getDefaultDirectives
	dangerouslyDisableDefaultSrc: typeof dangerouslyDisableDefaultSrc
}
declare const dangerouslyDisableDefaultSrc: unique symbol
declare const getDefaultDirectives: () => {
	[x: string]: Iterable<ContentSecurityPolicyDirectiveValue>
}
declare const contentSecurityPolicy: ContentSecurityPolicy
export default contentSecurityPolicy
export { getDefaultDirectives, dangerouslyDisableDefaultSrc }
