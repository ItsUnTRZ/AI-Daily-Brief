export type ImageFormat = {
  extension: "png" | "jpg" | "webp";
  contentType: "image/png" | "image/jpeg" | "image/webp";
};

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

export function assertImagePayload(bytes: Uint8Array, contentType = ""): ImageFormat {
  if (bytes.byteLength === 0) {
    throw new Error("cover image response was empty");
  }

  const normalizedType = contentType.split(";", 1)[0].trim().toLowerCase();

  if (startsWithBytes(bytes, PNG_SIGNATURE)) {
    return { extension: "png", contentType: "image/png" };
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return { extension: "webp", contentType: "image/webp" };
  }

  throw new Error(
    `cover image response was not a supported image (content-type: ${normalizedType || "unknown"})`,
  );
}

export function assertCoverUrl(coverUrl: string | null | undefined): string {
  if (!coverUrl || !coverUrl.trim()) {
    throw new Error("cover image URL is required before publishing");
  }
  return coverUrl;
}
