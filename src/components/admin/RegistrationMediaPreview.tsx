"use client";

import { useEffect, useMemo, useState } from "react";
import { useField } from "@payloadcms/ui";

type MediaLike = {
  alt?: string | null;
  filename?: string | null;
  id?: number | string;
  mimeType?: string | null;
  thumbnailURL?: string | null;
  url?: string | null;
};

type UploadValue =
  | MediaLike
  | {
      relationTo?: string;
      value?: MediaLike | number | string | null;
    }
  | number
  | string
  | null
  | undefined;

type PreviewItem = {
  label: string;
  media: MediaLike | null;
  value: UploadValue;
};

const uploadFields = [
  { label: "Profile image", path: "profilePhoto" },
  { label: "Certificate image", path: "certificateFile" },
  { label: "Level 1 & 2 certificate image", path: "prerequisiteL12CertificateFile" },
  { label: "Level 3 certificate image", path: "prerequisiteL3CertificateFile" },
] as const;

function isMediaObject(value: unknown): value is MediaLike {
  return Boolean(value && typeof value === "object" && ("url" in value || "thumbnailURL" in value || "mimeType" in value || "filename" in value));
}

function getMediaId(value: UploadValue) {
  if (!value) return null;
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (isMediaObject(value) && value.id !== undefined && value.id !== null) return String(value.id);
  if ("value" in value) return getMediaId(value.value);
  return null;
}

function getEmbeddedMedia(value: UploadValue) {
  if (!value) return null;
  if (isMediaObject(value)) return value;
  if (typeof value === "object" && "value" in value && isMediaObject(value.value)) return value.value;
  return null;
}

function getAssetURL(media: MediaLike | null) {
  if (!media) return "";
  return media.thumbnailURL || media.url || "";
}

function isImage(media: MediaLike | null) {
  return Boolean(media?.mimeType?.startsWith("image/") && media.url);
}

async function fetchMedia(value: UploadValue) {
  const embedded = getEmbeddedMedia(value);
  if (embedded?.url || embedded?.thumbnailURL) return embedded;

  const id = getMediaId(value);
  if (!id) return null;

  try {
    const response = await fetch(`/api/media/${encodeURIComponent(id)}?depth=0`, {
      credentials: "same-origin",
    });

    if (!response.ok) return embedded;
    return (await response.json()) as MediaLike;
  } catch {
    return embedded;
  }
}

export default function RegistrationMediaPreview() {
  const { value: profilePhoto } = useField<UploadValue>({ path: uploadFields[0].path });
  const { value: certificateFile } = useField<UploadValue>({ path: uploadFields[1].path });
  const { value: prerequisiteL12CertificateFile } = useField<UploadValue>({ path: uploadFields[2].path });
  const { value: prerequisiteL3CertificateFile } = useField<UploadValue>({ path: uploadFields[3].path });

  const values = useMemo(
    () => [profilePhoto, certificateFile, prerequisiteL12CertificateFile, prerequisiteL3CertificateFile],
    [certificateFile, prerequisiteL12CertificateFile, prerequisiteL3CertificateFile, profilePhoto]
  );
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaLike | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all(
      uploadFields.map(async (field, index) => ({
        label: field.label,
        media: await fetchMedia(values[index]),
        value: values[index],
      }))
    ).then((resolvedItems) => {
      if (isMounted) setItems(resolvedItems);
    });

    return () => {
      isMounted = false;
    };
  }, [values]);

  const visibleItems = items.filter((item) => item.media || item.value);

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div className="registration-media-preview">
      <style>{`
        .registration-media-preview {
          border: 1px solid var(--theme-elevation-150);
          border-radius: 6px;
          margin: 8px 0 20px;
          padding: 16px;
        }

        .registration-media-preview__title {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .registration-media-preview__grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        }

        .registration-media-preview__item {
          align-items: flex-start;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .registration-media-preview__label {
          color: var(--theme-elevation-700);
          font-size: 12px;
          font-weight: 600;
          margin: 0;
        }

        .registration-media-preview__button {
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 6px;
          cursor: zoom-in;
          height: 150px;
          overflow: hidden;
          padding: 0;
          width: 100%;
        }

        .registration-media-preview__button img {
          display: block;
          height: 100%;
          object-fit: contain;
          width: 100%;
        }

        .registration-media-preview__link {
          color: var(--theme-text);
          font-size: 13px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .registration-media-preview__empty {
          color: var(--theme-elevation-600);
          font-size: 13px;
          margin: 0;
        }

        .registration-media-preview__dialog {
          align-items: center;
          background: color-mix(in srgb, var(--theme-bg) 15%, #000 85%);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 32px;
          position: fixed;
          z-index: 9999;
        }

        .registration-media-preview__dialog button {
          background: transparent;
          border: 0;
          cursor: zoom-out;
          height: 100%;
          padding: 0;
          width: 100%;
        }

        .registration-media-preview__dialog img {
          display: block;
          max-height: 92vh;
          max-width: 92vw;
          object-fit: contain;
        }
      `}</style>
      <p className="registration-media-preview__title">Uploaded image previews</p>
      <div className="registration-media-preview__grid">
        {visibleItems.map((item) => {
          const assetURL = getAssetURL(item.media);
          const image = isImage(item.media);

          return (
            <div className="registration-media-preview__item" key={item.label}>
              <p className="registration-media-preview__label">{item.label}</p>
              {image ? (
                <button
                  aria-label={`View larger ${item.label.toLowerCase()}`}
                  className="registration-media-preview__button"
                  onClick={() => setActiveMedia(item.media)}
                  type="button"
                >
                  <img alt={item.media?.alt || item.media?.filename || item.label} src={assetURL} />
                </button>
              ) : assetURL ? (
                <a className="registration-media-preview__link" href={assetURL} rel="noreferrer" target="_blank">
                  Open uploaded file
                </a>
              ) : (
                <p className="registration-media-preview__empty">File selected. Save the entry to preview it here.</p>
              )}
            </div>
          );
        })}
      </div>
      {activeMedia?.url ? (
        <div
          aria-label="Image preview"
          className="registration-media-preview__dialog"
          onClick={() => setActiveMedia(null)}
          role="dialog"
        >
          <button aria-label="Close image preview" type="button">
            <img alt={activeMedia.alt || activeMedia.filename || "Uploaded image preview"} src={activeMedia.url} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
