import { GatewayMetadata, WebSocketGateway } from "@nestjs/websockets";

export function SocketHandler({
  port = 80,
  ...gatewayMetadata
}: GatewayMetadata & { port?: number }) {
  WebSocketGateway(port, gatewayMetadata);
}
