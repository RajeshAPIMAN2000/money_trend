/**
 * Nominee status helpers — used to skip the add-nominee step once complete.
 */

export function hasNomineeAdded(source) {
  if (!source || typeof source !== 'object') return false
  const nominee = source.nominee ?? source
  if (source.nominee_added === true || source.registration_complete === true) return true
  if (nominee?.added === true) return true
  if (nominee?.nominee_name || nominee?.name) return true
  return false
}

export function parseProfileNominee(payload) {
  const root = payload?.data ?? payload ?? {}
  const nominee = root.nominee ?? null
  const added = hasNomineeAdded(root)

  return {
    profile: root,
    nominee: added
      ? {
          added: true,
          name: nominee?.nominee_name ?? nominee?.name ?? '—',
          relationship: nominee?.relationship ?? '—',
          dob: nominee?.date_of_birth ?? nominee?.dob ?? '—',
          mobile: nominee?.mobile ?? nominee?.phone ?? '—',
          email: nominee?.email ?? '—',
          status: nominee?.status ?? 'active',
        }
      : { added: false, message: nominee?.message ?? 'Nominee not added' },
    added,
  }
}
