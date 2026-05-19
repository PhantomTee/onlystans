import { uploadToIpfs as mockUpload } from "@/lib/mock";
import { allowMockFallback } from "@/lib/env";

function mockMode() {
  return allowMockFallback() && (process.env.MOCK_MODE !== "false" || !process.env.PINATA_JWT);
}

export async function uploadToIpfs(file: File | { name: string }) {
  if (mockMode()) return mockUpload(file.name);
  try {
    const { PinataSDK } = await import("pinata");
    const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT!, pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY });
    const upload = await pinata.upload.public.file(file as File);
    const cid = upload.cid;
    return { cid, src: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}${cid}`, filename: file.name };
  } catch {
    return mockUpload(file.name);
  }
}
