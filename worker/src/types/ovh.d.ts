declare module "ovh" {
  interface OVHOptions {
    appKey: string;
    appSecret: string;
    consumerKey: string;
    endpoint: string;
  }

  class OVH {
    constructor(options: OVHOptions);
    requestPromised(method: string, path: string, data?: Record<string, unknown>): Promise<any>;
  }

  export = OVH;
}
