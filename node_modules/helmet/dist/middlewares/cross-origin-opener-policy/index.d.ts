import { IncomingMessage, ServerResponse } from "http"
export interface CrossOriginOpenerPolicyOptions {
	policy?: string
}
declare function crossOriginOpenerPolicy(options?: Readonly<CrossOriginOpenerPolicyOptions>): (_req: IncomingMessage, res: ServerResponse, next: () => void) => void
export default crossOriginOpenerPolicy
