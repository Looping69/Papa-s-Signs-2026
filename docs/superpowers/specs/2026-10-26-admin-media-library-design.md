# Admin media library

## Intent and acceptance
Let the administrator reuse any uploaded image to replace site imagery without uploading duplicate files. Show the 102 papas26 JPG originals and future admin uploads; hide matching WebP backup copies without deleting them.

## Chosen approach
The user approved a shared searchable media-library picker rather than exposing both JPG originals and duplicate WebP versions. Reuse the existing React admin, Express server, local files, and config.json persistence; no new storage provider or database.

## Behavior
- Add a Media Library admin view with thumbnails, filename/title search, category/source filters, and upload controls.
- Add Choose from Library beside image replacement controls. Opening it identifies the destination; selecting an image previews the replacement in the admin draft.
- Keep Save All Changes as the explicit publishing action. Canceling the picker changes nothing; selecting an asset does not overwrite or delete its file.
- Include hero, portfolio gallery, service images, Home section images, and About section images. Move currently hardcoded photo slots into optional persisted configuration with their existing images as defaults.
- Future uploads appear in the library immediately and remain available after refresh even when not assigned to a site slot. Keep existing video support for portfolio gallery slots; image-only destinations cannot select videos.
- Display loading, empty, failed-load, failed-upload, and failed-save states. Preserve unrelated unsaved edits during upload and selection.

## Implementation constraints and builder decisions
Use one reusable accessible picker with explicit confirm/cancel, keyboard dismissal, responsive scrolling, and lazy-loaded thumbnails in the current admin styling. Inventory only allowlisted public media directories, never arbitrary filesystem paths. Return public URLs and safe display metadata, not absolute local paths. Fix startup hydration if it would reset saved image selections.

## Non-goals
No image deletion, editing, artificial sharpening, cloud sync, public-site redesign, or new authentication system. Existing admin authorization limitations must be reported, not represented as secure production access.

## Verification
Test inventory deduplication, upload discovery, image/video restrictions, cancellation, correct destination assignment, and saved replacement survival across reload/server restart. Run TypeScript and production build, then verify library selection in the running browser and responsive layout.

## Approval
Scope and written design approved by the user on 26 October 2026 together with the quote-assistant controls.
