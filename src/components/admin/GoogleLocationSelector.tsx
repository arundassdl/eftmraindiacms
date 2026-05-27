"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useField } from "@payloadcms/ui";

type GoogleLocationValue = {
  address?: string;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  name?: string;
  placeId?: string;
};

type Props = {
  field?: {
    admin?: {
      description?: string;
    };
    label?: string;
  };
  path?: string;
  readOnly?: boolean;
};

declare global {
  interface Window {
    google?: any;
    __eftmraGoogleMapsPromise?: Promise<void>;
  }
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

function parseLocationValue(value: unknown): GoogleLocationValue {
  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value) as GoogleLocationValue;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return { address: value };
  }

  return {};
}

function stringifyLocationValue(value: GoogleLocationValue) {
  const hasStructuredValue = value.placeId || value.lat || value.lng || value.mapUrl || value.name;
  if (!hasStructuredValue) return value.address || "";

  return JSON.stringify(value);
}

function loadGoogleMaps() {
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (window.__eftmraGoogleMapsPromise) {
    return window.__eftmraGoogleMapsPromise;
  }

  window.__eftmraGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-eftmra-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.eftmraGoogleMaps = "true";
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return window.__eftmraGoogleMapsPromise;
}

export default function GoogleLocationSelector({ field, path: pathFromProps, readOnly }: Props) {
  const path = pathFromProps || "venueGoogleMapLocation";
  const { setValue, value } = useField<string>({ path });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [loadError, setLoadError] = useState("");
  const selectedLocation = useMemo(() => parseLocationValue(value), [value]);
  const [inputValue, setInputValue] = useState(selectedLocation.name || selectedLocation.address || "");

  useEffect(() => {
    setInputValue(selectedLocation.name || selectedLocation.address || "");
  }, [selectedLocation.address, selectedLocation.name]);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !inputRef.current || autocompleteRef.current) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "name", "place_id", "url"],
          types: ["establishment", "geocode"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          const location = place?.geometry?.location;
          const nextValue: GoogleLocationValue = {
            address: place?.formatted_address || inputRef.current?.value || "",
            lat: typeof location?.lat === "function" ? location.lat() : undefined,
            lng: typeof location?.lng === "function" ? location.lng() : undefined,
            mapUrl: place?.url,
            name: place?.name,
            placeId: place?.place_id,
          };

          setInputValue(nextValue.name || nextValue.address || "");
          setValue(stringifyLocationValue(nextValue));
        });
      })
      .catch((error: Error) => {
        if (isMounted) setLoadError(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [setValue]);

  return (
    <div className="field-type text">
      <label className="field-label" htmlFor={`field-${path}`}>
        {typeof field?.label === "string" ? field.label : "Google Location Selector"}
      </label>
      <input
        className="field-type__input"
        disabled={readOnly}
        id={`field-${path}`}
        onChange={(event) => {
          setInputValue(event.target.value);
          setValue(event.target.value);
        }}
        placeholder="Search or paste a Google Maps location"
        ref={inputRef}
        type="text"
        value={inputValue}
      />
      <p className="field-description">
        {loadError || field?.admin?.description || "Start typing to select a Google Maps location."}
      </p>
      {selectedLocation.address && selectedLocation.name ? (
        <p className="field-description">
          Selected address: {selectedLocation.address}
        </p>
      ) : null}
    </div>
  );
}
