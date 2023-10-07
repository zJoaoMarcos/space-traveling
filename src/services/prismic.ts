import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import { NextApiRequestLike } from '@prismicio/next/dist/index';

export interface PrismicConfig {
  req?: NextApiRequestLike;
}

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT);

  client.accessToken = process.env.PRISMIC_ACCESS_TOKEN

  enableAutoPreviews({
    client,
    req: config.req,
  })

  return client;
}
