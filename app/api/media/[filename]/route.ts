import { serveMediaFile } from "@/lib/serveMediaFile";

export const dynamic = "force-dynamic";

type Args = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, { params }: Args) {
  const { filename } = await params;

  return serveMediaFile(filename);
}

export async function HEAD(_request: Request, { params }: Args) {
  const { filename } = await params;
  const response = await serveMediaFile(filename);

  return new Response(null, {
    headers: response.headers,
    status: response.status,
  });
}
