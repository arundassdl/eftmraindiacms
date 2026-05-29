"use client";

import { useEffect, useMemo } from "react";
import { useField } from "@payloadcms/ui";

type Props = {
  field?: {
    admin?: {
      description?: string;
    };
    label?: string;
    required?: boolean;
  };
  path?: string;
};

function slugify(value?: string | null) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PractitionerCityField({ field, path: pathFromProps }: Props) {
  const path = pathFromProps || "cityLabel";
  const { setValue, value } = useField<string>({ path });
  const { setValue: setCityKey } = useField<string>({ path: "cityKey" });
  const generatedCityKey = useMemo(() => slugify(value), [value]);

  useEffect(() => {
    setCityKey(generatedCityKey);
  }, [generatedCityKey, setCityKey]);

  return (
    <div className="field-type text">
      <label className="field-label" htmlFor={`field-${path}`}>
        {typeof field?.label === "string" ? field.label : "City"}
        {field?.required ? <span className="required">*</span> : null}
      </label>
      <input
        className="field-type__input"
        id={`field-${path}`}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          setCityKey(slugify(nextValue));
        }}
        type="text"
        value={value || ""}
      />
      {field?.admin?.description ? <p className="field-description">{field.admin.description}</p> : null}
    </div>
  );
}

