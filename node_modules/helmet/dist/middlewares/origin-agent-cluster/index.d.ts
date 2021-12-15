import { IncomingMessage, ServerResponse } from "http"
declare function originAgentCluster(): (_req: IncomingMessage, res: ServerResponse, next: () => void) => void
export default originAgentCluster
