import { 
  ipfs,
  Bytes,
  json,
  JSONValue,
  JSONValueKind,
  log
} from "@graphprotocol/graph-ts"

import { encode } from "./base32"
import { LegalEntity, OrganizationalUnit } from "../generated/schema"

// This function creates a CID v1 from the kccek256 hash of the JSON file
// Spec: https://github.com/multiformats/cid
export function cidFromHash(orgJsonHash: Bytes): string {
  // Determine CID values
  const version               = 0x01 // CIDv1 - https://github.com/multiformats/multicodec
  const codec                 = 0x55 // raw - https://github.com/multiformats/multicodec
  const multihashFunctionType = 0x1b // keccak-256 - https://multiformats.io/multihash/
  const multihashDigestlength = 0x20 // 256 bits   - https://multiformats.io/multihash/
  let multihashDigestValue  = orgJsonHash // Hex string without 0x prefix

  // Construct CID Raw Hex string
  let rawCid = new Bytes(orgJsonHash.length + 4)
  rawCid[0] = version;
  rawCid[1] = codec;
  rawCid[2] = multihashFunctionType;
  rawCid[3] = multihashDigestlength;

  for (let i = 0; i < multihashDigestValue.length; i++) {
    rawCid[i+4] = multihashDigestValue[i];
  }

  // Add `b` prefix for base32 - https://github.com/multiformats/multibase
  return 'b' + encode(rawCid)
}

// Retrieve organization from IPFS content
export function getLegalEntity(ipfsCid: string): LegalEntity | null {
  // Retrieve the Organization from IPFS
  let orgJsonBytes = ipfs.cat(ipfsCid)
  if(!orgJsonBytes) {
    log.warning('IPFS|{}|Could not retrieve CID', [ipfsCid])
    return null
  }

  // Extract JSON document
  let orgJsonValue = json.fromBytes(orgJsonBytes as Bytes)
  if(!orgJsonValue) {
    log.warning('IPFS|{}|Data retrieved is not JSON', [ipfsCid])
    return null
  }

  // Check the JSON type
  if(orgJsonValue.kind != JSONValueKind.OBJECT) {
    log.error('IPFS|{}|Unexpected JSON', [ipfsCid])
    return null
  }
  let orgJsonObject = orgJsonValue.toObject()

  // Check DID presence
  if(!orgJsonObject.isSet('id')) {
    log.error('IPFS|{}|Missing id', [ipfsCid])
    return null
  }
  let didValue = orgJsonObject.get('id')

  // Extract DID
  if(didValue.kind != JSONValueKind.STRING) {
    log.error('IPFS|{}|Unexpected type for id', [ipfsCid])
    return null
  }
  let did = didValue.toString()

  // Create the object
  let outputLegalEntity = LegalEntity.load(did)
  if(!outputLegalEntity) {
    outputLegalEntity = new LegalEntity(did)
  }
  
  // Check Legal Entity presence
  if(!orgJsonObject.isSet('legalEntity')) {
    log.error('IPFS|{}|Missing legalEntity', [ipfsCid])
    return null
  }
  let legalEntityValue = orgJsonObject.get('legalEntity')

  // Extract legal entity
  if(legalEntityValue.kind != JSONValueKind.OBJECT) {
    log.error('IPFS|{}|Unexpected type for legalEntity', [ipfsCid])
    return null
  }
  let legalEntityObject = legalEntityValue.toObject()

  // Check legal name presence
  if(!legalEntityObject.isSet('legalName')) {
    log.error('IPFS|{}|Missing legalName', [ipfsCid])
    return null
  }
  let legalNameValue = legalEntityObject.get('legalName')

  // Extract legal name
  if(legalNameValue.kind != JSONValueKind.STRING) {
    log.error('IPFS|{}|Unexpected type for legalName', [ipfsCid])
    return null
  }
  outputLegalEntity.legalName = legalNameValue.toString()

  // Check legal type presence
  if(!legalEntityObject.isSet('legalType')) {
    log.error('IPFS|{}|Missing legalType', [ipfsCid])
    return null
  }
  let legalTypeValue = legalEntityObject.get('legalType')

  // Extract legal type
  if(legalTypeValue.kind != JSONValueKind.STRING) {
    log.error('IPFS|{}|Unexpected type for legalType', [ipfsCid])
    return null
  }
  outputLegalEntity.legalType = legalTypeValue.toString()

  // Check registeredAddress
  if(legalEntityObject.isSet('registeredAddress')) {
    let registeredAddressValue = legalEntityObject.get('registeredAddress')
    if(registeredAddressValue.kind != JSONValueKind.OBJECT) {
      log.error('IPFS|{}|Unexpected type for registeredAddress', [ipfsCid])
      return null
    } else {
      let registeredAddressObject = registeredAddressValue.toObject()

      // Get Country
      if(registeredAddressObject.isSet('country')) {
        let registeredAddressCountryValue = registeredAddressObject.get('country')
        if(registeredAddressCountryValue.kind != JSONValueKind.STRING) {
          log.error('IPFS|{}|Unexpected type for registeredAddress/country', [ipfsCid])
          return null
        } else {
          outputLegalEntity.country = registeredAddressCountryValue.toString()
        }
      }
    }
  }

  // Check media
  if(orgJsonObject.isSet('media')) {
    let mediaValue = orgJsonObject.get('media')
    if(mediaValue.kind != JSONValueKind.OBJECT) {
      log.error('IPFS|{}|Unexpected type for media', [ipfsCid])
      return null
    } else {
      let mediaObject = mediaValue.toObject()

      // Get logo
      if(mediaObject.isSet('logo')) {
        let mediaLogoValue = mediaObject.get('logo')
        if(mediaLogoValue.kind != JSONValueKind.STRING) {
          log.error('IPFS|{}|Unexpected type for media/logo', [ipfsCid])
          return null
        } else {
          outputLegalEntity.logoUri = mediaLogoValue.toString()
        }
      }
    }
  }

  return outputLegalEntity

}

// Retrieve organization from IPFS content
export function getOrganizationalUnit(ipfsCid: string): OrganizationalUnit | null {
  // Retrieve the Organization from IPFS
  let orgJsonBytes = ipfs.cat(ipfsCid)
  if(!orgJsonBytes) {
    log.warning('IPFS|{}|Could not retrieve CID', [ipfsCid])
    return null
  }

  // Extract JSON document
  let orgJsonValue = json.fromBytes(orgJsonBytes as Bytes)
  if(!orgJsonValue) {
    log.warning('IPFS|{}|Data retrieved is not JSON', [ipfsCid])
    return null
  }

  // Check the JSON type
  if(orgJsonValue.kind != JSONValueKind.OBJECT) {
    log.error('IPFS|{}|Unexpected JSON', [ipfsCid])
    return null
  }
  let orgJsonObject = orgJsonValue.toObject()

  // Check DID presence
  if(!orgJsonObject.isSet('id')) {
    log.error('IPFS|{}|Missing id', [ipfsCid])
    return null
  }
  let didValue = orgJsonObject.get('id')

  // Extract DID
  if(didValue.kind != JSONValueKind.STRING) {
    log.error('IPFS|{}|Unexpected type for id', [ipfsCid])
    return null
  }
  let did = didValue.toString()

  // Create the object
  let outputOrganizationalUnit = OrganizationalUnit.load(did)
  if(!outputOrganizationalUnit) {
    outputOrganizationalUnit = new OrganizationalUnit(did)
  }
  
  // Check Legal Entity presence
  if(!orgJsonObject.isSet('organizationalUnit')) {
    log.error('IPFS|{}|Missing organizationalUnit', [ipfsCid])
    return null
  }
  let organizationalUnitValue = orgJsonObject.get('organizationalUnit')

  // Extract legal entity
  if(organizationalUnitValue.kind != JSONValueKind.OBJECT) {
    log.error('IPFS|{}|Unexpected type for organizationalUnit', [ipfsCid])
    return null
  }
  let organizationalUnitObject = organizationalUnitValue.toObject()

  // Check legal name presence
  if(!organizationalUnitObject.isSet('name')) {
    log.error('IPFS|{}|Missing name', [ipfsCid])
    return null
  }
  let nameValue = organizationalUnitObject.get('name')

  // Extract legal name
  if(nameValue.kind != JSONValueKind.STRING) {
    log.error('IPFS|{}|Unexpected type for name', [ipfsCid])
    return null
  }
  outputOrganizationalUnit.name = nameValue.toString()

  // Check legal type presence
  if(!organizationalUnitObject.isSet('type')) {
    log.error('IPFS|{}|Missing type', [ipfsCid])
    return null
  }
  let typeValue = organizationalUnitObject.get('type')

  // Extract legal type
  if(typeValue.kind != JSONValueKind.ARRAY) {
    log.error('IPFS|{}|Unexpected type for type', [ipfsCid])
    return null
  }
  let types: JSONValue[] = typeValue.toArray()
  for (let i: i32 = 0, len: i32 = types.length; i < len; i++) {
    if(types[i].kind != JSONValueKind.STRING) {
      log.error('IPFS|{}|Unexpected item type for type', [ipfsCid])
      return null
    } else {
      outputOrganizationalUnit.type.push(types[i].toString())
    }
  }

  // Check address
  if(organizationalUnitObject.isSet('address')) {
    let addressValue = organizationalUnitObject.get('address')
    if(addressValue.kind != JSONValueKind.OBJECT) {
      log.error('IPFS|{}|Unexpected type for address', [ipfsCid])
      return null
    } else {
      let addressObject = addressValue.toObject()

      // Get Country
      if(addressObject.isSet('country')) {
        let addressCountryValue = addressObject.get('country')
        if(addressCountryValue.kind != JSONValueKind.STRING) {
          log.error('IPFS|{}|Unexpected type for address/country', [ipfsCid])
          return null
        } else {
          outputOrganizationalUnit.country = addressCountryValue.toString()
        }
      }
    }
  }

  // Check media
  if(organizationalUnitObject.isSet('media')) {
    let mediaValue = organizationalUnitObject.get('media')
    if(mediaValue.kind != JSONValueKind.OBJECT) {
      log.error('IPFS|{}|Unexpected type for media', [ipfsCid])
      return null
    } else {
      let mediaObject = mediaValue.toObject()

      // Get logo
      if(mediaObject.isSet('logo')) {
        let mediaLogoValue = mediaObject.get('logo')
        if(mediaLogoValue.kind != JSONValueKind.STRING) {
          log.error('IPFS|{}|Unexpected type for media/logo', [ipfsCid])
          return null
        } else {
          outputOrganizationalUnit.logoUri = mediaLogoValue.toString()
        }
      }
    }
  }

  return outputOrganizationalUnit

}