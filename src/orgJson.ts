import { 
  json,
  JSONValue,
  JSONValueKind,
  log,
  TypedMap
} from "@graphprotocol/graph-ts"
  
import { getJson } from "./ipfs"
import { LegalEntity, OrganizationalUnit, OrganizationAddress, Organization } from "../generated/schema"

// Get safely a property of an object
function safeGet(jsonObject: TypedMap<string, JSONValue>, expectedKind: JSONValueKind, property: string,): JSONValue | null {
    // Check presence
    if(!jsonObject.isSet(property)) {
      log.error('OrgJSON|{}|Missing property', [property])
      return null
    }

    // Get the property value
    let value = jsonObject.get(property)
    if(value.kind != expectedKind) {
      log.error('OrgJSON|{}|Unexpected kind', [property])
      return null
    }

    return value
}

// Convert a JSON Value to an Address
function toAddress(did: string, jsonValue: JSONValue): OrganizationAddress | null {
  let jsonObject = jsonValue.toObject()
  let outputAddress = OrganizationAddress.load(`addr:${did}`)
  if(!outputAddress) {
    outputAddress = new OrganizationAddress(did)
  }

  outputAddress.country = safeGet(jsonObject, JSONValueKind.STRING, 'country').toString()
  outputAddress.subdivision = safeGet(jsonObject, JSONValueKind.STRING, 'subdivision').toString()
  outputAddress.locality = safeGet(jsonObject, JSONValueKind.STRING, 'locality').toString()
  outputAddress.streetAddress = safeGet(jsonObject, JSONValueKind.STRING, 'streetAddress').toString()
  outputAddress.postalCode = safeGet(jsonObject, JSONValueKind.STRING, 'postalCode').toString()

  return outputAddress

}

// Convert a JSON Value to legal entity
function toLegalEntity(jsonValue: JSONValue): LegalEntity | null {
  // Convert to object
  let jsonObject = jsonValue.toObject()
      
  // Process DID
  let didValue = safeGet(jsonObject, JSONValueKind.STRING, 'id')
  if(!didValue) {
    log.error('orgJson|{}|Missing did', [])
    return null
  }
  let did = didValue.toString()
  let outputLegalEntity = LegalEntity.load(did)
  if(!outputLegalEntity) {
    outputLegalEntity = new LegalEntity(did)
  }
  
  // Handle Legal Entity
  let legalEntityValue = safeGet(jsonObject, JSONValueKind.OBJECT, 'legalEntity')
  if(!legalEntityValue) {
    log.error('orgJson|{}|Missing legalEntityValue', [did])
    return null
  }
  let legalEntityObject = legalEntityValue.toObject()
  
  // Handle legal name presence
  outputLegalEntity.legalName = safeGet(legalEntityObject, JSONValueKind.STRING, 'legalName').toString()
  outputLegalEntity.legalType = safeGet(legalEntityObject, JSONValueKind.STRING, 'legalType').toString()
  outputLegalEntity.legalIdentifier = safeGet(legalEntityObject, JSONValueKind.STRING, 'legalIdentifier').toString()
  
  // Handle the address
  let addressValue = safeGet(legalEntityObject, JSONValueKind.OBJECT, 'registeredAddress')
  if(addressValue) {
    let address = toAddress(did, addressValue as JSONValue)
    if(address) {
      address.save()
      outputLegalEntity.registeredAddress = address.id
    }
  }

  return outputLegalEntity
}

// Convert a JSON Value to an organizational unit
function toOrganizationalUnit(jsonValue: JSONValue): OrganizationalUnit | null {
  // Convert to object
  let jsonObject = jsonValue.toObject()
      
  // Process DID
  let didValue = safeGet(jsonObject, JSONValueKind.STRING, 'id')
  if(!didValue) {
    log.error('orgJson|{}|Missing did', [])
    return null
  }
  let did = didValue.toString()
  let outputOrganizationalUnit = OrganizationalUnit.load(did)
  if(!outputOrganizationalUnit) {
    outputOrganizationalUnit = new OrganizationalUnit(did)
  }
  
  // Handle Legal Entity
  let outputOrganizationalUnitValue = safeGet(jsonObject, JSONValueKind.OBJECT, 'organizationalUnit')
  if(!outputOrganizationalUnitValue) {
    log.error('orgJson|{}|Missing organizationalUnit', [did])
    return null
  }
  let organizationalUnitObject = outputOrganizationalUnitValue.toObject()
  
  // Handle legal name presence
  outputOrganizationalUnit.name = safeGet(organizationalUnitObject, JSONValueKind.STRING, 'name').toString()
  let types: Array<JSONValue> = safeGet(organizationalUnitObject, JSONValueKind.ARRAY, 'type').toArray()
  
  outputOrganizationalUnit.type = types.map<string>((value: JSONValue) => value.toString())
  outputOrganizationalUnit.description = safeGet(organizationalUnitObject, JSONValueKind.STRING, 'description').toString()
  outputOrganizationalUnit.longDescription = safeGet(organizationalUnitObject, JSONValueKind.STRING, 'longDescription').toString()

  // Handle the address
  let addressValue = safeGet(organizationalUnitObject, JSONValueKind.OBJECT, 'address')
  if(addressValue) {
    let address = toAddress(did, addressValue as JSONValue)
    if(address) {
      address.save()
      outputOrganizationalUnit.address = address.id
    }
  }

  return outputOrganizationalUnit
}

// Retrieve Legal Entity from IPFS content
export function getLegalEntity(ipfsCid: string): LegalEntity | null {
  
  // Extract JSON document
  let orgJsonValue = getJson(ipfsCid, JSONValueKind.OBJECT)
  if(!orgJsonValue) {
    log.warning('LegalEntity|{}|Error fetching JSON', [ipfsCid])
    return null
  }

  // Extract legal entity
  let legalEntity = toLegalEntity(orgJsonValue as JSONValue)
  if(!legalEntity) {
    log.warning('LegalEntity|{}|Error parsing JSON', [ipfsCid])
    return null
  }

  return legalEntity

}


// Retrieve Organizational Unit from IPFS content
export function getOrganizationalUnit(ipfsCid: string): OrganizationalUnit | null {
  
  // Extract JSON document
  let orgJsonValue = getJson(ipfsCid, JSONValueKind.OBJECT)
  if(!orgJsonValue) {
    log.warning('OrganizationalUnit|{}|Error fetching JSON', [ipfsCid])
    return null
  }

  // Extract Organizational Unit
  let organizationalUnit = toOrganizationalUnit(orgJsonValue as JSONValue)
  if(!organizationalUnit) {
    log.warning('OrganizationalUnit|{}|Error parsing JSON', [ipfsCid])
    return null
  }

  return organizationalUnit

}