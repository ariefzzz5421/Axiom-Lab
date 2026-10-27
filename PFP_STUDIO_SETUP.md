# PFP 3D Studio — setup and provider adapter

Route: `/pfp-studio` (independent from the Axiom Lab / Sentinel Bot experiment gallery).

## Works without any API

- PNG/JPEG/WebP uploader, client-side validation (10MB), pixel processing and optional removal of flat-color backgrounds.
- Three.js browser relief from the uploaded image, with an extruded silhouette, adjustable depth, orbital camera, and three material presentations.
- Exploded-view layers and responsive UI.
- The image stays in the user's browser until **Run AI Conversion** is clicked.

**Important**: This relief uses a luminance/chroma approximation, **not** a generated Blender mesh and **not** a faithful full-geometry reconstruction. True image-to-3D requires a separate AI model/provider. Do not advertise the preview as AI-generated 3D.

## Vercel environment variables (server-only)

```env
PFP_CONVERTER_ENABLED=false
PFP_3D_API_URL=https://your-provider.example/v1/convert
PFP_3D_API_KEY=<server-secret>
PFP_STUDIO_ADMIN_TOKEN=<server-secret>
```

Once you select a provider, turn `PFP_CONVERTER_ENABLED=true` and configure a compatible adapter. **Never** prefix the secrets with `VITE_` or expose them in the frontend. The studio asks for the `PFP_STUDIO_ADMIN_TOKEN` only when you explicitly run conversion. The token is stored in React component memory, not localStorage.

### Provider request contract (generic adapter)

POST `PFP_3D_API_URL` with Bearer API key and JSON:

```json
{"image":"data:image/jpeg;base64,...","style":"resin","output":"glb"}
```

Synchronous response:

```json
{"status":"completed","modelUrl":"https://provider.example/assets/asset.glb","previewUrl":"https://provider.example/assets/preview.png"}
```

Asynchronous response:

```json
{"status":"pending","jobId":"task_123"}
```

A "Check Job Status" button performs GET `PFP_3D_API_URL` + `/jobs/{id}` with the same bearer key. It expects `{status, modelUrl?, previewUrl?}`.

**Provider adapters are not universal.** When you choose an actual API, edit the mapping in `api/pfp-convert.js` and `api/pfp-job.js` to match its real docs, including auth, request schema and polling URL. Do not enable it before testing. Output `.glb` must allow cross-origin requests from the deployed site (CORS). No payment is initiated in the studio.

## Security, cost and resource notes

- The API routes return 503 until explicitly enabled; they reject unauthenticated POST and polling requests.
- Server-side timeout ~23s: use asynchronous provider jobs for longer conversions.
- There is no public user account system or billing limiter. Treat the shared token as an **admin-only** key. Do not publish it or make this a public paid conversion service without rate limiting, authentication, quotas and storage lifecycle controls.
- Output URLs from the provider should be short-lived or otherwise access-controlled, depending on provider.
- Browser preview uses GPU/WebGL; old devices may struggle. The original Axiom Lab routes remain available.
