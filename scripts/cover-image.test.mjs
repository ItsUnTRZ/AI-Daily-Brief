import assert from "node:assert/strict";
import test from "node:test";

import { assertCoverUrl, assertImagePayload } from "../src/lib/cover-image.ts";

test("rejects empty or non-image cover responses and accepts real image signatures", () => {
  assert.throws(
    () => assertImagePayload(new Uint8Array(), "image/png"),
    /empty/i,
  );

  assert.throws(
    () => assertImagePayload(new TextEncoder().encode("<html>error</html>"), "text/html"),
    /supported image/i,
  );

  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  assert.deepEqual(assertImagePayload(png, "image/png"), {
    extension: "png",
    contentType: "image/png",
  });
});

test("does not allow publishing without a cover URL", () => {
  assert.throws(() => assertCoverUrl(null), /required/i);
  assert.throws(() => assertCoverUrl(undefined), /required/i);
  assert.equal(assertCoverUrl("/covers/story.png"), "/covers/story.png");
});
