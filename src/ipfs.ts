import { 
  //ipfs,
  //ByteArray,
  Bytes,
  log,
} from "@graphprotocol/graph-ts"

import { encode } from "./base32"
import { Organization } from "../generated/schema"

// This function creates a CID v1 from the kccek256 hash of the JSON file
// Spec: https://github.com/multiformats/cid
function cidFromHash(orgJsonHash: Bytes): string {
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

// Enrich organization with IPFS content
export function enrich(organization: Organization): void {
  organization.ipfsCid = cidFromHash(<Bytes>organization.orgJsonHash)
  log.warning('ORGiD: {} | Raw CID: {} ', [organization.id, organization.ipfsCid])
}
