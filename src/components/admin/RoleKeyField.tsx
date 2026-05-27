"use client";

import { useEffect, useMemo } from "react";
import { useField, useOperation } from "@payloadcms/ui";

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

function normalizeRoleKey(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export default function RoleKeyField({ field, path: pathFromProps }: Props) {
  const operation = useOperation();
  const path = pathFromProps || "value";
  const { setValue, value } = useField<string>({ path });
  const { value: labelValue } = useField<string>({ path: "label" });
  const generatedValue = useMemo(() => normalizeRoleKey(labelValue), [labelValue]);
  const isCreate = operation === "create";

  useEffect(() => {
    if (!isCreate) return;
    setValue(generatedValue);
  }, [generatedValue, isCreate, setValue]);

  return (
    <div className="field-type text">
      <label className="field-label" htmlFor={`field-${path}`}>
        {typeof field?.label === "string" ? field.label : "Role Key"}
        {field?.required ? <span className="required">*</span> : null}
      </label>
      <input
        className="field-type__input"
        id={`field-${path}`}
        readOnly
        type="text"
        value={isCreate ? generatedValue : value || ""}
      />
      <p className="field-description">
        {field?.admin?.description || "Auto-generated from the role name."}
      </p>
    </div>
  );
}
