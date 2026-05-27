import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
// @ts-expect-error
import { importMap } from '../importMap'

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams });

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export default async function Page({ params, searchParams }: Args) {
  return RootPage({
    config,
    importMap,
    params,
    searchParams,
  });
}
