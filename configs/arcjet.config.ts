import arcjet, { tokenBucket } from "@arcjet/node";

if (!process.env.ARCJET_KEY) {
  console.warn("ARCJET_KEY không được cấu hình!");
}

const aj = arcjet({
  key: process.env.ARCJET_KEY || "test-key",
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src", "http.request.uri.path"],
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export const arcjetProtect = async (req: any, options?: any) => {
  return await aj.protect(req, options || {});
};

export default aj;

