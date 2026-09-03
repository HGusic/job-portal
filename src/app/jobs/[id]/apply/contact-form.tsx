"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  contactStorageKey,
  normalizeContactInfo,
  type ContactInfo,
  US_STATES,
  validateContactInfo,
} from "@/lib/apply-contact";

const emptyContact: ContactInfo = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  zipCode: "",
  state: "",
};

export function ContactForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactInfo>(emptyContact);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(contactStorageKey(jobId));
    if (raw) {
      try {
        setContact({ ...emptyContact, ...(JSON.parse(raw) as ContactInfo) });
      } catch {
        // ignore corrupt draft
      }
    }
    setReady(true);
  }, [jobId]);

  function onNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const next = normalizeContactInfo({
      firstName: String(form.get("firstName") ?? ""),
      middleName: String(form.get("middleName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      zipCode: String(form.get("zipCode") ?? ""),
      state: String(form.get("state") ?? ""),
    });

    const validationError = validateContactInfo(next);
    if (validationError) {
      setError(validationError);
      return;
    }

    sessionStorage.setItem(contactStorageKey(jobId), JSON.stringify(next));
    router.push(`/jobs/${jobId}/apply/details`);
  }

  if (!ready) {
    return <p className="text-sm text-[#5b675f]">Loading…</p>;
  }

  return (
    <form
      onSubmit={onNext}
      className="space-y-5 rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6"
      noValidate
    >
      <h2 className="text-lg font-semibold">Contact information</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block sm:col-span-1">
          <span className="text-sm font-medium">First name</span>
          <input
            name="firstName"
            required
            maxLength={100}
            defaultValue={contact.firstName}
            autoComplete="given-name"
            className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="text-sm font-medium">Middle name (optional)</span>
          <input
            name="middleName"
            maxLength={100}
            defaultValue={contact.middleName}
            autoComplete="additional-name"
            className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="text-sm font-medium">Last name</span>
          <input
            name="lastName"
            required
            maxLength={100}
            defaultValue={contact.lastName}
            autoComplete="family-name"
            className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Address</span>
        <input
          name="address"
          required
          maxLength={300}
          defaultValue={contact.address}
          autoComplete="street-address"
          className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Zip code</span>
          <input
            name="zipCode"
            required
            inputMode="numeric"
            pattern="\d{5}(-\d{4})?"
            title="12345 or 12345-6789"
            defaultValue={contact.zipCode}
            autoComplete="postal-code"
            className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">State</span>
          <select
            name="state"
            required
            defaultValue={contact.state}
            autoComplete="address-level1"
            className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
          >
            <option value="" disabled>
              Select state
            </option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={320}
          defaultValue={contact.email}
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Phone</span>
        <input
          name="phone"
          type="tel"
          required
          maxLength={40}
          defaultValue={contact.phone}
          autoComplete="tel"
          className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
      >
        Next
      </button>
    </form>
  );
}
