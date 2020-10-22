import { 
  ipfs,
  Bytes,
  JSONValue,
  Value
} from "@graphprotocol/graph-ts"

import { encode } from "./base32"
import { Organization } from "../generated/schema"

// This function creates a CID v1 from the kccek256 hash of the JSON file
// Spec: https://github.com/multiformats/cid
export function cidFromHash(orgJsonHash: Bytes): string {
  // Determine CID values
  const version               = '01' // CIDv1 - https://github.com/multiformats/multicodec
  const codec                 = '55' // raw - https://github.com/multiformats/multicodec
  const multihashFunctionType = '1b' // keccak-256 - https://multiformats.io/multihash/
  const multihashDigestlength = '20' // 256 bits   - https://multiformats.io/multihash/
  let multihashDigestValue  = orgJsonHash.toHexString().slice(2) // Hex string without 0x prefix

  // Construct CID Raw Hex string
  let rawCid: Bytes = Bytes.fromHexString(
    version +
    codec +
    multihashFunctionType +
    multihashDigestlength +
    multihashDigestValue
  ) as Bytes

  // Add `b` prefix for base32 - https://github.com/multiformats/multibase
  return 'b' + encode(rawCid)
}

export function processOrganizationJson(value: JSONValue, userData: Value): void {
  // Extract details from JSON document
  let org = value.toObject()
  let legalEntity = org.get('legalEntity').toObject()

  // Callbacks can also created entities
  let organization = Organization.load(userData.toString())
  organization.legalName = legalEntity.get('legalName').toString()
  organization.save()
}

// Enrich organization with IPFS content
export function enrichOrganization(organization: Organization): void {
  ipfs.mapJSON(organization.ipfsCid, 'processOrganizationJson', Value.fromString(organization.id))
}
