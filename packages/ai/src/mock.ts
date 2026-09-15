import type { JsonRequest, LLMClient } from "./provider.ts";

/** Offline client for development and tests: returns the response the trainer attached to the request. */
export class MockClient implements LLMClient {
  readonly name = "mock";
  calls = 0;

  async generateJson(request: JsonRequest): Promise<unknown> {
    this.calls++;
    if (!request.mock) throw new Error("MockClient: request has no mock response");
    return request.mock();
  }
}
